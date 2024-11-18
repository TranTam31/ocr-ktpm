const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { connectToRabbitMQ } = require("./rabbitmq"); // Import logic kết nối RabbitMQ

const router = express.Router();

// Tạo thư mục lưu file upload
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});
const upload = multer({ storage });

// Route upload ảnh
router.post("/upload", upload.single("image"), async (req, res) => {
    const filePath = req.file.path;
    console.log(`Uploaded file: ${filePath}`);

    try {
        // Kết nối RabbitMQ
        const channel = await connectToRabbitMQ();

        // Đẩy file vào hàng đợi
        const queue = "sendImage";
        channel.assertQueue(queue, { durable: false });
        channel.sendToQueue(queue, Buffer.from(filePath));
        console.log(`[x] Sent file path to queue: ${filePath}`);

        // Trả file PDF sau khi xử lý
        const pdfPath = path.join(__dirname, "output", "output.pdf");
        res.download(pdfPath, "output.pdf", (err) => {
            if (err) {
                console.error(err);
                res.status(500).send("Error while downloading PDF");
            }
        });
    } catch (error) {
        console.error("Error processing file:", error);
        res.status(500).send("Error processing the uploaded file");
    }
});

module.exports = router;
