import type { Express } from "express";
import { createServer, type Server } from "http";
import { bigQueryDataService } from "./services/bigquery-data";

// Default password (changeable via settings)
let systemPassword = "Boostly123!";

// Simple session storage (in production, use Redis or database)
const sessions = new Map<string, { userId: string; createdAt: Date }>();

// Session middleware
function requireAuth(req: any, res: any, next: any) {
  const sessionId = req.headers.authorization?.replace('Bearer ', '') || req.sessionID;
  const session = sessions.get(sessionId);
  
  if (!session) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  // Check if session is expired (24 hours)
  const sessionAge = Date.now() - session.createdAt.getTime();
  if (sessionAge > 24 * 60 * 60 * 1000) {
    sessions.delete(sessionId);
    return res.status(401).json({ error: 'Session expired' });
  }
  
  req.user = { id: session.userId };
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication endpoint
  app.post("/api/auth/login", (req, res) => {
    const { password } = req.body;
    
    if (password !== systemPassword) {
      return res.status(401).json({ error: 'Invalid password' });
    }
    
    const sessionId = Math.random().toString(36).substring(7);
    sessions.set(sessionId, {
      userId: 'admin',
      createdAt: new Date()
    });
    
    res.json({ 
      message: 'Login successful',
      sessionId,
      user: { id: 'admin', role: 'admin' }
    });
  });

  // Get all accounts from BigQuery
  app.get("/api/accounts", async (req, res) => {
    try {
      console.log("Fetching account data from BigQuery...");
      const accounts = await bigQueryDataService.getAccountData();
      res.json(accounts);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      res.status(500).json({ error: "Failed to fetch accounts" });
    }
  });

  // Get monthly accounts (same data, different endpoint for 2.0 compatibility)
  app.get("/api/bigquery/accounts/monthly", async (req, res) => {
    try {
      console.log("Fetching monthly account data from BigQuery...");
      const accounts = await bigQueryDataService.getAccountData();
      res.json(accounts);
    } catch (error) {
      console.error('Error fetching monthly accounts:', error);
      res.status(500).json({ error: "Failed to fetch monthly accounts" });
    }
  });

  // Get monthly account history (different endpoint name for 2.0 compatibility)
  app.get("/api/bigquery/account-history/monthly/:accountId", async (req, res) => {
    try {
      const { accountId } = req.params;
      console.log(`Fetching monthly history for account: ${accountId}`);
      const history = await bigQueryDataService.getAccountHistory(accountId);
      res.json(history);
    } catch (error) {
      console.error("Error fetching monthly account history:", error);
      res.status(500).json({ error: "Failed to fetch monthly account history" });
    }
  });

  // Get account history
  app.get("/api/bigquery/account-history/:accountId", async (req, res) => {
    try {
      const { accountId } = req.params;
      console.log(`Fetching 12-week history for account: ${accountId}`);
      const history = await bigQueryDataService.getAccountHistory(accountId);
      res.json(history);
    } catch (error) {
      console.error("Error fetching account history:", error);
      res.status(500).json({ error: "Failed to fetch account history" });
    }
  });

  // Get historical performance data
  app.get("/api/historical-performance", async (_req, res) => {
    try {
      console.log("Fetching historical performance data...");
      const data = await bigQueryDataService.getHistoricalPerformance();
      res.json(data);
    } catch (error) {
      console.error("Error fetching historical performance:", error);
      res.status(500).json({ error: "Failed to fetch historical performance data" });
    }
  });

  // Get monthly trends data
  app.get("/api/monthly-trends", async (_req, res) => {
    try {
      console.log("Fetching monthly trends data...");
      const data = await bigQueryDataService.getMonthlyTrends();
      res.json(data);
    } catch (error) {
      console.error("Error fetching monthly trends:", error);
      res.status(500).json({ error: "Failed to fetch monthly trends data" });
    }
  });

  // Test BigQuery connection
  app.get("/api/test-connection", async (_req, res) => {
    try {
      console.log("Testing BigQuery connection...");
      const result = await bigQueryDataService.testConnection();
      res.json(result);
    } catch (error) {
      console.error("Error testing connection:", error);
      res.status(500).json({ error: "Failed to test connection" });
    }
  });

  // Health check
  app.get("/health", (_req, res) => {
    console.log("Health check called");
    res.json({ status: "ok", service: "ChurnGuard 2.1" });
  });

  // Auth check endpoint for frontend
  app.get("/api/auth/check", requireAuth, (req, res) => {
    res.json({ 
      user: { id: req.user.id, role: 'admin' },
      authenticated: true 
    });
  });

  // Logout endpoint
  app.post("/api/auth/logout", (req, res) => {
    const sessionId = req.headers.authorization?.replace('Bearer ', '') || req.sessionID;
    sessions.delete(sessionId);
    res.json({ message: 'Logged out successfully' });
  });

  // Change password endpoint
  app.post("/api/auth/change-password", requireAuth, (req, res) => {
    const { currentPassword, newPassword } = req.body;
    
    if (currentPassword !== systemPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }
    
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters' });
    }
    
    systemPassword = newPassword;
    res.json({ message: 'Password changed successfully' });
  });

  // Risk scores endpoint (for compatibility with 2.0 frontend)
  app.get("/api/risk-scores/latest", async (req, res) => {
    try {
      // Use the same account data but format it for risk scores endpoint
      const accounts = await bigQueryDataService.getAccountData();
      const riskScores = accounts.map(account => ({
        account_id: account.account_id,
        risk_level: account.risk_level,
        total_spend: account.total_spend,
        // Add any other risk-related fields the frontend expects
      }));
      res.json(riskScores);
    } catch (error) {
      console.error('Error fetching risk scores:', error);
      res.status(500).json({ error: "Failed to fetch risk scores" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}