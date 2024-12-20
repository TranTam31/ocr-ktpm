const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const { image2text } = require("./filters/ocr");
const { translate } = require("./filters/translate");
const { createPDF } = require("./filters/pdf");

const app = express();
const PORT = 3000;

app.use(
    cors({
        origin: "*",
    })
);

// Tạo thư mục lưu file upload nếu chưa tồn tại
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình Multer để lưu file ảnh
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        const ext = path.extname(file.originalname);
        cb(null, `${timestamp}${ext}`);
    },
});
const upload = multer({ storage });

// Worker khởi chạy chỉ khi cần
let workersStarted = false;

function startWorkers() {
    if (workersStarted) {
        console.log("Starting workers...");
        translate();
        createPDF();
    }
}

// Route upload ảnh
app.post("/upload", upload.single("image"), async (req, res) => {
    const filePath = req.file.path;
    console.log(`Uploaded file: ${filePath}`);

    try {
        // Gửi ảnh vào hàng đợi xử lý
        await image2text(filePath);

        // Khởi động các worker
        workersStarted = true;
        startWorkers();

        const pdfPath = path.join(__dirname, "output", "output.pdf");
        const MAX_WAIT_TIME = 15000;

        const interval = setInterval(() => {
            if (fs.existsSync(pdfPath)) {
                clearInterval(interval);

                // Xóa ảnh tạm ngay sau khi xử lý thành công
                fs.unlink(filePath, (err) => {
                    if (err) {
                        console.error(`Error deleting temporary file: ${filePath}`, err);
                    } else {
                        console.log(`Temporary file deleted: ${filePath}`);
                    }
                });

                res.download(pdfPath, "output.pdf", (err) => {
                    if (err) {
                        console.error("Error sending PDF:", err);
                        res.status(500).send("Error downloading the PDF.");
                    } else {
                        console.log("PDF sent successfully!");
                    }
                });
            }
        }, 500);

        setTimeout(() => {
            clearInterval(interval);
            if (!res.headersSent) {
                res.status(500).send("Processing timeout. Please try again later.");
            }
        }, MAX_WAIT_TIME);
    } catch (error) {
        console.error("Error processing file:", error);

        // Xóa ảnh tạm trong trường hợp gặp lỗi
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error(`Error deleting temporary file after failure: ${filePath}`, err);
            } else {
                console.log(`Temporary file deleted after failure: ${filePath}`);
            }
        });

        res.status(500).send("An error occurred while processing the file.");
    }
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
