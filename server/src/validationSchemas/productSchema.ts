import categories from "src/enum/categories";
import * as yup from "yup";

export const createNewProductSchema = yup.object({
  name: yup.string().required("Name is missing"),
  description: yup.string().required("Name is missing"),
  category: yup
    .string()
    .oneOf(categories, "Invalid Category")
    .required("Category is missing"),
  price: yup
    .string()
    .transform((value) => {
      if (!isNaN(+value)) return "";
      return +value;
    })
    .required("Price is missing"),
});
