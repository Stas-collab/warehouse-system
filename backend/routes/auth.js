import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { JWT_SECRET, auth, adminOnly } from "../middleware/auth.js";

const router = express.Router();

function getTenantId(user) {
  return user.role === "admin"
    ? user._id.toString()
    : user.tenantId?.toString();
}

function signToken(user) {
  return jwt.sign(
    {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      tenantId: getTenantId(user),
    },
    JWT_SECRET,
    { expiresIn: "1d" },
  );
}

function toPublicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

// Публічна реєстрація завжди створює НОВОГО admin — власника окремого складу.
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "admin",
    });

    res.status(201).json({ message: "User created", user: toPublicUser(user) });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Registration failed", error: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = signToken(user);
    res.json({ token, user: toPublicUser(user) });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
});

// --- Керування менеджерами (тільки admin, лише в межах свого складу) ---

router.get("/managers", auth, adminOnly, async (req, res) => {
  try {
    const managers = await User.find({
      tenantId: req.user.id,
      role: "manager",
    }).sort({ createdAt: -1 });

    res.json(managers.map(toPublicUser));
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to get managers", error: error.message });
  }
});

router.post("/managers", auth, adminOnly, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const manager = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "manager",
      tenantId: req.user.id,
    });

    res.status(201).json(toPublicUser(manager));
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to create manager", error: error.message });
  }
});

router.delete("/managers/:id", auth, adminOnly, async (req, res) => {
  try {
    const manager = await User.findOneAndDelete({
      _id: req.params.id,
      tenantId: req.user.id,
      role: "manager",
    });

    if (!manager) {
      return res.status(404).json({ message: "Manager not found" });
    }

    res.json({ message: "Manager deleted" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete manager", error: error.message });
  }
});

export default router;
