import express from "express";
import StockMovement from "../models/StockMovement.js";
import Product from "../models/Product.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.get("/", auth, async (req, res) => {
  try {
    const { product, type, from, to, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (product) filter.product = product;
    if (type) filter.type = type;
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }

    const movements = await StockMovement.find(filter)
      .populate("product", "name sku")
      .populate("user", "name")
      .populate("fromLocation", "name")
      .populate("toLocation", "name")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await StockMovement.countDocuments(filter);

    res.json({
      movements,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get movements",
      error: error.message,
    });
  }
});

router.get("/product/:productId", auth, async (req, res) => {
  try {
    const movements = await StockMovement.find({
      product: req.params.productId,
    })
      .populate("user", "name")
      .populate("fromLocation", "name")
      .populate("toLocation", "name")
      .sort({ createdAt: -1 });

    res.json(movements);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get product movements",
      error: error.message,
    });
  }
});

router.post("/", auth, async (req, res) => {
  try {
    const {
      product: productId,
      type,
      quantity,
      fromLocation,
      toLocation,
      reason,
      comment,
    } = req.body;

    if (!productId || !type || quantity == null) {
      return res.status(400).json({
        message: "product, type and quantity are required",
      });
    }

    if (quantity <= 0) {
      return res.status(400).json({
        message: "quantity must be greater than 0",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    switch (type) {
      case "incoming":
        product.quantity += quantity;
        break;

      case "outgoing":
        if (product.quantity < quantity) {
          return res.status(400).json({
            message: "Insufficient stock",
          });
        }
        product.quantity -= quantity;
        break;

      case "transfer":
        if (!toLocation) {
          return res.status(400).json({
            message: "toLocation is required for transfer",
          });
        }
        product.location = toLocation;
        break;

      case "adjustment":
        product.quantity = quantity;
        break;

      default:
        return res.status(400).json({
          message: "Invalid movement type",
        });
    }

    await product.save();

    const movement = await StockMovement.create({
      product: productId,
      user: req.user.id,
      type,
      quantity,
      fromLocation: fromLocation || null,
      toLocation: toLocation || null,
      reason: reason || "",
      comment: comment || "",
    });

    const populatedMovement = await StockMovement.findById(movement._id)
      .populate("product", "name sku")
      .populate("user", "name")
      .populate("fromLocation", "name")
      .populate("toLocation", "name");

    res.status(201).json(populatedMovement);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create movement",
      error: error.message,
    });
  }
});

export default router;
