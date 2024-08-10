import { Router } from "express";
import {
  CreateNewProduct,
  DeleteProduct,
  DeleteProductImage,
  getProductByCategory,
  getSingleProduct,
  UpdateProduct,
} from "src/controllers/productController";
import { isAuth } from "src/middlewares/auth";
import { fileUpload } from "src/middlewares/file-upload";
import { validate } from "src/middlewares/validator";
import { createNewProductSchema } from "src/validationSchemas/productSchema";

const productRouter = Router();

productRouter.post(
  "/",
  isAuth,
  fileUpload,
  validate(createNewProductSchema),
  CreateNewProduct
);

productRouter.get("/:id", isAuth, getSingleProduct);
productRouter.patch("/:id", isAuth, fileUpload, UpdateProduct);
productRouter.delete("/:id", isAuth, DeleteProduct);
productRouter.delete("/:id/image/:imageId", isAuth, DeleteProductImage);
productRouter.get("/by-category/:category", getProductByCategory);

export default productRouter;
