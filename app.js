const express = require('express');
const session = require('express-session');
const path = require('path');

function createApp({ store, secret, production = false }) {
  const app = express();
  app.disable('x-powered-by');
  if (production) app.set('trust proxy', 1);
  app.use(express.json({ limit: '16kb' }));
  app.use(session({
    name: 'fittraker.sid', secret, store, resave: false, saveUninitialized: false,
    rolling: true,
    cookie: { httpOnly: true, sameSite: 'lax', secure: production, maxAge: 8 * 60 * 60 * 1000 }
  }));
  // Reject cross-origin mutations, including logout and login requests.
  app.use((req, res, next) => {
    if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method) && req.headers.origin &&
        req.headers.origin !== `${req.protocol}://${req.get('host')}`) {
      return res.status(403).json({ message: 'Request origin not allowed' });
    }
    next();
  });
  app.use('/api/auth', require('./routes/authRoutes'));
  app.use('/api/support', require('./routes/supportRoutes'));
  const requireLogin = (req, res, next) => {
    if (req.session.user) return next();
    if (req.originalUrl.startsWith('/api/')) return res.status(401).json({ message: 'Please log in' });
    res.redirect('/welcome-page/login.html');
  };
  app.use('/api/programs', requireLogin, require('./routes/programRoutes'));
  app.use('/api/exercises', requireLogin, require('./routes/exerciseRoutes'));
  app.use('/welcome-page', express.static(path.join(__dirname, 'welcome-page')));
  app.use('/images', express.static(path.join(__dirname, 'images')));
  app.get('/', (req, res) => res.redirect(req.session.user ? '/public/index.html' : '/welcome-page/login.html'));
  app.use(requireLogin);
  app.use((req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
  app.use('/public', express.static(path.join(__dirname, 'public')));
  app.use(express.static(path.join(__dirname, 'public')));
  return app;
}
module.exports = createApp;
