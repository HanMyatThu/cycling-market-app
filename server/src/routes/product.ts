import { Router } from "express";
import {
  CreateNewProduct,
  DeleteProduct,
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

productRouter.patch("/:id", isAuth, fileUpload, UpdateProduct);

productRouter.delete("/:id", isAuth, DeleteProduct);

export default productRouter;
