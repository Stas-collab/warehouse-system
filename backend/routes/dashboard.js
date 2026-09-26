import express from "express";
import mongoose from "mongoose";
import Product from "../models/Product.js";
import StockMovement from "../models/StockMovement.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.get("/", auth, async (req, res) => {
  try {
    const tenantId = req.user.tenantId;

    const totalProducts = await Product.countDocuments({ tenantId });

    const products = await Product.find({ tenantId });
    const totalStockValue = products.reduce(
      (sum, p) => sum + p.quantity * p.price,
      0,
    );

    const lowStockProducts = await Product.find({
      tenantId,
      $expr: { $lte: ["$quantity", "$minQuantity"] },
    })
      .populate("category", "name")
      .populate("location", "name")
      .sort({ quantity: 1 });

    const recentMovements = await StockMovement.find({ tenantId })
      .populate("product", "name sku")
      .populate("user", "name")
      .sort({ createdAt: -1 })
      .limit(10);

    // aggregate() працює через raw MongoDB driver і НЕ кастить рядок в ObjectId
    // автоматично (на відміну від find()), тому явно оборачуємо в ObjectId.
    const movementsByType = await StockMovement.aggregate([
      { $match: { tenantId: new mongoose.Types.ObjectId(tenantId) } },
      { $group: { _id: "$type", count: { $sum: 1 } } },
    ]);

    res.json({
      totalProducts,
      totalStockValue,
      lowStockProducts,
      recentMovements,
      movementsByType,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to get dashboard data", error: error.message });
  }
});

export default router;
