const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },

  { timestamps: true }

);

const Category = mongoose.model("Category", CategorySchema);

module.exports = Category
