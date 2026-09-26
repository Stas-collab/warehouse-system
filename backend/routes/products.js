import express from "express";
import Product from "../models/Product.js";
import { auth, adminOnly } from "../middleware/auth.js";

const router = express.Router();

router.get("/", auth, async (req, res) => {
  try {
    const products = await Product.find({ tenantId: req.user.tenantId })
      .populate("category", "name")
      .populate("supplier", "name")
      .populate("location", "name")
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to get products", error: error.message });
  }
});

router.get("/:id", auth, async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      tenantId: req.user.tenantId,
    })
      .populate("category", "name")
      .populate("supplier", "name")
      .populate("location", "name");

    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to get product", error: error.message });
  }
});

router.post("/", auth, async (req, res) => {
  try {
    const product = await Product.create({
      ...req.body,
      tenantId: req.user.tenantId,
    });
    const populatedProduct = await Product.findById(product._id)
      .populate("category", "name")
      .populate("supplier", "name")
      .populate("location", "name");

    res.status(201).json(populatedProduct);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to create product", error: error.message });
  }
});

router.put("/:id", auth, async (req, res) => {
  try {
    const { tenantId, ...updateData } = req.body;
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.user.tenantId },
      updateData,
      { new: true, runValidators: true },
    )
      .populate("category", "name")
      .populate("supplier", "name")
      .populate("location", "name");

    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to update product", error: error.message });
  }
});

router.delete("/:id", auth, adminOnly, async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      tenantId: req.user.tenantId,
    });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete product", error: error.message });
  }
});

export default router;
