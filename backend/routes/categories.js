import express from "express";
import Category from "../models/Category.js";
import { auth, adminOnly } from "../middleware/auth.js";

const router = express.Router();

router.get("/", auth, async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json(categories);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to get categories", error: error.message });
  }
});

router.get("/:id", auth, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category)
      return res.status(404).json({ message: "Category not found" });
    res.json(category);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to get category", error: error.message });
  }
});

router.post("/", auth, adminOnly, async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json(category);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to create category", error: error.message });
  }
});

router.put("/:id", auth, adminOnly, async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!category)
      return res.status(404).json({ message: "Category not found" });
    res.json(category);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to update category", error: error.message });
  }
});

router.delete("/:id", auth, adminOnly, async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category)
      return res.status(404).json({ message: "Category not found" });
    res.json({ message: "Category deleted" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete category", error: error.message });
  }
});

export default router;
