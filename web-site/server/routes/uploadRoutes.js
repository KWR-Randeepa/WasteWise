import express from "express";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

const router = express.Router();

router.post("/", (req, res) => {
  if (!req.files || !req.files.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const file = req.files.file;

  const uploadStream = cloudinary.uploader.upload_stream(
    {
      resource_type: "auto",
      folder: "documents",
      format: "pdf",
    },
    (error, result) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ message: error.message });
      }

      return res.json({
        url: result.secure_url,
        public_id: result.public_id,
      });
    }
  );

  streamifier.createReadStream(file.data).pipe(uploadStream);
});

export default router;