import type { Express, RequestHandler } from "express";
import { storage } from "./storage";

// Mock users for demo purposes - in production this would use real Replit Auth
const mockUsers = new Map<string, any>();

export async function setupSimpleAuth(app: Express) {
  console.log('Setting up mock authentication for development...');
  
  // Mock login endpoint
  app.get("/api/login", (req, res) => {
    // Create a mock user session
    const mockUser = {
      id: "mock-user-123",
      email: "user@example.com",
      firstName: "Demo",
      lastName: "User",
      profileImageUrl: null
    };
    
    // Store in our mock session
    mockUsers.set("current-user", mockUser);
    
    // Redirect to home
    res.redirect("/");
  });

  app.get("/api/callback", (req, res) => {
    res.redirect("/");
  });

  app.get("/api/logout", (req, res) => {
    mockUsers.delete("current-user");
    res.redirect("/");
  });
  
  console.log('Mock authentication setup completed');
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  try {
    // Check for mock user
    const user = mockUsers.get("current-user");
    
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Add user to request
    (req as any).user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ message: "Unauthorized" });
  }
};