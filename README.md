## V4.5 – STEM 45 phút / Apps Script V6

Tiến độ 12 nhiệm vụ (4/3/4/1), không phải điểm. Báo cáo do GV đánh giá. HS dùng tư liệu có sẵn, 25–50 từ/thẻ (tối thiểu 25; dài hơn chỉ nhắc); ảnh riêng cần nguồn và quyền sử dụng. So sánh A/B theo nhu cầu người xem, ghi góp ý, sửa và giải thích lợi ích, lưu hai bản khác nhau. Góp ý trực tiếp được chấp nhận. Giữ rubric 10 điểm, dữ liệu và API cũ. Triển khai lại Apps Script V6 tại URL /exec hiện có để thống kê nhanh và đồng nhất. Hướng dẫn V3–V5 bên dưới là lịch sử tương thích.

# STEM Tin học 7 – Hành trình di sản số

Ứng dụng: https://ph0823.github.io/stemTin7DiSan/

## Tự động lưu lên Google Sheets (Apps Script V3)

- Khi học sinh chọn **Tạo bài lần đầu**, ứng dụng lưu bài ngay trên máy và kiểm tra máy chủ. Nếu Apps Script đã nâng cấp **V3**, ứng dụng tự tạo bản trên Google Sheets và cấp mã bài 4 ký tự.
- Nhấn **Lưu bài**: luôn lưu bản cục bộ trước, sau đó gửi lên Google Sheets nếu phiên trực tuyến hợp lệ. Các thay đổi được tự đồng bộ sau khoảng 12 giây khi có kết nối.
- Phân biệt rõ **Đã lưu trên Google Sheets** (máy chủ đã phản hồi) và **Chỉ lưu trên máy / đang chờ xác nhận** (không được xem là đã đồng bộ).
- Mã bài 4 ký tự được hiển thị khi tạo thành công; học sinh cần ghi lại để dùng trên máy khác. Có thể nhấn **Xem mã bài** trong cùng phiên.
- Mỗi lần tạo bài có một khóa ngẫu nhiên được lưu tại máy. Nếu mất phản hồi hoặc F5 khi tạo, lần thử sau dùng **cùng khóa**. Apps Script V3 chỉ trả lại bản đã tạo, không tạo dòng trùng và không cấp lại mã nếu giáo viên đã thay mã.
- Nếu tên lớp + học sinh/nhóm đã tồn tại nhưng không phải cùng lần tạo, máy chủ **từ chối ghi đè**. Mở bằng mã của bài đã có hoặc hỏi giáo viên.
- Khi F5, phiên trực tuyến đang có sẽ kiểm tra phiên bản từ Google Sheets trước khi gửi tiếp. Khi mở bài trên máy khác, nếu bài trên máy và bài trực tuyến khác nhau, giữ bản cục bộ và yêu cầu người dùng chọn cách xử lý; không tự ghi đè.
- Nếu chưa có mạng hoặc phiên hết hạn, học sinh tiếp tục làm bài trên máy và có thể xuất bản JSON dự phòng.

**Bắt buộc triển khai lại Apps Script V3 theo hướng dẫn bên dưới.** Phiên bản Apps Script V2 cũ sẽ không được dùng để tự tạo bài, vì không có cơ chế thử lại an toàn.

## Kiểm thử chéo trực tuyến, không đổi máy

Học sinh ở **nhóm đã lưu bài trực tuyến** có thể chọn **Bước 3 – Kiểm thử → Xem và góp ý bài nhóm bạn**. Danh sách chỉ có các nhóm cùng lớp đang lưu trên hệ thống. Học sinh mở bản chỉ xem gồm bản đồ với ba địa điểm, lời giới thiệu, nguồn tham khảo, hành trình và thông điệp bảo tồn. Không yêu cầu mã 4 ký tự của nhóm bạn và không thể sửa trực tiếp bài nhóm bạn.

Học sinh chọn ít nhất một tiêu chí kiểm thử, ghi nhận xét từ 12–300 ký tự rồi gửi. Nhóm sở hữu nhận thông báo tại bước Kiểm thử (kiểm tra lại khoảng mỗi 60 giây), có thể đưa nhận xét vào phiếu kiểm thử, tự sửa sản phẩm và lưu phiên bản sau.

Giáo viên chọn một nhóm tại **Giáo viên → Nhận xét và kiểm duyệt góp ý** để đọc phản hồi, gửi nhận xét (12–500 ký tự), ẩn hoặc hiện lại góp ý không phù hợp.

**Giới hạn:** tối đa 3 lượt góp ý cho một nhóm đích/ngày từ mỗi nhóm gửi; tối thiểu 45 giây giữa hai lượt. Hệ thống từ chối một số từ ngữ xúc phạm, liên kết và thông tin liên lạc. Bộ lọc từ khóa chỉ hỗ trợ kiểm soát cơ bản, không thay thế kiểm duyệt của giáo viên. Không sử dụng dữ liệu cá nhân nhạy cảm.

## Quan trọng: triển khai lại Google Apps Script

Cập nhật `index.html` trên GitHub Pages **không** tự cập nhật Web App Apps Script đang phục vụ lưu bài.

1. Mở **dự án Apps Script đang được ứng dụng sử dụng** (không tạo dự án mới làm mất liên kết với dữ liệu cũ).
2. Thay nội dung mã bằng **[AppsScript_STEM7.gs](AppsScript_STEM7.gs)** mới nhất trong repository và lưu.
3. Chạy `setup()` để tạo hoặc xác nhận trang tính `Gop_y_cheo_STEM7` và bổ sung cột `createRequestHash` ở cuối `Nhom_STEM7` (tổng 17 cột) trong bảng tính hiện tại. Hàm này không xóa các nhóm đã lưu và không đặt lại mật khẩu giáo viên đã đổi.
4. Chọn **Deploy → Manage deployments → Edit (biểu tượng bút chì)**, chọn **New version**, sau đó **Deploy**. Đặt **Execute as: Me**, **Who has access: Anyone**, theo cấu hình ứng dụng hiện có.
5. Giữ URL `/exec` cũ. Nếu URL thay đổi, cập nhật trong **Bài của em/nhóm em → Cài đặt kết nối (dành cho giáo viên)**.
6. Trên máy học sinh, nhấn **Ctrl + F5**. Tạo một tên thử mới, kiểm tra đã xuất hiện trên `Nhom_STEM7`, ghi lại mã 4 ký tự, lưu một thay đổi, nhấn F5 rồi mở trên máy khác bằng mã. Cuối cùng kiểm thử góp ý chéo và quản lý giáo viên.

Nếu hiện “Cần phiên bản Apps Script mới để lưu an toàn”, bản triển khai đang chạy chưa phải V3. Nếu hiện “Chức năng góp ý chưa được bật trên hệ thống”, phiên bản đang chạy chưa hỗ trợ API góp ý. Kiểm tra lại các bước 2–4.

## Quyền riêng tư và tương thích

- Bài học sinh không bị chỉnh sửa bởi hoạt động góp ý. Góp ý lưu riêng tại sheet `Gop_y_cheo_STEM7`.
- Nhóm gửi phải xác thực bằng phiên của **chính nhóm mình**; phía máy chủ chỉ cho xem bài nhóm khác **cùng lớp**.
- Phần bản công khai chỉ gồm nội dung giới thiệu, nguồn, thứ tự khám phá, lí do và thông điệp; không trả về mã nhóm, phiên đăng nhập, nhận xét kiểm thử riêng hoặc dữ liệu giáo viên.
- Góp ý bị ẩn không hiển thị trong hộp nhận xét của học sinh, nhưng giáo viên vẫn xem được để kiểm duyệt.
- Thông báo góp ý mới được đánh dấu trên bước 3; hoạt động kiểm tra khoảng mỗi 60 giây khi ứng dụng mở và đang trực tuyến.
- JavaScript phía học sinh giữ cú pháp tương thích Chrome 75 và sử dụng Leaflet sẵn có. Cần thử trực tiếp trên Chrome 75, Google Sites và mạng phòng máy trước khi triển khai đồng loạt.
