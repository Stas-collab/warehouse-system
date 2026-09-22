import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      default: null,
    },

    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
      default: null,
    },

    unit: {
      type: String,
      enum: ["шт", "кг", "л", "м", "уп"],
      default: "шт",
    },

    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    minQuantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Product", productSchema);
