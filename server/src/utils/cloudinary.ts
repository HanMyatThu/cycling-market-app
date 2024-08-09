import { v2 as cloudinary } from "cloudinary";

const CLOUD_NAME = process.env.CLOUDINARY_NAME;
const CLOUD_KEY = process.env.CLOUDINARY_KEY;
const CLOUD_SECRET = process.env.CLOUDINARY_SECRET;

// configuration
cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: CLOUD_KEY,
  api_secret: CLOUD_SECRET,
  secure: true,
});

const cloudUploader = cloudinary.uploader;

export const cloudApi = cloudinary.api;
export default cloudUploader;
