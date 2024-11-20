from locust import HttpUser, task, between
import os

class FileUploadUser(HttpUser):
    host = "http://host.docker.internal:3000"
    wait_time = between(1, 5)  # Thời gian chờ giữa các yêu cầu

    @task
    def upload_image(self):
        # Đường dẫn tới file ảnh trong máy bạn
        image_path = "/test/sample.png"
        
        # Kiểm tra file có tồn tại không
        if not os.path.exists(image_path):
            print(f"File {image_path} không tồn tại. Vui lòng kiểm tra.")
            return

        # Mở file ảnh để gửi
        with open(image_path, "rb") as image_file:
            files = {"image": (image_path, image_file, "image/png")}
            response = self.client.post("/upload", files=files)
            
            # Kiểm tra phản hồi từ server
            if response.status_code == 200:
                print("File uploaded successfully!")
            else:
                print(f"Failed to upload file. Status code: {response.status_code}")
