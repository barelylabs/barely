import { v2 } from "cloudinary";

import env from "../env";

v2.config({
  cloud_name: env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export const cloudinary = {
  upload: v2.uploader.upload,
  rename: v2.uploader.rename,
};
