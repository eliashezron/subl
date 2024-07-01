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
  const outputFilePath = path.join(__dirname, 'temp');
  fs.writeFileSync(filePath, code);

  // Compile the code using rustc
  exec(`rustc ${filePath} -o ${outputFilePath}`, (error, stdout, stderr) => {
      if (error) {
          const response = {
              success: false,
              message: stderr
          };
          console.log(response);

          // Clean up the temporary files and exit gracefully
          try {
              if (fs.existsSync(filePath)) {
                  fs.unlinkSync(filePath);
              }
              if (fs.existsSync(outputFilePath)) {
                  fs.unlinkSync(outputFilePath);
              }
          } catch (cleanupError) {
              console.error('Error during cleanup:', cleanupError);
          }

          return res.json(response);
      }

      // Execute the compiled binary
      exec(outputFilePath, (runError, runStdout, runStderr) => {
          if (runError) {
              const response = {
                  success: false,
                  message: runStderr
              };
              console.log(response);

              // Clean up the temporary files and exit gracefully
              try {
                  if (fs.existsSync(filePath)) {
                      fs.unlinkSync(filePath);
                  }
                  if (fs.existsSync(outputFilePath)) {
                      fs.unlinkSync(outputFilePath);
                  }
              } catch (cleanupError) {
                  console.error('Error during cleanup:', cleanupError);
              }

              return res.json(response);
          }

          // Clean up the temporary files
          try {
              if (fs.existsSync(filePath)) {
                  fs.unlinkSync(filePath);
              }
              if (fs.existsSync(outputFilePath)) {
                  fs.unlinkSync(outputFilePath);
              }
          } catch (cleanupError) {
              console.error('Error during cleanup:', cleanupError);
          }

          const response = {
              success: true,
              message: runStdout
          };
          console.log(response);
          return res.json(response);
      });
  });
});

app.post('/api/run-tests', (req, res) => {
    const { code } = req.body;
  
    // Save the code to a temporary file
    const filePath = path.join(__dirname, 'temp.rs');
    const outputFilePath = path.join(__dirname, 'temp');
    fs.writeFileSync(filePath, code);
  
    // Write a Cargo.toml file to define a package
    const cargoToml = `
      [package]
      name = "temp"
      version = "0.1.0"
      edition = "2018"
  
      [dependencies]
    `;
    const cargoDir = path.join(__dirname, 'cargo_temp');
    if (!fs.existsSync(cargoDir)) {
      fs.mkdirSync(cargoDir);
    }
    fs.writeFileSync(path.join(cargoDir, 'Cargo.toml'), cargoToml);
    if (!fs.existsSync(path.join(cargoDir, 'src'))) {
      fs.mkdirSync(path.join(cargoDir, 'src'));
    }
    fs.writeFileSync(path.join(cargoDir, 'src', 'main.rs'), code);
  
    // Compile the code using cargo
    exec(`cargo test --manifest-path ${path.join(cargoDir, 'Cargo.toml')} --color always`, { cwd: cargoDir }, (error, stdout, stderr) => {
        // Clean up the temporary files
        try {
            fs.unlinkSync(filePath);
            fs.rmdirSync(cargoDir, { recursive: true });
        } catch (cleanupError) {
            console.error('Error during cleanup:', cleanupError);
        }
  
        if (error) {
            const response = {
                success: false,
                message: stdout + stderr
            };
            console.log(response);
            return res.json(response);
        }
  
        const response = {
            success: true,
            message: stdout
        };
        console.log(response);
        return res.json(response);
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
