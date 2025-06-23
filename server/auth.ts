import type { Express, RequestHandler } from "express";
import session from "express-session";
import bcrypt from "bcryptjs";
import csurf from "csurf";
import { storage } from "./storage";
import { config } from "./config";
import { nanoid } from "nanoid";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Session configuration
export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
  
  return session({
    secret: config.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      maxAge: sessionTtl,
      sameSite: 'lax'
    },
  });
}

export async function setupAuth(app: Express) {
  console.log('Setting up authentication...');
  
  // Session middleware
  app.use(getSession());

  // CSRF protection for all POST/PUT/DELETE routes (except /api/auth/csrf)
  app.use(csurf({ cookie: false }));

  // CSRF token endpoint
  app.get('/api/csrf-token', (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
  });

  // Auth routes
  app.get('/api/auth/login', (req, res) => {
    res.json({
      providers: {
        demo: true,
        local: true
      }
    });
  });

  // Demo login for development
  app.post('/api/auth/demo', async (req, res) => {
    try {
      // Create or get demo user
      const demoUser = await storage.upsertUser({
        id: 'demo-user-123',
        email: 'demo@studymentor.app',
        firstName: 'Demo',
        lastName: 'User',
        authProvider: 'demo'
      });

      // Set user in session
      (req.session as any).user = demoUser;
      res.json({ success: true, user: demoUser });
    } catch (error) {
      console.error('Demo login error:', error);
      res.status(500).json({ message: 'Demo login failed' });
    }
  });

  // Local registration
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
      }
      if (password.length < 8) {
        return res.status(400).json({ message: 'Password must be at least 8 characters' });
      }
      let user = await storage.getUserByEmail(email);
      if (user) {
        return res.status(400).json({ message: 'Email already registered' });
      }
      const passwordHash = await bcrypt.hash(password, 10);
      const newUser = await storage.upsertUser({
        id: `user_${nanoid()}`,
        email,
        firstName,
        lastName,
        passwordHash,
        authProvider: 'local'
      });
      (req.session as any).user = newUser;
      res.json({ success: true, user: newUser });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Registration failed' });
    }
  });

  // Local login (email + password)
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
      }
      let user = await storage.getUserByEmail(email);
      if (!user || !user.passwordHash) {
        return res.status(400).json({ message: 'Invalid email or password' });
      }
      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        return res.status(400).json({ message: 'Invalid email or password' });
      }
      (req.session as any).user = user;
      res.json({ success: true, user });
    } catch (error) {
      console.error('Local login error:', error);
      res.status(500).json({ message: 'Login failed' });
    }
  });

  // Logout route
  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Logout failed' });
      }
      res.clearCookie('connect.sid'); // Or your session cookie name
      res.json({ success: true, message: 'Logged out successfully' });
    });
  });

  console.log('Authentication setup completed');
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  const user = (req.session as any).user;
  
  if (user) {
    (req as any).user = user;
    return next();
  }
  
  res.status(401).json({ message: "Unauthorized" });
};

export const isAuthenticatedRedirect: RequestHandler = (req, res, next) => {
  const user = (req.session as any).user;
  
  if (user) {
    (req as any).user = user;
    return next();
  }
  
  res.redirect('/login');
}; 