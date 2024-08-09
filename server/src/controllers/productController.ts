import { UploadApiResponse } from "cloudinary";
import { RequestHandler } from "express";
import { isValidObjectId } from "mongoose";
import { Product } from "src/models/product";
import { JsonOne } from "src/resources/responseResource";
import cloudUploader, { cloudApi } from "src/utils/cloudinary";

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

/**
 * 1. User Must be authenticated
 * 2. User can upload Image as well
 * 3. Validate Incoming Data
 * 4. Upload normal properties
 * 5. Upload and Upload Images (restrict images qty)
 * 6. send the response back
 */
export const UpdateProduct: RequestHandler = async (req, res) => {
  try {
    const productId = req.params.id;
    if (!isValidObjectId(productId))
      return JsonOne(null, 422, "Invalid Product Id!", res);
    delete req.body.images;
    const product = await Product.findByIdAndUpdate(
      productId,
      {
        ...req.body,
      },
      { new: true }
    );
    if (!product) return JsonOne(null, 404, "Product Not Found", res);

    if (product.images.length >= 5) {
      return JsonOne(
        null,
        422,
        "Product already reacts max images limit.",
        res
      );
    }

    const { images } = req.files;

    const isMultipleImages = Array.isArray(images);

    if (isMultipleImages && product.images.length + images.length > 5) {
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
      const newImages = uploadResults.map((res) => {
        return { url: res.secure_url, id: res.public_id };
      });
      product.images.push(...newImages);
    } else {
      if (images) {
        const { secure_url, public_id } = await uploadImage(images.filepath);
        product.images = [
          ...product.images,
          { url: secure_url, id: public_id },
        ];
      }
    }

    await product.save();
    JsonOne(
      {
        message: "Product Updated Successfully",
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

/**
 * 1. User must be authenticated
 * 2. Check if product exists
 * 3. delete a product from database
 * 4. delete images from cloudinary
 * 5. return the response back
 */
export const DeleteProduct: RequestHandler = async (req, res) => {
  try {
    const productId = req.params.id;
    if (!isValidObjectId(productId))
      return JsonOne(null, 422, "Invalid Product Id!", res);

    const product = await Product.findById(req.params.id);
    if (!product) {
      return JsonOne(null, 404, "Product Not Found!", res);
    }

    const images = product.images;

    if (images.length) {
      const ids = images.map((image) => image.id);
      await cloudApi.delete_resources(ids);
    }

    await product.deleteOne();

    JsonOne(
      {
        message: "Product is deleted",
      },
      200,
      null,
      res
    );
  } catch (error) {
    JsonOne(null, 500, "Server Error", res);
  }
};

/**
 * 1. User must be authenticated
 * 2. Check if product exists
 * 3. check if image exists
 * 4. delete a single image from cloudinary
 * 5. update the image array
 * 6. return the response back
 */
export const DeleteProductImage: RequestHandler = async (req, res) => {
  try {
    const { id, imageId } = req.params;
    if (!isValidObjectId(id) || !isValidObjectId(imageId)) {
      return JsonOne(null, 422, "Invalid Image Id", res);
    }

    const product = await Product.findById(id);
    if (!product) return JsonOne(null, 404, "Product Not Found", res);

    const isImageExists = product.images.filter(
      (image) => image.id === imageId
    );
    if (!isImageExists.length)
      return JsonOne(null, 404, "Image Not Found", res);

    product.images = product.images.filter((image) => image.id !== imageId);

    if (product.thumbnail === isImageExists[0].url) {
      product.thumbnail = product.images[0]?.url || "";
    }

    await product.save();
    await cloudUploader.destroy(imageId);

    JsonOne(
      {
        message: "Image removed successfully",
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
