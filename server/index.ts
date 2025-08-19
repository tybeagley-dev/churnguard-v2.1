import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes-clean";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      console.log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);
  
  console.log('🚀 ChurnGuard 2.1 server with clean data service');

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Serve static files in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(join(__dirname, "../dist")));
    
    app.get("*", (_req, res) => {
      res.sendFile(join(__dirname, "../dist/index.html"));
    });
  }

  // Use port 8000 (like ChurnGuard 3.0) or environment port
  const port = process.env.PORT || 8000;
  server.listen(port, '0.0.0.0', () => {
    console.log(`🎯 ChurnGuard 2.1 serving on port ${port}`);
    console.log(`📊 Clean architecture: 2.0 frontend + 3.0 backend`);
  });
})();