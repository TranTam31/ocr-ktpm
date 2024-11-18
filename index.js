const express = require("express");
const routes = require("./routes"); // Import các route từ file routes.js

const app = express();
const PORT = 3000;

// Dùng các route từ routes.js
app.use("/", routes);

// Start server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
