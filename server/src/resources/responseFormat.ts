import { ProductDocument } from "src/models/product";

export const productResource = (
  products: ProductDocument[],
  isPublic?: null | { id: string; name: string; avatar: string }
) => {
  return products.map((product) => {
    let publicCollection = {};
    if (isPublic) {
      publicCollection = {
        images: product.images?.map((i) => i.url),
        date: product.purchasingDate,
        description: product.description,
        seller: { ...isPublic },
      };
    }
    return {
      id: product._id,
      name: product.name,
      thumbnail: product.thumbnail,
      category: product.category,
      price: product.price,
      ...publicCollection,
    };
  });
};
