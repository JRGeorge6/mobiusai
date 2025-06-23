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
  
  // Use memory store for development, but in production we should use a proper store
  // For now, we'll use memory store but with better configuration
  const sessionConfig: any = {
    secret: config.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      httpOnly: true,
      // On Render (production), always secure cookies
      secure: config.NODE_ENV === 'production',
      maxAge: sessionTtl,
      // 'lax' is correct for same-origin, 'none' only for cross-site
      sameSite: config.NODE_ENV === 'production' ? 'lax' : 'lax',
      // Ensure cookie is set for the root path
      path: '/',
      // Don't set domain in production to let the browser handle it
      domain: config.NODE_ENV === 'production' ? undefined : undefined,
    },
    name: 'sid', // Use a shorter cookie name
  };

  // In production, we should use a proper session store like Redis or PostgreSQL
  // For now, we'll use memory store but with better error handling
  if (config.NODE_ENV === 'production') {
    console.log('⚠️  Using memory session store in production - sessions will be lost on restart');
    console.log('💡 Consider using Redis or PostgreSQL session store for production');
  }

  return session(sessionConfig);
}

export async function setupAuth(app: Express) {
  console.log('Setting up authentication...');
  
  // Session middleware
  app.use(getSession());

  // CSRF protection for all POST/PUT/DELETE routes (except /api/auth/csrf)
  app.use(csurf({ 
    cookie: false,
    ignoreMethods: ['GET', 'HEAD', 'OPTIONS'],
    // Add better error handling for CSRF
    value: (req) => {
      return req.headers['x-csrf-token'] as string;
    }
  }));

  // CSRF token endpoint - add better error handling
  app.get('/api/csrf-token', (req, res) => {
    try {
      const token = req.csrfToken();
      res.json({ csrfToken: token });
    } catch (error) {
      console.error('CSRF token generation error:', error);
      res.status(500).json({ message: 'Failed to generate CSRF token' });
    }
  });

  // Auth status endpoint
  app.get('/api/auth/status', (req, res) => {
    const user = (req.session as any).user;
    if (user) {
      res.json(user);
    } else {
      res.status(401).json({ message: 'Not authenticated' });
    }
  });

  // Debug endpoint for troubleshooting
  app.get('/api/auth/debug', (req, res) => {
    res.json({
      sessionID: req.sessionID,
      hasSession: !!req.session,
      hasUser: !!(req.session as any).user,
      user: (req.session as any).user,
      cookies: req.headers.cookie,
      userAgent: req.headers['user-agent'],
      origin: req.headers.origin,
      host: req.headers.host,
    });
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
      console.log('Demo login attempt - session ID:', req.sessionID);
      
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
      
      // Force session save
      req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
          return res.status(500).json({ message: 'Session save failed' });
        }
        
        console.log('Demo login successful - user set in session');
        res.json({ success: true, user: demoUser });
      });
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
      
      // Force session save
      req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
          return res.status(500).json({ message: 'Session save failed' });
        }
        
        console.log('Registration successful - user set in session');
        res.json({ success: true, user: newUser });
      });
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
      
      // Force session save
      req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
          return res.status(500).json({ message: 'Session save failed' });
        }
        
        console.log('Login successful - user set in session');
        res.json({ success: true, user });
      });
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