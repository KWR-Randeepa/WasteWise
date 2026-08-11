import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "urban_council_documents",
    resource_type: "auto", // important for PDF + images
  },
});

const upload = multer({ storage });

export default upload;