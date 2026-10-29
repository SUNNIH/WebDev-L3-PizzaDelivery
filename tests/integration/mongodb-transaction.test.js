import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import mongoose from 'mongoose';

describe('MongoDB Transaction Tests - OD-09 Phase 1 Harness', () => {
  let replSet;
  let TestModel;

  beforeAll(async () => {
    // Create in-memory MongoDB replica set with WiredTiger
    replSet = await MongoMemoryReplSet.create({
      replSet: {
        count: 1,
        storageEngine: 'wiredTiger',
      },
    });

    const uri = replSet.getUri();
    await mongoose.connect(uri);

    // Create a test schema and model
    const testSchema = new mongoose.Schema({
      name: String,
      value: Number,
    });
    TestModel = mongoose.model('TestDoc', testSchema);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await replSet.stop();
  });

  it('should successfully commit a transaction', async () => {
    const session = await mongoose.startSession();
    
    try {
      await session.withTransaction(async () => {
        await TestModel.create([{ name: 'test1', value: 100 }], { session });
        await TestModel.create([{ name: 'test2', value: 200 }], { session });
      });

      // Verify documents were persisted
      const docs = await TestModel.find({});
      expect(docs).toHaveLength(2);
      expect(docs[0].name).toBe('test1');
      expect(docs[1].name).toBe('test2');
    } finally {
      await session.endSession();
      await TestModel.deleteMany({});
    }
  });

  it('should rollback a transaction on error with no state change', async () => {
    const session = await mongoose.startSession();

    // Record initial state
    await TestModel.create({ name: 'existing', value: 50 });
    const initialCount = await TestModel.countDocuments();
    expect(initialCount).toBe(1);

    try {
      await session.withTransaction(async () => {
        // Create a document
        await TestModel.create([{ name: 'will-rollback', value: 300 }], { session });
        
        // Throw an error to trigger rollback
        throw new Error('Intentional rollback');
      });
    } catch (error) {
      expect(error.message).toBe('Intentional rollback');
    } finally {
      await session.endSession();
    }

    // Verify no state change - rollback was clean
    const finalCount = await TestModel.countDocuments();
    const finalDocs = await TestModel.find({});
    
    expect(finalCount).toBe(1);
    expect(finalDocs[0].name).toBe('existing');
    expect(finalDocs.find(d => d.name === 'will-rollback')).toBeUndefined();

    // Cleanup
    await TestModel.deleteMany({});
  });

  it('should verify replica set is using WiredTiger storage engine', async () => {
    const adminDb = mongoose.connection.db.admin();
    const serverStatus = await adminDb.serverStatus();
    
    expect(serverStatus.storageEngine.name).toBe('wiredTiger');
  });

  it('should support multiple concurrent transactions', async () => {
    const session1 = await mongoose.startSession();
    const session2 = await mongoose.startSession();

    try {
      await Promise.all([
        session1.withTransaction(async () => {
          await TestModel.create([{ name: 'concurrent1', value: 1 }], { session: session1 });
        }),
        session2.withTransaction(async () => {
          await TestModel.create([{ name: 'concurrent2', value: 2 }], { session: session2 });
        }),
      ]);

      const docs = await TestModel.find({});
      expect(docs).toHaveLength(2);
      expect(docs.map(d => d.name).sort()).toEqual(['concurrent1', 'concurrent2']);
    } finally {
      await session1.endSession();
      await session2.endSession();
      await TestModel.deleteMany({});
    }
  });
});
