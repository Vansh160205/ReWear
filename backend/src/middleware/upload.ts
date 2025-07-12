import multer from "multer";
import path from "path";
import fs from "fs";

const uploadPath = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}
// Set storage location and filename
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadPath); // store in /uploads folder
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/jfif", "image/jpg"];
    cb(null, allowed.includes(file.mimetype));
  },
});
