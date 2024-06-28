import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

import { ORIGIN } from "./config.js";
import { pool } from "./db.js";
import exercisesRoutes from "./routes/exercises.routes.js";
import githubRoutes from "./routes/github.routes.js";
import graduateRoutes from "./routes/graduates.routes.js";
import userRoutes from "./routes/user.routes.js";

const app = express();

// Middlewares
// app.use(
//   cors({
//     origin: ORIGIN,
//     credentials: true,
//   })
// );
// Enable all CORS requests
app.use(cors());
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
          return res.json({
              success: false,
              message: stderr
          });
      }

      // Execute the compiled binary
      exec('./temp', (runError, runStdout, runStderr) => {
          if (runError) {
              return res.json({
                  success: false,
                  message: runStderr
              });
          }

          // Clean up the temporary files
          fs.unlinkSync(filePath);
          fs.unlinkSync(path.join(__dirname, 'temp'));

          return res.json({
              success: true,
              message: runStdout
          });
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
