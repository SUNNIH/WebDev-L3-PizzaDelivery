import { useEffect, useId, useState } from 'react';
import './index.css';

// SUNNYS Pizza visual prototype. No authentication, orders, or payments are sent.
// Backend flows must be connected only after their phase decisions are approved.
const PIZZAS = [
  { name: 'Sunny Supreme', description: 'Roasted peppers, mozzarella, basil & juicy tomatoes', price: '₦12,900', kind: 'supreme', label: 'Most loved', score: '4.9' },
  { name: 'Pepperoni Glow', description: 'A generous layer of pepperoni with our signature sauce', price: '₦14,500', kind: 'pepperoni', label: 'Bestseller', score: '4.8' },
  { name: 'Garden Fresh', description: 'Colourful vegetables, black olives & fresh herbs', price: '₦10,900', kind: 'veggie', label: 'Vegetarian', score: '4.9' },
];

// Optional local pizza photography. Keep values null until you have licensed/owned photos.
// Later, put images in client/public/images and set, for example,
// supreme: '/images/sunny-supreme.webp'. SVG illustrations remain fallbacks.
const PIZZA_PHOTOS = {
  hero: null,
  auth: null,
  banner: null,
  supreme: null,
  pepperoni: null,
  veggie: null,
};

function PizzaMark({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path d="M8 10C20 4 34 9 43 19L20 43Z" fill="#F8A72C" stroke="#6F3415" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M8 10C20 4 34 9 43 19" fill="none" stroke="#FFE09C" strokeWidth="6" strokeLinecap="round" />
      <circle cx="23" cy="19" r="4.3" fill="#DD4B36" /><circle cx="31" cy="26" r="4" fill="#DD4B36" />
      <circle cx="17" cy="28" r="3.5" fill="#205735" /><path d="M29 11l3-7M39 12l5-4" stroke="#00D276" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function Brand({ onClick, compact = false }) {
  return (
    <button className={`brand ${compact ? 'brand--compact' : ''}`} onClick={onClick} aria-label="SUNNYS Pizza — go to home" type="button">
      <PizzaMark size={compact ? 34 : 41} />
      <span className="brand__type"><strong>SUNNYS</strong><em>Pizza</em></span>
    </button>
  );
}

// Original vector pizza illustration, no downloaded photos or third-party artwork.
function PizzaArt({ kind = 'supreme', className = '' }) {
  const uid = useId().replace(/:/g, '');
  const pepperoni = kind === 'pepperoni';
  const toppings = [
    [159, 140, 21], [274, 126, 19], [348, 183, 22], [175, 303, 20],
    [310, 306, 23], [235, 238, 17], [118, 225, 17], [378, 275, 13],
  ];
  return (
    <svg className={`pizza-art ${className}`} viewBox="0 0 500 500" role="img" aria-label="Illustration of a freshly baked pizza with colourful toppings">
      <defs>
        <radialGradient id={`${uid}crust`}><stop stopColor="#F9C35C" /><stop offset=".76" stopColor="#F0A744"/><stop offset="1" stopColor="#9B4D20"/></radialGradient>
        <radialGradient id={`${uid}cheese`}><stop stopColor="#FFE9A3" /><stop offset=".72" stopColor="#F6CB6B"/><stop offset="1" stopColor="#DC7D3F"/></radialGradient>
        <radialGradient id={`${uid}sauce`}><stop stopColor="#F36B39"/><stop offset="1" stopColor="#B73723"/></radialGradient>
        <filter id={`${uid}shadow`} x="-25%" y="-25%" width="150%" height="150%"><feGaussianBlur stdDeviation="12"/></filter>
      </defs>
      <ellipse cx="254" cy="461" rx="204" ry="23" fill="#000" opacity=".35" filter={`url(#${uid}shadow)`}/>
      <circle cx="250" cy="245" r="219" fill={`url(#${uid}crust)`}/>
      <circle cx="250" cy="245" r="194" fill={`url(#${uid}sauce)`}/>
      <circle cx="250" cy="245" r="185" fill={`url(#${uid}cheese)`}/>
      <path d="M250 58V432M75 166L424 321M100 365L395 125M55 246H445" stroke="#C8793E" strokeWidth="3" opacity=".28"/>
      {toppings.map(([x, y, r], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={r + (pepperoni ? 5 : 0)} fill={pepperoni ? '#B6352D' : '#CB3D2F'} stroke="#F37C49" strokeWidth="4" />
          <circle cx={x - 6} cy={y - 5} r="3" fill="#F9B177" opacity=".75" />
          <circle cx={x + 7} cy={y + 7} r="2.5" fill="#A52F26" opacity=".65" />
        </g>
      ))}
      {!pepperoni && (
        <g fill="none" stroke="#398943" strokeWidth="10" strokeLinecap="round">
          <path d="M136 176q24-35 47 3"/><path d="M287 203q26-32 48 5"/><path d="M214 352q20-34 48-8"/><path d="M336 353q-7-42 27-49"/>
        </g>
      )}
      <g fill="none" stroke="#272422" strokeWidth="8">
        <circle cx="224" cy="156" r="10"/><circle cx="360" cy="238" r="10"/><circle cx="148" cy="258" r="10"/>
        <circle cx="276" cy="368" r="10"/><circle cx="312" cy="157" r="9"/>
      </g>
      <g fill="#2D8343">
        <ellipse cx="258" cy="100" rx="9" ry="18" transform="rotate(28 258 100)"/>
        <ellipse cx="266" cy="108" rx="8" ry="17" transform="rotate(-30 266 108)"/>
        <ellipse cx="195" cy="274" rx="8" ry="18" transform="rotate(-30 195 274)"/>
        <ellipse cx="205" cy="275" rx="8" ry="17" transform="rotate(29 205 275)"/>
      </g>
      <circle cx="250" cy="245" r="209" fill="none" stroke="#FFE39B" strokeWidth="5" opacity=".5" />
    </svg>
  );
}

function PizzaVisual({ kind = 'supreme', placement, className = '' }) {
  const imageSrc = PIZZA_PHOTOS[placement || kind];
  if (imageSrc) {
    return (
      <img
        className={`pizza-photo ${className}`.trim()}
        src={imageSrc}
        alt={`${kind === 'veggie' ? 'Vegetarian' : kind === 'pepperoni' ? 'Pepperoni' : 'Supreme'} pizza with fresh toppings`}
        loading={placement === 'hero' ? 'eager' : 'lazy'}
      />
    );
  }
  return <PizzaArt kind={kind} className={className} />;
}

function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === 'dark';
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={onToggle}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      aria-pressed={!isDark}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? (
        <svg viewBox="0 0 24 24" width="19" height="19" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
      ) : (
        <svg viewBox="0 0 24 24" width="19" height="19" fill="none" aria-hidden="true"><path d="M20.5 14.1A8.5 8.5 0 019.9 3.5 8.5 8.5 0 1020.5 14.1Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></svg>
      )}
      <span className="theme-toggle__label">{isDark ? 'Light' : 'Dark'} mode</span>
    </button>
  );
}

function ArrowIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function SiteHeader({ onNavigate, view, theme, onToggleTheme }) {
  return (
    <header className="site-header">
      <div className="shell site-header__inner">
        <Brand onClick={() => onNavigate('home')} />
        <nav className="header-links" aria-label="Primary navigation">
          <button type="button" className={view === 'home' ? 'is-active' : ''} onClick={() => onNavigate('home')}>Home</button>
          <button type="button" onClick={() => { onNavigate('home'); setTimeout(() => document.querySelector('#menu')?.scrollIntoView({ behavior: 'smooth' }), 50); }}>Our pizzas</button>
          <button type="button" onClick={() => onNavigate('register')}>Join SUNNYS</button>
        </nav>
        <div className="header-actions">
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          <button type="button" className="button button--ghost header-signin" onClick={() => onNavigate('login')}>Sign in</button>
          <button type="button" className="button button--primary header-order" onClick={() => onNavigate('register')}>Get started <ArrowIcon /></button>
        </div>
      </div>
    </header>
  );
}

function Home({ onNavigate, onNotice }) {
  const [category, setCategory] = useState('All pizzas');
  const categories = ['All pizzas', 'Chicken', 'Vegetarian', 'Pepperoni'];
  const visiblePizzas = category === 'Vegetarian' ? PIZZAS.filter(p => p.kind === 'veggie')
    : category === 'Pepperoni' ? PIZZAS.filter(p => p.kind === 'pepperoni') : PIZZAS;
  return (
    <>
      <main>
        <section className="hero shell">
          <div className="hero__text">
            <div className="eyebrow"><span className="eyebrow__dot"/> FRESHLY MADE. ALWAYS SUNNY.</div>
            <h1>Good food.<br/><span>Brighter days.</span></h1>
            <p>Big flavours, fresh ingredients and the kind of pizza that makes every moment feel a little brighter.</p>
            <div className="hero__actions">
              <button className="button button--primary button--large" type="button" onClick={() => document.querySelector('#menu')?.scrollIntoView({ behavior: 'smooth' })}>Explore the menu <ArrowIcon /></button>
              <button className="button button--outline button--large" type="button" onClick={() => onNavigate('register')}>Create an account</button>
            </div>
            <div className="hero__trust"><span className="trust-stars">★★★★★</span> <span>Made with love, served with sunshine</span></div>
          </div>
          <div className="hero__visual">
            <div className="hero__halo"/>
            <div className="hero__pizza"><PizzaVisual placement="hero" /></div>
            <div className="floating-tag floating-tag--top"><span>🌿</span> Fresh ingredients</div>
            <div className="floating-tag floating-tag--bottom"><span>🍕</span> Every slice, a smile</div>
          </div>
        </section>
        <section className="value-strip" aria-label="SUNNYS Pizza highlights"><div className="shell value-strip__inner"><span>✳ MADE FRESH</span><span>◆ BOLD FLAVOURS</span><span>✳ YOUR WAY</span><span>◆ GOOD MOOD FOOD</span></div></section>
        <section className="menu-section shell" id="menu">
          <div className="section-heading"><div><p className="section-kicker">THE GOOD STUFF</p><h2>Meet your new <span>favourites.</span></h2><p>Something delicious for every kind of craving.</p></div><span className="sample-label">Preview menu · sample prices</span></div>
          <div className="categories" role="group" aria-label="Pizza categories">{categories.map(item => <button key={item} className={`category-chip ${category === item ? 'category-chip--active' : ''}`} onClick={() => setCategory(item)} type="button">{item === 'All pizzas' ? '🍕' : item === 'Chicken' ? '🍗' : item === 'Vegetarian' ? '🥬' : '🌶️'} {item}</button>)}</div>
          <div className="pizza-grid">{visiblePizzas.map(pizza => <article className="pizza-card" key={pizza.name}><div className={`pizza-card__art pizza-card__art--${pizza.kind}`}><span className="pizza-card__badge">{pizza.label}</span><PizzaVisual kind={pizza.kind}/></div><div className="pizza-card__body"><div className="pizza-card__rating"><span>★</span> {pizza.score} <span className="rating-note">Customer favourite</span></div><h3>{pizza.name}</h3><p>{pizza.description}</p><div className="pizza-card__footer"><div><small>Starting from</small><strong>{pizza.price}</strong></div><button type="button" aria-label={`Preview ${pizza.name}`} onClick={() => onNotice('Pizza ordering and customisation are coming in Phase 3. This is a design preview.')}>View pizza <ArrowIcon /></button></div></div></article>)}</div>
        </section>
        <section className="banner shell"><div className="banner__glow"/><div><p className="section-kicker">THE SUNNYS WAY</p><h2>A little sunshine<br/>in every slice.</h2><p>Create your account now. The full pizza builder will arrive in a later development phase.</p><button type="button" className="button button--light" onClick={() => onNavigate('register')}>Join SUNNYS <ArrowIcon /></button></div><div className="banner__art"><PizzaVisual placement="banner" kind="pepperoni" /></div></section>
      </main>
    </>
  );
}

function TextField({ id, label, type = 'text', placeholder, autoComplete, required = true }) {
  return <label className="field" htmlFor={id}><span className="field__label">{label}</span><input id={id} name={id} type={type} placeholder={placeholder} autoComplete={autoComplete} required={required}/></label>;
}

function PasswordField({ id = 'password', label = 'Password', autoComplete = 'current-password' }) {
  const [show, setShow] = useState(false);
  return <div className="field"><label className="field__label" htmlFor={id}>{label}</label><div className="password-wrap"><input id={id} name={id} type={show ? 'text' : 'password'} placeholder="Enter your password" autoComplete={autoComplete} minLength={8} required/><button type="button" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'}>{show ? 'Hide' : 'Show'}</button></div></div>;
}

function AuthPage({ view, onNavigate, onNotice }) {
  const isLogin = view === 'login';
  const isRegister = view === 'register';
  const isForgot = view === 'forgot';
  const headings = {
    login: ['Welcome back 👋', 'Sign in to your SUNNYS Pizza account.'],
    register: ['Create your account', 'Your next favourite pizza is one step closer.'],
    forgot: ['Forgot password?', "Enter your email. We'll help you get back in."],
    verify: ['Check your inbox ✉', 'Email verification will be enabled when the Phase 2 backend is connected.'],
  };
  function handleSubmit(event) {
    event.preventDefault();
    onNotice('Design preview only. No data was submitted; authentication services will be connected in Phase 2.');
  }
  return (
    <main className="auth-page shell">
      <section className="auth-story" aria-label="SUNNYS Pizza welcome"><div className="auth-story__orbs"/><span className="auth-story__tag">MADE FOR PIZZA LOVERS</span><div className="auth-story__art"><PizzaVisual placement="auth" /></div><div className="auth-story__copy"><span className="section-kicker">WELCOME TO SUNNYS</span><h2>Satisfy your<br/><em>pizza cravings.</em></h2><p>Fresh flavours and brighter moments are just around the corner.</p><div className="story-dots"><i/><i/><i/></div></div></section>
      <section className="auth-panel"><div className="auth-panel__top"><button type="button" onClick={() => onNavigate('home')} className="back-link">← Back to home</button><span className="preview-badge">DESIGN PREVIEW</span></div><div className="auth-panel__content"><div className="auth-panel__brand"><Brand compact onClick={() => onNavigate('home')}/></div><h1>{headings[view][0]}</h1><p className="auth-panel__subtitle">{headings[view][1]}</p>
        {view === 'verify' ? <div className="verify-view"><span className="verify-icon">✉</span><p>In the finished application, customers will receive a secure, single-use verification link here.</p><button className="button button--primary button--full" type="button" onClick={() => onNavigate('login')}>Back to sign in <ArrowIcon /></button></div>
          : <form onSubmit={handleSubmit} className="auth-form">
              {isRegister && <TextField id="fullName" label="Full name" placeholder="Enter your full name" autoComplete="name" />}
              <TextField id="email" label="Email address" type="email" placeholder="you@example.com" autoComplete="email" />
              {!isForgot && <PasswordField autoComplete={isRegister ? 'new-password' : 'current-password'}/>}
              {isRegister && <><PasswordField id="confirmPassword" label="Confirm password" autoComplete="new-password"/><p className="form-hint">Use at least 8 characters. Full validation will be added with authentication.</p></>}
              {isLogin && <div className="form-row"><span className="muted-caption">Secure account access</span><button type="button" className="text-link" onClick={() => onNavigate('forgot')}>Forgot password?</button></div>}
              <button className="button button--primary button--full auth-submit" type="submit">{isLogin ? 'Sign in' : isRegister ? 'Create account' : 'Send reset link'} <ArrowIcon /></button>
            </form>}
        {isLogin && <p className="switch-view">Don't have an account? <button type="button" onClick={() => onNavigate('register')}>Sign up</button></p>}
        {isRegister && <p className="switch-view">Already have an account? <button type="button" onClick={() => onNavigate('login')}>Sign in</button></p>}
        {isForgot && <p className="switch-view">Remember your password? <button type="button" onClick={() => onNavigate('login')}>Back to sign in</button></p>}
        {(isRegister || isLogin) && <div className="auth-extra"><span>Looking for the email confirmation screen?</span><button type="button" onClick={() => onNavigate('verify')}>Preview verification →</button></div>}
        <p className="auth-disclaimer">This is a visual UI prototype. Authentication, email delivery and account creation are not active.</p>
      </div></section>
    </main>
  );
}

function SiteFooter({ onNavigate }) {
  return <footer className="site-footer"><div className="shell site-footer__inner"><Brand compact onClick={() => onNavigate('home')}/><p>Good food. Brighter days.</p><span>© {new Date().getFullYear()} SUNNYS Pizza · UI preview</span></div></footer>;
}

const VALID_VIEWS = new Set(['home', 'login', 'register', 'forgot', 'verify']);
function getView() {
  const hash = window.location.hash.replace('#', '');
  return VALID_VIEWS.has(hash) ? hash : 'home';
}

const THEME_STORAGE_KEY = 'sunnys-pizza-theme';
function getSavedTheme() {
  try {
    return window.localStorage.getItem(THEME_STORAGE_KEY) === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

export default function App() {
  const [view, setView] = useState(getView);
  const [notice, setNotice] = useState('');
  const [theme, setTheme] = useState(getSavedTheme);
  useEffect(() => {
    const handleHash = () => setView(getView());
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // The theme still works when browser storage is disabled.
    }
  }, [theme]);
  function toggleTheme() {
    setTheme(current => current === 'dark' ? 'light' : 'dark');
  }
  function navigate(next) {
    setNotice('');
    window.location.hash = next;
    setView(next);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
  return <div className="app-layout"><SiteHeader onNavigate={navigate} view={view} theme={theme} onToggleTheme={toggleTheme}/>{view === 'home' ? <Home onNavigate={navigate} onNotice={setNotice}/> : <AuthPage key={view} view={view} onNavigate={navigate} onNotice={setNotice}/>}<SiteFooter onNavigate={navigate}/>{notice && <div className="toast" role="status"><span>ℹ</span><p>{notice}</p><button type="button" onClick={() => setNotice('')} aria-label="Dismiss notification">×</button></div>}</div>;
}
