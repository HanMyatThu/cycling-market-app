import { UploadApiResponse } from "cloudinary";
import { RequestHandler } from "express";
import { Product } from "src/models/product";
import { JsonOne } from "src/resources/responseResource";
import cloudUploader from "src/utils/cloudinary";

const uploadImage = (filePath: string): Promise<UploadApiResponse> => {
  return cloudUploader.upload(filePath, {
    width: 1280,
    height: 720,
    crop: "fill",
  });
};

export const CreateNewProduct: RequestHandler = async (req, res) => {
  try {
    const product = new Product({
      ...req.body,
      owner: req.user.id,
    });
    await product.save();

    const { images } = req.files;

    const isMultipleImages = Array.isArray(images);

    if (isMultipleImages && images.length > 5) {
      return JsonOne(null, 422, "Files cannot be more than 5", res);
    }

    //check if we have multiple images
    let invalidFileTypes = false;
    if (isMultipleImages) {
      for (let img of images) {
        if (!img.mimetype?.startsWith("image")) {
          invalidFileTypes = true;
          break;
        }
      }
    } else {
      if (images) {
        if (!images.mimetype?.startsWith("image")) {
          invalidFileTypes = true;
        }
      }
    }

    if (invalidFileTypes)
      return JsonOne(
        null,
        422,
        "Invalid file type, files must be images!",
        res
      );

    // upload images
    if (isMultipleImages) {
      const uploadPromises = images.map((file) => uploadImage(file.filepath));
      //wait for all files to be uploaded
      const uploadResults = await Promise.all(uploadPromises);
      //add image url to product image field
      product.images = uploadResults.map((res) => {
        return { url: res.secure_url, id: res.public_id };
      });
      product.thumbnail = product.images[0].url;
    } else {
      if (images) {
        const { secure_url, public_id } = await uploadImage(images.filepath);
        product.images = [{ url: secure_url, id: public_id }];
        product.thumbnail = secure_url;
      }
    }
    await product.save();

    JsonOne(
      {
        product,
      },
      200,
      null,
      res
    );
  } catch (error) {
    JsonOne(null, 500, "Server Error", res);
  }
};
