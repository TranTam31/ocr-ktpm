document.getElementById("uploadForm").addEventListener("submit", async function (event) {
    event.preventDefault();
    const status = document.getElementById("status");
    status.textContent = "Uploading image...";

    const formData = new FormData();
    const fileInput = document.getElementById("imageUpload");

    if (fileInput.files.length === 0) {
        status.textContent = "Please select an image to upload.";
        return;
    }

    formData.append("image", fileInput.files[0]);

    try {
        const response = await fetch("http://localhost:3000/upload", {
            method: "POST",
            body: formData,
        });

        if (response.ok) {
            // Kiểm tra loại tệp trả về là PDF hay không
            const contentType = response.headers.get("Content-Type");
            if (contentType && contentType.includes("application/pdf")) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.style.display = "none";
                a.href = url;
                a.download = "output.pdf"; // Tên file PDF khi tải xuống
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                status.textContent = "Download completed!";
            } else {
                status.textContent = "Failed to generate PDF. Please try again.";
            }
        } else {
            status.textContent = "Failed to convert the image. Please try again.";
        }
    } catch (error) {
        console.error("Error:", error);
        status.textContent = "An error occurred. Please try again.";
    }
});
