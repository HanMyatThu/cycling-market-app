import { ProductDocument } from "src/models/product";

export const productResource = (products: ProductDocument[]) => {
  return products.map((product) => {
    return {
      id: product._id,
      name: product.name,
      thumbnail: product.thumbnail,
      category: product.category,
      price: product.price,
    };
  });
};
