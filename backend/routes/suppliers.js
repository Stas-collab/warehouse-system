import express from "express";
import Supplier from "../models/Supplier.js";
import { auth, adminOnly } from "../middleware/auth.js";

const router = express.Router();

router.get("/", auth, async (req, res) => {
  try {
    const suppliers = await Supplier.find().sort({ createdAt: -1 });
    res.json(suppliers);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to get suppliers", error: error.message });
  }
});

router.get("/:id", auth, async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier)
      return res.status(404).json({ message: "Supplier not found" });
    res.json(supplier);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to get supplier", error: error.message });
  }
});

router.post("/", auth, adminOnly, async (req, res) => {
  try {
    const supplier = await Supplier.create(req.body);
    res.status(201).json(supplier);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to create supplier", error: error.message });
  }
});

router.put("/:id", auth, adminOnly, async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!supplier)
      return res.status(404).json({ message: "Supplier not found" });
    res.json(supplier);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to update supplier", error: error.message });
  }
});

router.delete("/:id", auth, adminOnly, async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndDelete(req.params.id);
    if (!supplier)
      return res.status(404).json({ message: "Supplier not found" });
    res.json({ message: "Supplier deleted" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete supplier", error: error.message });
  }
});

export default router;
