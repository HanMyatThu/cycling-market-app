import { Router } from "express";
import { CreateNewProduct } from "src/controllers/productController";
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

export default productRouter;
