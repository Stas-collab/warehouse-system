import express from "express";
import Location from "../models/Location.js";
import { auth, adminOnly } from "../middleware/auth.js";

const router = express.Router();

router.get("/", auth, async (req, res) => {
  try {
    const locations = await Location.find({ tenantId: req.user.tenantId }).sort(
      {
        createdAt: -1,
      },
    );
    res.json(locations);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to get locations", error: error.message });
  }
});

router.get("/:id", auth, async (req, res) => {
  try {
    const location = await Location.findOne({
      _id: req.params.id,
      tenantId: req.user.tenantId,
    });
    if (!location)
      return res.status(404).json({ message: "Location not found" });
    res.json(location);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to get location", error: error.message });
  }
});

router.post("/", auth, adminOnly, async (req, res) => {
  try {
    const location = await Location.create({
      ...req.body,
      tenantId: req.user.tenantId,
    });
    res.status(201).json(location);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to create location", error: error.message });
  }
});

router.put("/:id", auth, adminOnly, async (req, res) => {
  try {
    const { tenantId, ...updateData } = req.body;
    const location = await Location.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.user.tenantId },
      updateData,
      { new: true, runValidators: true },
    );
    if (!location)
      return res.status(404).json({ message: "Location not found" });
    res.json(location);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to update location", error: error.message });
  }
});

router.delete("/:id", auth, adminOnly, async (req, res) => {
  try {
    const location = await Location.findOneAndDelete({
      _id: req.params.id,
      tenantId: req.user.tenantId,
    });
    if (!location)
      return res.status(404).json({ message: "Location not found" });
    res.json({ message: "Location deleted" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete location", error: error.message });
  }
});

export default router;
