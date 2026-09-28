import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import "./models/Location.js";

import locationRoutes from "./routes/locations.js";

import dashboardRoutes from "./routes/dashboard.js";

import movementRoutes from "./routes/movements.js";

import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";

import supplierRoutes from "./routes/suppliers.js";
import categoryRoutes from "./routes/categories.js";

const app = express();

const PORT = 5000;
const MONGO_URI = "mongodb://127.0.0.1:27017/warehouse";

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/movements", movementRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/locations", locationRoutes);

app.use("/api/suppliers", supplierRoutes);
app.use("/api/categories", categoryRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Warehouse API is running",
  });
});

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });
