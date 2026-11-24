# STEM Tin học 7 – Hành trình di sản số

Ứng dụng: https://ph0823.github.io/stemTin7DiSan/

## Kiểm thử chéo trực tuyến, không đổi máy

Học sinh ở **nhóm đã lưu bài trực tuyến** có thể chọn **Bước 3 – Kiểm thử → Xem và góp ý bài nhóm bạn**. Danh sách chỉ có các nhóm cùng lớp đang lưu trên hệ thống. Học sinh mở bản chỉ xem gồm bản đồ với ba địa điểm, lời giới thiệu, nguồn tham khảo, hành trình và thông điệp bảo tồn. Không yêu cầu mã 4 ký tự của nhóm bạn và không thể sửa trực tiếp bài nhóm bạn.

Học sinh chọn ít nhất một tiêu chí kiểm thử, ghi nhận xét từ 12–300 ký tự rồi gửi. Nhóm sở hữu nhận thông báo tại bước Kiểm thử (kiểm tra lại khoảng mỗi 60 giây), có thể đưa nhận xét vào phiếu kiểm thử, tự sửa sản phẩm và lưu phiên bản sau.

Giáo viên chọn một nhóm tại **Giáo viên → Nhận xét và kiểm duyệt góp ý** để đọc phản hồi, gửi nhận xét (12–500 ký tự), ẩn hoặc hiện lại góp ý không phù hợp.

**Giới hạn:** tối đa 3 lượt góp ý cho một nhóm đích/ngày từ mỗi nhóm gửi; tối thiểu 45 giây giữa hai lượt. Hệ thống từ chối một số từ ngữ xúc phạm, liên kết và thông tin liên lạc. Bộ lọc từ khóa chỉ hỗ trợ kiểm soát cơ bản, không thay thế kiểm duyệt của giáo viên. Không sử dụng dữ liệu cá nhân nhạy cảm.

## Quan trọng: triển khai lại Google Apps Script

Cập nhật `index.html` trên GitHub Pages **không** tự cập nhật Web App Apps Script đang phục vụ lưu bài.

1. Mở **dự án Apps Script đang được ứng dụng sử dụng** (không tạo dự án mới làm mất liên kết với dữ liệu cũ).
2. Thay nội dung mã bằng **[AppsScript_STEM7.gs](AppsScript_STEM7.gs)** mới nhất trong repository và lưu.
3. Chạy `setup()` để tạo hoặc xác nhận trang tính `Gop_y_cheo_STEM7` trong bảng tính hiện tại. Hàm này không xóa các nhóm đã lưu và không đặt lại mật khẩu giáo viên đã đổi.
4. Chọn **Deploy → Manage deployments → Edit (biểu tượng bút chì)**, chọn **New version**, sau đó **Deploy**. Đặt **Execute as: Me**, **Who has access: Anyone**, theo cấu hình ứng dụng hiện có.
5. Giữ URL `/exec` cũ. Nếu URL thay đổi, cập nhật trong **Bài của nhóm → Cài đặt kết nối (dành cho giáo viên)**.
6. Trên máy học sinh, nhấn **Ctrl + F5**. Thử đăng nhập một nhóm ở lớp 7, xem bài nhóm thứ hai, gửi góp ý, rồi mở lại bằng nhóm nhận. Giáo viên kiểm tra chức năng ẩn/hiện góp ý.

Nếu hiện “Chức năng góp ý chưa được bật trên hệ thống”, nghĩa là bản triển khai Apps Script đang dùng chưa có API mới. Khi đó kiểm tra lại bước 2–4.

## Quyền riêng tư và tương thích

- Bài học sinh không bị chỉnh sửa bởi hoạt động góp ý. Góp ý lưu riêng tại sheet `Gop_y_cheo_STEM7`.
- Nhóm gửi phải xác thực bằng phiên của **chính nhóm mình**; phía máy chủ chỉ cho xem bài nhóm khác **cùng lớp**.
- Phần bản công khai chỉ gồm nội dung giới thiệu, nguồn, thứ tự khám phá, lí do và thông điệp; không trả về mã nhóm, phiên đăng nhập, nhận xét kiểm thử riêng hoặc dữ liệu giáo viên.
- Góp ý bị ẩn không hiển thị trong hộp nhận xét của học sinh, nhưng giáo viên vẫn xem được để kiểm duyệt.
- Thông báo góp ý mới được đánh dấu trên bước 3; hoạt động kiểm tra khoảng mỗi 60 giây khi ứng dụng mở và đang trực tuyến.
- JavaScript phía học sinh giữ cú pháp tương thích Chrome 75 và sử dụng Leaflet sẵn có. Cần thử trực tiếp trên Chrome 75, Google Sites và mạng phòng máy trước khi triển khai đồng loạt.
