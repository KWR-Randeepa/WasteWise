import Document from "../models/Document.js";

// ➕ CREATE
export const createDocument = async (req, res) => {
  try {
    const newDoc = new Document({
      title: req.body.title,
      description: req.body.description,
      type: req.body.type,
      fileUrl: req.body.fileUrl,
      publicId: req.body.publicId,
    });

    const saved = await newDoc.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📄 GET
export const getDocuments = async (req, res) => {
  try {
    const docs = await Document.find().sort({ createdAt: -1 });
    res.json(docs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🗑 DELETE  ✅ IMPORTANT
export const deleteDocument = async (req, res) => {
  try {
    await Document.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};