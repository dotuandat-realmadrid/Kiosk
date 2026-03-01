# Assets Images

Thư mục này chứa các hình ảnh cho ứng dụng Kiosk Coop-bank.

## Cấu trúc thư mục:

```
assets/
├── images/
│   ├── backgrounds/     # Ảnh nền
│   │   ├── main-bg.jpg  # Ảnh nền màn hình chính
│   │   └── ...
│   ├── logos/          # Logo và biểu tượng
│   │   ├── coopbank-logo.png  # Logo Coop-bank
│   │   └── ...
│   └── icons/          # Icon khác
│       └── ...
```

## Cách sử dụng:

1. Đặt ảnh vào thư mục tương ứng
2. Import ảnh trong component React:
   ```javascript
   import backgroundImage from '../assets/images/backgrounds/main-bg.jpg'
   ```
3. Sử dụng trong style:
   ```javascript
   style={{ backgroundImage: `url(${backgroundImage})` }}
   ```

## Lưu ý:

- Sử dụng định dạng ảnh tối ưu (JPG cho ảnh nền, PNG cho logo)
- Kích thước ảnh nên được tối ưu để tải nhanh
- Đặt tên file có ý nghĩa và dễ hiểu
