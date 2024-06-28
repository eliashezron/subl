import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { exec } from 'child_process';

import { ORIGIN } from "./config.js";
import { pool } from "./db.js";
import exercisesRoutes from "./routes/exercises.routes.js";
import githubRoutes from "./routes/github.routes.js";
import graduateRoutes from "./routes/graduates.routes.js";
import userRoutes from "./routes/user.routes.js";

const app = express();

// Middlewares
// Enable all CORS requests
app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allow all methods
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'], // Allow all headers
  credentials: true,
  optionsSuccessStatus: 204 // For legacy browser support
}));
// Enable all CORS requests
// app.use(cors());
app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: false }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Routes
app.get("/", (req, res) => res.json({ message: "Welcome to Starklings API" }));
app.get("/api/ping", async (req, res) => {
  const result = await pool.query("SELECT NOW()");
  return res.json(result.rows[0]);
});
app.post('/api/compile', (req, res) => {
  const { code } = req.body;
  // Save the code to a temporary file
  const filePath = path.join(__dirname, 'temp.rs');
  fs.writeFileSync(filePath, code);

  // Compile the code using rustc
  exec(`rustc ${filePath} -o temp`, (error, stdout, stderr) => {
      if (error) {
          const response = {
              success: false,
              message: stderr
          };
          console.log(response);
          return res.json(response);
      }

      // Execute the compiled binary
      exec('./temp', (runError, runStdout, runStderr) => {
          if (runError) {
              const response = {
                  success: false,
                  message: runStderr
              };
              console.log(response);
              return res.json(response);
          }

          // Clean up the temporary files
          fs.unlinkSync(filePath);
          fs.unlinkSync(path.join(__dirname, 'temp'));

          const response = {
              success: true,
              message: runStdout
          };
          console.log(response);
          return res.json(response);
      });
  });
});

app.use("/api", exercisesRoutes);
app.use("/api", userRoutes);
app.use("/api", githubRoutes);
app.use("/api", graduateRoutes);

// Error Hander
app.use((err, req, res, next) => {
  res.status(500).json({
    status: "error",
    message: err.message,
  });
});

export default app;
