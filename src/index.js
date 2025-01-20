import express from "express";
import path from "path";
import dotenv from "dotenv";
import connectDB from "./db/connection.js";
import { app } from "./app.js";

dotenv.config({
  path: "./.env",
});

// Connect to Database
connectDB()
  .then(() => {
    // Serve static files from the "build" directory (React build output)
    const __dirname = path.resolve();
    app.use(express.static(path.join(__dirname, "build")));

    // Fallback route for SPA
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(__dirname, "build", "index.html"));
    });

    // Start the server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server started at Port: http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error(`Server failed to start: ${err.message}`);
  });
