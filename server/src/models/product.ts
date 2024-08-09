import mongoose from "mongoose";
import categories from "src/enum/categories";

type productImage = { url: string; id: string };

export interface ProductDocument extends mongoose.Document {
  owner: mongoose.Schema.Types.ObjectId;
  name: string;
  price: number;
  purchasingDate: Date;
  category: string;
  images: productImage[];
  thumbnail: string;
  description: string;
}

const ProductSchema = new mongoose.Schema<ProductDocument>(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
    purchasingDate: {
      type: Date,
      default: Date.now(),
    },
    category: {
      type: String,
      enum: [...categories],
      required: true,
    },
    images: [
      {
        type: Object,
        url: String,
        id: String,
      },
    ],
    thumbnail: {
      type: String,
    },
  },
  { timestamps: true }
);

export const Product = mongoose.model("products", ProductSchema);
