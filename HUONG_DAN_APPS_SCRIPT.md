# Hướng dẫn cài Google Apps Script – STEM Tin học 7

Ứng dụng: https://ph0823.github.io/stemTin7DiSan/

## 1. Tạo máy chủ và bảng tính

1. Mở https://script.google.com/ → Dự án mới.
2. Sao chép toàn bộ mã trong AppsScript_STEM7.gs tại repository vào tệp Code.gs.
3. Lưu, chọn hàm setup → Chạy → cấp quyền. Hàm này tạo bảng tính STEM7 - Hành trình di sản số gồm hai sheet: Nhom_STEM7 và Lich_su_chinh_sua. Mở Nhật ký thực thi để xem URL của bảng tính.
4. Chọn Triển khai → Tạo lượt triển khai mới → Ứng dụng web. Thực thi dưới danh nghĩa Tôi (Me), quyền truy cập Bất kỳ ai (Anyone). Triển khai và sao chép URL kết thúc bằng /exec.
5. Trong ứng dụng HTML, chọn Lưu trực tuyến → dán URL /exec → Lưu địa chỉ máy chủ → Kiểm tra kết nối.
6. Chọn Giáo viên, đăng nhập mật khẩu 8 ký tự ban đầu 22112026. Phải đổi ngay thành mật khẩu 8 ký tự khác trước khi xem dữ liệu.

## 2. Học sinh

- Chọn lớp và nhóm trên máy, sau đó mở Lưu trực tuyến và nhấn Tạo nhóm trực tuyến.
- Ghi lại mã 4 ký tự do máy chủ cấp; chỉ chia sẻ trong nhóm.
- Sau khi sửa bài, chọn Lưu bài lên Google Sheets. Có chức năng lưu định kỳ khi phiên trực tuyến đang mở.
- Tại máy khác: Lưu trực tuyến → nhập lớp, nhóm và mã 4 ký tự → Mở nhóm bằng mã.
- Nếu cùng một nhóm được chỉnh trên hai máy, việc lưu có thể báo xung đột. Hãy lấy bài mới từ máy chủ trước khi tiếp tục. Luôn giữ tệp JSON sao lưu.

## 3. Giáo viên

- Mở Giáo viên → đăng nhập để xem tất cả nhóm.
- Danh sách hiển thị lớp, nhóm và thời gian hoạt động trực tuyến. Chọn một nhóm để xem bài và thời gian bắt đầu, chỉnh sửa gần nhất.
- Giáo viên có thể chỉnh lời giới thiệu, nguồn và thông điệp, ghi chú chỉnh sửa và lưu. Lịch sử nằm trong sheet Lich_su_chinh_sua.
- Có thể cấp mã nhóm 4 ký tự mới. Mã cũ và phiên học sinh cũ hết hiệu lực sau khi đổi.
- Có chức năng đổi mật khẩu giáo viên, yêu cầu đúng 8 ký tự.

## 4. Lưu ý bảo mật và vận hành

- Mật khẩu giáo viên và mã nhóm không nằm dạng rõ trong HTML công khai; Apps Script lưu giá trị HMAC, khóa bí mật nằm trong Script Properties.
- Mã chỉ 4 ký tự có độ bảo vệ thấp so với tài khoản cá nhân. Không lưu dữ liệu nhạy cảm hoặc thông tin cá nhân của học sinh.
- Hệ thống giới hạn 5 lần nhập mã/mật khẩu sai trong 15 phút. Có thể bị khóa tạm nếu ai đó nhập sai quá nhiều.
- Bài làm vẫn được lưu riêng trên trình duyệt, kể cả khi chưa triển khai Apps Script.
- Thời gian làm là số giây hoạt động trực tuyến được gửi từ trình duyệt trong lúc trang hiển thị; thời gian làm ngoại tuyến chưa tính.
- Khi cập nhật mã Apps Script, phải vào Triển khai → Quản lý lượt triển khai → Chỉnh sửa → Phiên bản mới, không chỉ nhấn Lưu trong trình soạn thảo.
- Web App triển khai công khai cần thử nghiệm quyền, khung nhúng Google Sites và Chrome 75 trên máy thực tế trước khi cho nhiều lớp dùng.

## 5. Kiểm tra mẫu

1. Tạo 7A1 / Nhóm 1, nhận mã, lưu bài từ máy A. Kiểm tra Google Sheets.
2. Mở bài từ máy B bằng mã 4 ký tự, kiểm tra nội dung và lưu.
3. Vào chế độ Giáo viên, sửa lời giới thiệu, lưu và xem lịch sử.
4. Thử xung đột: sửa từ hai máy rồi lưu từ máy đang có dữ liệu cũ.
5. Thử F5, nhập/xuất JSON, chuyển nhóm, Google Sites và Chrome 75.

Chú ý: Cần người dùng thực hiện cấp quyền và triển khai Web App. Repository chỉ chứa mã nguồn, chưa phải máy chủ Apps Script đang hoạt động.

## Cập nhật ngày 22/11/2026: kết nối mặc định và sửa postMessage

- index.html đã gắn sẵn Web App: https://script.google.com/macros/s/AKfycbwSPofyS3booetjjI90Vc1eCsCectWbJHAr5mCQAaVhumjkVR62dsr1JuDZEdESozC0/exec
- Khi mở ứng dụng, hệ thống kiểm tra kết nối âm thầm. Chỉ hiển thị cảnh báo khi máy chủ không phản hồi/kết nối lỗi; sau khi chọn nhóm cục bộ sẽ mở hộp thiết lập trực tuyến nếu chưa đăng nhập nhóm.
- Lỗi Console “target origin https://ph0823.github.io does not match ...script.googleusercontent.com” đã được xử lý bằng cách tìm đúng ancestor GitHub Pages qua window.location.ancestorOrigins của Chrome.
- **BẮT BUỘC:** Thay toàn bộ Code.gs hiện tại bằng nội dung mới nhất của AppsScript_STEM7.gs, rồi vào **Triển khai → Quản lý lượt triển khai → Chỉnh sửa → Phiên bản mới → Triển khai**. Chỉ cập nhật GitHub Pages không thay đổi Apps Script đã triển khai ở URL /exec.
- Sau triển khai, mở https://ph0823.github.io/stemTin7DiSan/ bằng Ctrl+F5. Kiểm tra không còn lỗi target origin, thử Lưu trực tuyến → Kiểm tra kết nối. Khi kết nối thành công sẽ không xuất hiện thông báo thành công; chỉ thấy cảnh báo khi có lỗi.
- Nếu vẫn báo lỗi hoặc không phản hồi, kiểm tra quyền Web App là Anyone, chạy lại setup() (không xóa Sheet cũ), và kiểm tra URL đúng /exec.


## Nâng cấp V4.4 – Đánh giá và phản hồi học tập (Apps Script V5)

- Với hệ thống đã cài: sao lưu bảng tính, thay mã Code.gs bằng AppsScript_STEM7.gs mới, giữ nguyên Script Properties và ID bảng tính; chạy setup() để bảo đảm các sheet tồn tại. Không xóa dữ liệu, không tạo Web App mới.
- Triển khai phiên bản mới trên lượt triển khai đang dùng, giữ URL /exec hiện tại. Kiểm tra kết nối trong Giáo viên phải báo Server V5. HTML V4.4 vẫn dùng được với V4 ở chế độ lưu nháp, nhưng chưa gửi điểm/lịch sử; V3 chỉ đọc tiến độ, không chấm trực tuyến.
- Rubric KHBD 10 điểm: chọn đủ 6 tiêu chí, chọn Lưu nháp / Gửi điểm – yêu cầu chỉnh sửa / Gửi điểm – xác nhận kết quả. Yêu cầu chỉnh sửa phải có nhận xét. Chọn Lưu và chấm tiếp để chuyển sang bài tiếp theo chưa xác nhận.
- Sheet Danh_gia_STEM7 lưu từng lần chấm theo dòng mới, giữ các dòng V4 cũ như bản nháp; không thay đổi payload hoặc revision bài học sinh. Bản đã gửi gần nhất vẫn hiển thị cho học sinh khi giáo viên tạo bản nháp mới. Nếu bài thay đổi, kết quả cũ được đánh dấu cần kiểm tra lại.
- Học sinh mở Kết quả đánh giá trên thanh công cụ khi đã đăng nhập bài trực tuyến; chỉ xem kết quả đã gửi của bài mình, không xem bản nháp hoặc điểm bạn khác. Nhận xét riêng trong tab Nhận xét vẫn sử dụng sheet Gop_y_cheo_STEM7.
- Kiểm thử trên bài mẫu: lưu nháp (HS không thấy), gửi yêu cầu sửa (HS thấy điểm và nhận xét), sửa bài và lưu (GV thấy cần chấm lại), xác nhận lần hai, xem lịch sử, xuất CSV. Kiểm tra bằng Chrome 75 và trong Google Sites trước khi sử dụng chính thức. Không dùng dữ liệu thật để thử nghiệm xung đột.
