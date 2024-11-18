// const { getChannel } = require("./rabbitmq");
// const { image2text } = require("./filters/ocr");

// app.post("/upload", upload.single("image"), async (req, res) => {
//     const filePath = req.file.path;
//     console.log(`Uploaded file: ${filePath}`);

//     try {
//         // Đẩy file vào hàng đợi xử lý
//         const channel = await getChannel();
//         await image2text(filePath);

//         // Đợi file PDF được tạo
//         setTimeout(() => {
//             const pdfPath = path.join(__dirname, "output", "output.pdf");
//             res.download(pdfPath, "output.pdf", (err) => {
//                 if (err) {
//                     console.error(err);
//                     res.status(500).send("Error while downloading PDF");
//                 }
//             });
//         }, 5000); // Delay để chờ xử lý xong
//     } catch (error) {
//         console.error("Error processing file:", error);
//         res.status(500).send("Error processing the uploaded file");
//     }
// });
