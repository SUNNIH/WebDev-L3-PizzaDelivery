import mongoose from 'mongoose';
import crypto from 'crypto';

const authTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  tokenHash: {
    type: String,
    required: true,
    unique: true,
  },
  type: {
    type: String,
    enum: ['verification', 'passwordReset'],
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  used: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Cleanup expired tokens automatically
authTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 86400 });

// Static method to generate and hash token
authTokenSchema.statics.generateToken = function() {
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  return { token, tokenHash };
};

// Static method to create verification token (24 hour expiry)
authTokenSchema.statics.createVerificationToken = async function(userId) {
  const { token, tokenHash } = this.generateToken();
  
  await this.create({
    userId,
    tokenHash,
    type: 'verification',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
  });
  
  return token;
};

// Static method to create password reset token (1 hour expiry)
authTokenSchema.statics.createPasswordResetToken = async function(userId) {
  const { token, tokenHash } = this.generateToken();
  
  // Invalidate all previous password reset tokens for this user
  await this.updateMany(
    { userId, type: 'passwordReset', used: false },
    { used: true }
  );
  
  await this.create({
    userId,
    tokenHash,
    type: 'passwordReset',
    expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
  });
  
  return token;
};

// Static method to verify and consume token
authTokenSchema.statics.verifyAndConsumeToken = async function(token, type) {
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  
  const authToken = await this.findOne({
    tokenHash,
    type,
    used: false,
    expiresAt: { $gt: new Date() },
  });
  
  if (!authToken) {
    return null;
  }
  
  // Mark as used (single-use)
  authToken.used = true;
  await authToken.save();
  
  return authToken.userId;
};

export default mongoose.model('AuthToken', authTokenSchema);
