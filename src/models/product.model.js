const mongoose = require("mongoose");

var productSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
    },
    cost: {
      type: Number,
      required: true,
    },
    amountAvailable: {
      type: Number,
      required: true,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, versionKey: false }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
