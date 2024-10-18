import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import transactionRoutes from "./routes/transactionRoutes.js";
import { initializeDatabase } from "./controllers/transactionController.js";

const app = express();
const PORT = 3000;
const DB_URI = "mongodb://localhost:27017/transactionDB";

app.use(cors());
app.use(express.json());

const dbConnect = async () => {
  try {
    const connection = await mongoose.connect(DB_URI);
    if (connection) {
      console.log("Successfully connected to MongoDB!");
    }
    await initializeDatabase();
    
  } catch (error) {
    console.error("Error connecting to database:", error);
    throw error; 
  }
};

app.use("/api", transactionRoutes);

dbConnect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.log(`Error connecting database:${err}`);
  });
