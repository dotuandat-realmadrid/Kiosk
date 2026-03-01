// Template mapping cho từng loại mẫu
export const TEMPLATE_MAPPING = {
  // Mẫu 03: YÊU CẦU TRA SOÁT, KHIẾU NẠI (mau_nhht.html)
  "tra-soat-khieu-nai": {
    sections: [
      {
        title: "Thông tin chung",
        fields: [
          { name: "document_location", label: "Nơi lập", type: "select-with-input", required: true },
          { name: "document_date", label: "Ngày lập văn bản", type: "date", required: true },
          { name: "branch_name", label: "Chi nhánh Ngân hàng", type: "text", required: true },
          { name: "review_round", label: "Lần tra soát", type: "tel", defaultValue: "1" }
        ]
      },
      {
        title: "Thông tin liên hệ",
        fields: [
          { name: "phone", label: "Số điện thoại", type: "tel", required: true }
        ]
      },
      {
        title: "Thông tin doanh nghiệp (nếu có)",
        fields: [
          { name: "business_name", label: "Tên đơn vị", type: "text" },
          { name: "business_license", label: "Giấy CNĐKKD", type: "text", col: "4" },
          { name: "business_issue_date", label: "Ngày cấp", type: "date", col: "4" },
          { name: "business_issuer", label: "Cơ quan cấp", type: "text", col: "4" },
          { name: "business_address", label: "Địa chỉ doanh nghiệp", type: "text", col: "8" },
          { name: "business_phone", label: "Điện thoại DN", type: "tel", col: "4" }
        ]
      },
      {
        title: "Thông tin giao dịch đề nghị tra soát/khiếu nại",
        fields: [
          {
            name: "transaction_channel",
            label: "Kênh giao dịch",
            type: "checkbox-single",
            options: ["Thẻ", "Mobile banking", "Quầy"]
          },
          {
            name: "transaction_type",
            label: "Loại giao dịch",
            type: "checkbox-single",
            options: ["Rút tiền", "Chuyển khoản", "Thanh toán"]
          },
          {
            name: "transaction_device",
            label: "Thiết bị giao dịch",
            type: "checkbox-single",
            options: ["ATM/POS", "Mobile banking", "Quầy"]
          },
          { name: "transaction_date", label: "Ngày giao dịch", type: "date", col: "6" },
          { name: "account_number", label: "Số TK/Số thẻ giao dịch", type: "tel", col: "6" },
          { name: "amount", label: "Số tiền giao dịch", type: "tel", col: "6" },
          { name: "transaction_id", label: "Số giao dịch", type: "tel", col: "6" },
          { name: "beneficiary_account", label: "Số TK người hưởng", type: "tel", col: "6" },
          { name: "beneficiary_name", label: "Tên người hưởng", type: "text", col: "6" },
          { name: "beneficiary_bank", label: "Ngân hàng hưởng", type: "text" },
          { name: "transaction_content", label: "Nội dung giao dịch (nếu có)", type: "textarea", rows: 2 }
        ]
      },
      {
        title: "Yêu cầu Ngân hàng Hợp tác",
        fields: [
          {
            name: "request_type",
            label: "Loại yêu cầu",
            type: "checkbox-single",
            options: ["GD không thành công/Hoàn tiền", "Chuyển nhầm", "Thay đổi nội dung chuyển tiền"],
            // vertical: true
          },
          { name: "request_content", label: "Nội dung yêu cầu", type: "textarea", rows: 3 }
        ]
      }
    ]
  },

  // Mẫu 01: THỎA THUẬN MỞ HỒ SƠ THÔNG TIN KHÁCH HÀNG (mau_1.html)
  "thoa-thuan-mo-ho-so-thong-tin-khach-hang": {
    sections: [
      {
        title: "Thông tin chung",
        fields: [
          { name: "branch_name", label: "Chi nhánh Ngân hàng", type: "text", required: true },
          { name: "document_date", label: "Ngày lập", type: "date", required: true, col: "6" },
          { name: "hskh_number", label: "Số HSKH", type: "tel", col: "6" }
        ]
      },
      {
        title: "Thông tin chi tiết khách hàng",
        fields: [
          {
            name: "resident_status",
            label: "Đối tượng",
            type: "checkbox-single",
            options: ["Cư trú", "Không cư trú"]
          },
          {
            name: "id_type",
            label: "Loại GTTT",
            type: "checkbox-single",
            options: ["Thẻ căn cước", "CCCD", "Hộ chiếu", 
              {"label": "Khác", "value": "Khác", "showInput": true}
            ],
          },
          { name: "current_address", label: "Nơi ở hiện nay", type: "text" },
          { name: "phone", label: "Điện thoại (*)", type: "tel", col: "4" },
          { name: "email", label: "Email (**)", type: "email", col: "4" },
          { name: "tax_code", label: "Mã số thuế", type: "text", col: "4" },
          { name: "occupation", label: "Nghề nghiệp", type: "text", col: "4" },
          { name: "position", label: "Chức vụ", type: "text", col: "4" },
          { name: "workplace", label: "Nơi công tác", type: "text", col: "4" }
        ]
      },
      {
        title: "Thông tin người đại diện",
        collapsible: true,
        fields: [
          { name: "representative_full_name", label: "Họ và tên (chữ in hoa)", type: "text", uppercase: true },
          {
            name: "representative_gender",
            label: "Giới tính",
            type: "checkbox-single",
            options: ["Nam", "Nữ"]
          },
          { name: "representative_date_of_birth", label: "Ngày sinh", type: "date", col: "6" },
          { name: "representative_nation", label: "Quốc tịch", type: "text", col: "6" },
          {
            name: "representative_resident_status",
            label: "Đối tượng",
            type: "checkbox-single",
            options: ["Cư trú", "Không cư trú"]
          },
          {
            name: "representative_id_type",
            label: "Loại GTTT",
            type: "checkbox-single",
            options: ["Thẻ căn cước", "CCCD", "Hộ chiếu", 
              {"label": "Khác", "value": "Khác", "showInput": true}
            ]
          },
          { name: "representative_nation_no", label: "Số GTTT", type: "tel", col: "6" },
          { name: "representative_date_of_issue", label: "Ngày cấp", type: "date", col: "6" },
          { name: "representative_expired_date", label: "Ngày hết hạn", type: "date", col: "6" },
          { name: "representative_place_of_issue", label: "Nơi cấp", type: "text", col: "6" },
          { name: "representative_address", label: "Địa chỉ đăng ký hộ khẩu thường trú", type: "text" },
          { name: "representative_current_address", label: "Nơi ở hiện nay", type: "text" },
          { name: "representative_phone", label: "Điện thoại (*)", type: "tel", col: "4" },
          { name: "representative_email", label: "Email (**)", type: "email", col: "4" },
          { name: "representative_tax_code", label: "Mã số thuế", type: "text", col: "4" },
          { name: "representative_occupation", label: "Nghề nghiệp", type: "text", col: "4" },
          { name: "representative_position", label: "Chức vụ", type: "text", col: "4" },
          { name: "representative_workplace", label: "Nơi công tác", type: "text", col: "4" }

        ]
      },
      {
        title: "Dịch vụ mở tài khoản thanh toán (I)",
        fields: [
          {
            name: "currency_type",
            label: "Loại tiền",
            type: "checkbox-single",
            options: ["VND", 
              {"label": "Khác", "value": "Khác", "showInput": true}],
            required: true
          },
        ]
      },
      {
        title: "Dịch vụ Mobile Banking (II)",
        fields: [
          {
            name: "mobile_banking_register",
            label: "Đăng ký dịch vụ",
            type: "checkbox-single",
            options: ["Có", "Không"]
          },
          { name: "mobile_banking_package", label: "Gói dịch vụ", type: "text" },
          { name: "mobile_banking_fee_account", label: "Số tài khoản thanh toán thu phí", type: "tel" },
          {
            name: "password_method",
            label: "Phương thức nhận mật khẩu",
            type: "checkbox-single",
            options: ["Tại quầy", "Qua SMS", "Qua Email"],
            required: true
          }
        ]
      },
      {
        title: "Dịch vụ SMS Banking (III)",
        fields: [
          {
            name: "sms_banking_register",
            label: "Đăng ký dịch vụ",
            type: "checkbox-single",
            options: ["Có", "Không"],
            required: true
          },
          { name: "sms_banking_fee_account", label: "Số tài khoản thanh toán thu phí", type: "tel" },
          {
            name: "sms_services",
            label: "Yêu cầu cung cấp các dịch vụ",
            type: "checkbox-single",
            multiple: true,
            options: [
              {label: "Tin nhắn Thanh toán (Mặc định)", value: "Tin nhắn Thanh toán (Mặc định)", checked: true},
              {label: "Tin nhắn Tín dụng", value: "Tin nhắn Tín dụng"},
              {label: "Tin nhắn Phi tài chính", value: "Tin nhắn Phi tài chính"},
              {label: "Tin nhắn Tiết kiệm", value: "Tin nhắn Tiết kiệm"},
              {label: "Biến động số dư qua Email", value: "Biến động số dư qua Email"}
            ],
            vertical: true
          }
        ]
      },
      {
        title: "Dịch vụ Thẻ (IV)",
        fields: [
          {
            name: "debit_card_register",
            label: "Thẻ ghi nợ nội địa",
            type: "checkbox-single",
            options: ["Có", "Không"],
            required: true
          },
          { name: "main_card_print_name", label: "Tên in trên thẻ (chữ in hoa không dấu)", type: "text" },
          { name: "main_card_linked_account", label: "Số TK liên kết thẻ", type: "tel" },
          {
            name: "fee_payment_method",
            label: "Hình thức thanh toán phí phát hành",
            type: "checkbox-single",
            options: ["Ghi Nợ Tài khoản", "Nộp tiền mặt"]
          }
        ]
      },
      {
        title: "Thông tin thẻ phụ 1 (nếu có)",
        collapsible: true,
        fields: [
          { name: "sub_card1_full_name", label: "Họ và tên (chữ in hoa)", type: "text", uppercase: true },
          { name: "sub_card1_relationship", label: "Quan hệ với chủ thẻ chính", type: "text" },
          { name: "sub_card1_date_of_birth", label: "Ngày sinh", type: "date" },
          {
            name: "sub_card1_gender",
            label: "Giới tính",
            type: "checkbox-single",
            options: ["Nam", "Nữ"]
          },
          {
            name: "sub_card1_id_type",
            label: "Loại GTTT",
            type: "checkbox-single",
            options: ["Thẻ căn cước", "CCCD", "Hộ chiếu", 
              {"label": "Khác", "value": "Khác", "showInput": true}
            ]
          },
          { name: "sub_card1_id_number", label: "Số GTTT", type: "tel" },
          { name: "sub_card1_id_issue_date", label: "Ngày cấp", type: "date" },
          { name: "sub_card1_id_issue_place", label: "Nơi cấp", type: "text" },
          { name: "sub_card1_id_expire_date", label: "Ngày hết hạn", type: "date" },
          { name: "sub_card1_contact_address", label: "Địa chỉ liên hệ", type: "text" },
          { name: "sub_card1_email", label: "Email", type: "email" },
          { name: "sub_card1_phone", label: "Điện thoại liên hệ", type: "tel" },
          { name: "sub_card1_print_name", label: "Tên in trên thẻ (chữ in hoa không dấu)", type: "text" }
        ]
      },
      {
        title: "Thông tin thẻ phụ 2 (nếu có)",
        collapsible: true,
        fields: [
          { name: "sub_card2_full_name", label: "Họ và tên (chữ in hoa)", type: "text", uppercase: true },
          { name: "sub_card2_relationship", label: "Quan hệ với chủ thẻ chính", type: "text" },
          { name: "sub_card2_date_of_birth", label: "Ngày sinh", type: "date" },
          {
            name: "sub_card2_gender",
            label: "Giới tính",
            type: "checkbox-single",
            options: ["Nam", "Nữ"]
          },
          {
            name: "sub_card2_id_type",
            label: "Loại GTTT",
            type: "checkbox-single",
            options: ["Thẻ căn cước", "CCCD", "Hộ chiếu", 
              {"label": "Khác", "value": "Khác", "showInput": true}
            ]
          },
          { name: "sub_card2_id_number", label: "Số GTTT", type: "tel" },
          { name: "sub_card2_id_issue_date", label: "Ngày cấp", type: "date" },
          { name: "sub_card2_id_issue_place", label: "Nơi cấp", type: "text" },
          { name: "sub_card2_id_expire_date", label: "Ngày hết hạn", type: "date" },
          { name: "sub_card2_contact_address", label: "Địa chỉ liên hệ", type: "text" },
          { name: "sub_card2_email", label: "Email", type: "email" },
          { name: "sub_card2_phone", label: "Điện thoại liên hệ", type: "tel" },
          { name: "sub_card2_print_name", label: "Tên in trên thẻ (chữ in hoa không dấu)", type: "text" }
        ]
      },
      {
        title: "Thông tin thẻ phụ 3 (nếu có)",
        collapsible: true,
        fields: [
          { name: "sub_card3_full_name", label: "Họ và tên (chữ in hoa)", type: "text", uppercase: true },
          { name: "sub_card3_relationship", label: "Quan hệ với chủ thẻ chính", type: "text" },
          { name: "sub_card3_date_of_birth", label: "Ngày sinh", type: "date" },
          {
            name: "sub_card3_gender",
            label: "Giới tính",
            type: "checkbox-single",
            options: ["Nam", "Nữ"]
          },
          {
            name: "sub_card3_id_type",
            label: "Loại GTTT",
            type: "checkbox-single",
            options: ["Thẻ căn cước", "CCCD", "Hộ chiếu", 
              {"label": "Khác", "value": "Khác", "showInput": true}
            ]
          },
          { name: "sub_card3_id_number", label: "Số GTTT", type: "tel" },
          { name: "sub_card3_id_issue_date", label: "Ngày cấp", type: "date" },
          { name: "sub_card3_id_issue_place", label: "Nơi cấp", type: "text" },
          { name: "sub_card3_id_expire_date", label: "Ngày hết hạn", type: "date" },
          { name: "sub_card3_contact_address", label: "Địa chỉ liên hệ", type: "text" },
          { name: "sub_card3_email", label: "Email", type: "email" },
          { name: "sub_card3_phone", label: "Điện thoại liên hệ", type: "tel" },
          { name: "sub_card3_print_name", label: "Tên in trên thẻ (chữ in hoa không dấu)", type: "text" }
        ]
      },
      {
        title: "Dịch vụ Tài khoản Định danh (Alias) (V)",
        fields: [
          {
            name: "alias_type",
            label: "Loại tài khoản Alias",
            type: "checkbox-single",
            options: ["Dãy số tùy chọn", "Nickname", "Shopname"]
          },
          { name: "alias_account", label: "Tài khoản định danh (Alias)", type: "text" },
          { name: "linked_payment_account", label: "Số tài khoản thanh toán liên kết", type: "tel" }
        ]
      },
      {
        title: "PHẦN DÀNH CHO QTDND",
        fields: [
          { name: "qtdnd", label: "QTDND", type: "text" }
        ]
      },
      {
        title: "PHẦN DÀNH CHO NGÂN HÀNG",
        fields: [
          { name: "bank_account_number", label: "Số tài khoản", type: "tel" },
          { name: "account_open_date", label: "Ngày hoạt động tài khoản", type: "text" },
          { name: "card_number", label: "Số thẻ", type: "tel" }
        ]
      }
    ]
  },

  // Mẫu 02: GIẤY ĐỀ NGHỊ ĐĂNG KÝ HỘ KINH DOANH (mau_2.html)
  "giay-de-nghi-dang-ky-ho-kinh-doanh": {
    sections: [
      {
        title: "Thông tin chung",
        fields: [
          { name: "document_location", label: "Nơi lập", type: "select-with-input", required: true },
          { name: "document_date", label: "Ngày lập văn bản", type: "date", required: true },
          { name: "business_registration_authority", label: "Kính gửi (Cơ quan đăng ký kinh doanh cấp xã)", type: "text"}
        ]
      },
      {
        title: "Thông tin cơ bản",
        fields: [
          { name: "ethnicity", label: "Dân tộc", type: "text"},
          {
            name: "id_document_type",
            label: "Loại giấy tờ pháp lý của cá nhân",
            type: "checkbox-single",
            options: ["Căn cước công dân", "Căn cước"]
          },
          { name: "phone", label: "Điện thoại (nếu có)", type: "tel"},
          { name: "email", label: "Email (nếu có)", type: "text"}
        ]
      },
      {
        title: "Địa chỉ thường trú",
        fields: [
          {name: "permanent_address_province", label: "Tỉnh/Thành phố", type: "select-with-input", col: "6"},
          {name: "permanent_address_ward", label: "Xã/Phường/Đặc khu", type: "select-with-input", col: "6"},
          {name: "permanent_address_street", label: "Số nhà, đường phố/tổ/xóm/áp/thôn", type: "text"},
        ]
      },
      {
        title: "Địa chỉ liên lạc",
        fields: [
          {name: "contact_address_province", label: "Tỉnh/Thành phố", type: "select-with-input", col: "6"},
          {name: "contact_address_ward", label: "Xã/Phường/Đặc khu", type: "select-with-input", col: "6"},
          {name: "contact_address_street", label: "Số nhà, đường phố/tổ/xóm/áp/thôn", type: "text"},
        ]
      },
      {
        title: "Đăng ký hộ kinh doanh do tôi là chủ hộ với các nội dung sau: \n\n1. Tên hộ kinh doanh:",
        fields: [
          { name: "business_household_name", label: "Tên hộ kinh doanh (ghi bằng chữ in hoa)", type: "text" },
        ]
      },
      {
        title: "2. Địa chỉ trụ sở hộ kinh doanh",
        fields: [
          { name: "headquarters_address_province", label: "Tỉnh/Thành phố", type: "select-with-input", col: "6" },
          { name: "headquarters_address_ward", label: "Xã/Phường/Đặc khu", type: "select-with-input", col: "6" },
          { name: "headquarters_address_street", label: "Số nhà, ngách, hẻm, ngõ, đường phố/tổ/xóm/áp/thôn", type: "text" },
          { name: "headquarters_phone", label: "Điện thoại (nếu có)", type: "tel", col: "6" },
          { name: "headquarters_fax", label: "Fax (nếu có)", type: "tel", col: "6" },
          { name: "headquarters_email", label: "Email (nếu có)", type: "email" },
          { name: "headquarters_website", label: "Website (nếu có)", type: "text" }
        ]
      },
      {
        title: "3. Ngành nghề kinh doanh",
        fields: [
          { 
            name: "business_sectors", 
            // label: "Ngành nghề kinh doanh", 
            type: "table",
            columns: [
              { name: "stt", label: "STT", type: "text", width: "60px" },
              { name: "industry_name", label: "Tên ngành", type: "textarea" },
              { name: "industry_code", label: "Mã ngành", type: "modal-select", width: "120px" },
              { name: "main_business", label: "Ngành, nghề kinh doanh chính", type: "checkbox", width: "180px" }
            ],
            minRows: 1,
            defaultRow: {
              stt: "",
              industry_name: "",
              industry_code: "",
              main_business: ""
            }
          }
        ]
      },
      {
        title: "4.Vốn kinh doanh",
        fields: [
          { name: "business_capital", label: "Tổng số (bằng số, bằng chữ, VNĐ)", type: "text" }
        ]
      },
      {
        title: "5. Thông tin đăng ký thuế",
        fields: [
          { name: "tax_registration_province", label: "Tỉnh/Thành phố", type: "select-with-input", col: "6" },
          { name: "tax_registration_ward", label: "Xã/Phường/Đặc khu", type: "select-with-input", col: "6" },
          { name: "tax_registration_street", label: "Số nhà, ngách, hẻm, ngõ, đường phố/tổ/xóm/áp/thôn", type: "text" },
          { name: "tax_registration_phone", label: "Điện thoại (nếu có)", type: "tel" },
          { name: "tax_registration_email", label: "Email (nếu có)", type: "email" },
          { name: "operation_start_date", label: "Ngày bắt đầu hoạt động", type: "date", col: "6" },
          { name: "total_employees", label: "Tổng số lao động (dự kiến)", type: "tel", col: "6" },
          { 
            name: "business_locations", 
            label: "Địa điểm kinh doanh của hộ kinh doanh", 
            type: "table",
            columns: [
              { 
                name: "stt", 
                label: "STT", 
                type: "text", 
                width: "46px",
              },
              { 
                name: "location_name", 
                label: "Tên địa điểm kinh doanh", 
                type: "textarea",
                width: "250px",
                rows: 3
              },
              { 
                name: "location_province", 
                label: "Tỉnh/Thành phố", 
                type: "select-with-input",
                width: "200px",
                placeholder: "Chọn Tỉnh/Thành phố"
              },
              { 
                name: "location_ward", 
                label: "Xã/Phường/Đặc khu", 
                type: "select-with-input",
                width: "210px",
                placeholder: "Chọn Xã/Phường/Đặc khu"
              },
              { 
                name: "location_address", 
                label: "Số nhà, đường phố/tổ/xóm/ấp/thôn", 
                type: "textarea",
                width: "320px",
                rows: 3
              },
              { 
                name: "start_date", 
                label: "Ngày bắt đầu hoạt động", 
                type: "date",
                width: "148px",
              }
            ],
            minRows: 1,
            defaultRow: {
              stt: "1",
              location_name: "",
              location_province: "",
              location_ward: "",
              location_address: "",
              start_date: ""
            }
          }
        ]
      },
      {
        title: "6. Chủ thể thành lập hộ kinh doanh",
        fields: [
          { 
            name: "establishment_entity", 
            label: "Chủ thể thành lập hộ kinh doanh (đánh dấu X vào ô thích hợp):", 
            type: "checkbox-single",
            options: ["Cá nhân", "Các thành viên hộ gia đình"]
          }
        ]
      },
      {
        title: "7. Thông tin về các thành viên hộ gia đình tham gia thành lập hộ kinh doanh",
        fields: [
          { 
            name: "family_members", // Đổi tên từ business_location
            label: "Thông tin các thành viên hộ gia đình", 
            type: "table",
            columns: [
              { 
                name: "stt", 
                label: "STT", 
                type: "text",
                width: "46px"
              },
              { 
                name: "full_name", 
                label: "Họ tên", 
                type: "textarea",
                width: "180px",
                rows: 3
              },
              { 
                name: "birth_date_month_year", 
                label: "Ngày, tháng, năm sinh", 
                type: "date",
                width: "148px",
              },
              { 
                name: "gender", 
                label: "Giới tính", 
                type: "text",
                width: "100px",
              },
              { 
                name: "nationality", 
                label: "Quốc tịch", 
                type: "text",
                width: "120px",
                defaultValue: "Việt Nam"
              },
              { 
                name: "ethnicity", 
                label: "Dân tộc", 
                type: "text",
                width: "100px",
                defaultValue: "Kinh"
              },
              { 
                name: "permanent_address", 
                label: "Địa chỉ thường trú", 
                type: "textarea",
                width: "200px",
                rows: 3
              },
              { 
                name: "contact_address", 
                label: "Địa chỉ liên lạc", 
                type: "textarea",
                width: "200px",
                rows: 3
              },
              { 
                name: "id_number_issue_date", 
                label: "Số, ngày cấp, cơ quan cấp CCCD/CMND", 
                type: "textarea",
                width: "200px",
                rows: 3
              },
              { 
                name: "signature", 
                label: "Chữ ký", 
                type: "textarea",
                width: "120px",
                rows: 3
              }
            ],
            minRows: 1,
            defaultRow: {
              stt: "1",
              full_name: "",
              birth_date_month_year: "",
              gender: "",
              nationality: "Việt Nam",
              ethnicity: "Kinh",
              permanent_address: "",
              contact_address: "",
              id_number_issue_date: "",
              signature: ""
            }
          }
        ]
      }
    ]
  },

  // Mẫu 04: HỢP ĐỒNG CHO VAY THEO HẠN MỨC THẤU CHI (mau_4.html)
  "hop-dong-cho-vay-hmtc": {
    sections: [
      {
        title: "Thông tin chung",
        fields: [
          { name: "branch_name", label: "Chi nhánh Ngân hàng", type: "text", required: true },
          { name: "contract_number", label: "Số hợp đồng cho vay", type: "tel", required: true, col: "6" },
          { name: "document_date", label: "Ngày lập", type: "date", required: true, col: "6" }
        ]
      },
      {
        title: "Bên cho vay (Bên A)",
        fields: [
          { label: "Mã số hợp tác xã", name: "lender_cooperative_code", type: "text", col: "6" },
          { label: "Địa chỉ", name: "lender_address", type: "text", col: "6" },
          { label: "Điện thoại", name: "lender_phone", type: "tel", col: "6" },
          { label: "Fax", name: "lender_fax", type: "tel", col: "6" },
          { label: "Người đại diện Ông/Bà", name: "lender_representative", type: "text", col: "6" },
          { label: "Chức vụ", name: "lender_representative_position", type: "text", col: "6" },
          { label: "Giấy uy quyền số", name: "lender_authorization_number", type: "text", col: "6" },
          { label: "Giấy ủy quyền số do Ông/Bà", name: "lender_authorization_issuer", type: "text", col: "6" },
          { label: "Chức vụ", name: "lender_authorization_issuer_position", type: "text", col: "6" },
          { label: "Ký ngày", name: "lender_authorization_issuer_date", type: "date", col: "6" }
        ]
      },
      {
        title: "Bên vay (Bên B)",
        fields: [
          { label: "Hiện đang công tác tại", name: "borrower_workplace", type: "text", col: "12" },
          { label: "Điện thoại", name: "borrower_phone", type: "tel", col: "6" },
          { label: "Mã số thuế của khách hàng (nếu có)", name: "borrower_tax_code", type: "text", col: "6" },
          { label: "Tài khoản ngân hàng", name: "borrower_bank_account", type: "tel", col: "6" },
          { label: "Tại ngân hàng", name: "borrower_bank_name", type: "text", col: "6" }
        ]
      },
      {
        title: "ĐIỀU 2. Hạn mức, thời hạn, mục đích sử dụng tiền vay, đồng tiền cho vay và trả nợ",
        fields: [
          { label: "Bên A chấp thuận cho bên B vay theo HMTC", name: "hmtc_approval", type: "text", col: "12" },
          { 
            label: "Phương thức cấp hạn mức thấu chi",
            name: "hmtc_payment_method",
            type: "checkbox-single",
            options: ["Cấp hạn mức thấu chi không có tài sản bảo đảm.", "Cấp hạn mức thấu chi có tài sản bảo đảm."]
          },
          { label: "Thời gian duy trì HMTC", name: "hmtc_duration", type: "date", col: "12" }
        ]
      },
      {
        title: "ĐIỀU 3. Lãi suất cho vay",
        fields: [
          { label: "Mức lãi suất cho vay (%/năm)", name: "loan_interest_rate", type: "text", col: "6" },
          { label: "Biên độ (%/năm)", name: "loan_margin", type: "text", col: "6" }
        ]
      },
      {
        title: "ĐIỀU 11. Hình thức bảo đảm tiền vay",
        fields: [
          { 
            label: "Bên A cấp hạn mức thấu chi cho bên B theo các hình thức sau đây",
            name: "hmtc_security_method",
            type: "checkbox-single",
            vertical: true,
            options: [
              "Không có tài sản bảo đảm.", 
              "Cho vay có tài sản bảo đảm: "
               + "\"Cầm cố, thế chấp  tài sản của bên B\" - \"Bảo lãnh bằng tài sản của bên thứ ba\""
            ]
           },
           { label: "Hợp đồng bảo đảm (thế chấp/cầm cố/bảo lãnh) số", name: "security_contract_number", type: "tel", col: "6" },
           { label: "Ký ngày", name: "security_contract_date", type: "date", col: "6" }
        ]
      },
      {
        title: "Điều 15. Thông báo và bảo mật thông tin",
        fields: [
          { label: "Địa chỉ nhận thông báo bên B", name: "borrower_notification_address", type: "text" },
          { label: "Email nhận thông báo bên B", name: "borrower_notification_email", type: "email", col: "6" },
          { label: "Số điện thoại nhận thông báo bên B", name: "borrower_notification_phone", type: "tel", col: "6" },
          { label: "Địa chỉ nhận thông báo bên A", name: "lender_notification_address", type: "text" },
          { label: "Số điện thoại nhận thông báo bên A", name: "lender_notification_phone", type: "tel", col: "6" },
          { label: "Người đại diện bên A", name: "lender_representative_name", type: "text", col: "6" }
        ]
      }
    ]
  },

  // Mẫu 05: GIẤY ĐỀ NGHỊ ĐIỀU CHỈNH HẠN MỨC THẤU CHI (mau_5.html)
  "giay-de-nghi-dieu-chinh-hmtc": {
    sections: [
      {
        title: "Thông tin chung",
        fields: [
          { name: "branch_name", label: "Chi nhánh Ngân hàng", type: "text", required: true, col: "6" },
          { name: "document_date", label: "Ngày lập", type: "date", required: true, col: "6" },
        ]
      },
      {
        title: "II. Nội dung đề nghị điều chỉnh hạn mức thấu chi",
        fields: [
          { label: "Số Hợp dồng cho vay hạn mức thấu chi số", name: "hmtc_contract_number", type: "tel", col: "6" },
          { label: "Ký ngày", name: "hmtc_contract_date", type: "date", col: "6" },
          { label: "Hạn mức thấu chi", name: "hmtc_limit", type: "text", col: "6" },
          { label: "Thời hạn cấp hạn mức thấu chi", name: "hmtc_duration", type: "date", col: "6" },
          {
            label: "Phương thức cấp hạn mức thấu chi",
            name: "hmtc_payment_method",
            type: "checkbox-single",
            options: ["Cấp hạn mức thấu chi không có tài sản bảo đảm.", "Cấp hạn mức thấu chi có tài sản bảo đảm."]
          },
          { label: "Dư nợ thấu chi hiện tại", name: "hmtc_current_debt", type: "text", col: "6" },
          { label: "Tên cơ quan/tổ chức", name: "organization_name", type: "text", col: "6" },
          { label: "Địa chỉ", name: "organization_address", type: "text", col: "6" },
          { label: "Điện thoại", name: "organization_phone", type: "tel", col: "6" },
          { label: "Chức danh", name: "organization_position", type: "text", col: "6" },
          { label: "Tổng thu nhập", name: "total_income", type: "tel", col: "6" },
          { 
            label: "Hình thức trả lương", 
            name: "salary_method", 
            type: "checkbox-single",
            options: ["Tiền mặt", "Chuyển khoản", 
              {"label": "Khác", "value": "Khác", "showInput": true}
            ]
          },
          { label: "Thu nhập khác", name: "other_income", type: "tel", col: "12" }
        ]
      },
      {
        title: "III. Người thân của khách hàng (1)",
        collapsible: true,
        fields: [
          { 
            label: "Người thân của khách hàng", 
            name: "has_relative", 
            type: "checkbox-single",
            options: ["Không có", "Có"]
          },
          { label: "Họ và tên", name: "relative_name", type: "text", col: "12" },
          { label: "Quan hệ với người vay", name: "relative_relationship", type: "text", col: "6" },
          { label: "Ngày sinh", name: "relative_date_of_birth", type: "tel", col: "6" },
          { 
            label: "Giới tính", 
            name: "relative_gender",
            type: "checkbox-single",
            options: ["Nam", "Nữ"]
          },
          { label: "CCCD/CMND/hộ chiếu số:", name: "relative_id_number", type: "tel", col: "6" },
          { label: "Ngày cấp", name: "relative_id_issue_date", type: "date", col: "6" },
          { label: "Nơi cấp", name: "relative_id_issue_place", type: "text", col: "6" },
          { label: "Hộ khẩu thường trú", name: "relative_address", type: "text", col: "6" },
          { label: "Địện thoại liên hệ", name: "relative_phone", type: "tel", col: "6" },
          { label: "Email", name: "relative_email", type: "email", col: "6" },
          { label: "Tên cơ quan/tổ chức", name: "relative_workplace", type: "text", col: "12" },
          { label: "Địa chỉ", name: "relative_workplace_address", type: "text", col: "6" },
          { label: "Điện thoại", name: "relative_workplace_phone", type: "tel", col: "6" },
          { label: "Lĩnh vực hoạt động", name: "relative_field_of_activity", type: "text", col: "6" },
          { label: "Chức danh", name: "relative_position", type: "text", col: "6" },
          {
            label: "Loại HĐLĐ",
            name: "relative_labor_contract_type",
            type: "checkbox-single",
            options: ["Không xác định thời hạn", "Có xác định thời hạn"]
          },
          { label: "Thời gian hết hạn HĐLĐ", name: "relative_labor_contract_expiry", type: "date", col: "6" },
          { label: "Tổng thu nhập", name: "relative_total_income", type: "tel", col: "6" },
          { 
            label: "Hình thức trả lương", 
            name: "relative_salary_method", 
            type: "checkbox-single",
            options: ["Tiền mặt", "Chuyển khoản", 
              {"label": "Khác", "value": "Khác", "showInput": true}
            ]
          }
        ]
      },
      {
        title: "IV. Đề nghị điều chỉnh hạn mức thấu chi cho tôi theo nội dung sau:",
        fields: [
          { label: "Hạn mức thấu chi cũ", name: "old_hmtc_limit", type: "text", col: "6" },
          { label: "Hạn mức thấu chi đề nghị điều chỉnh", name: "new_hmtc_limit", type: "text", col: "6" },
          { label: "Lý do đề xuất điều chỉnh hạn mức thấu chi", name: "hmtc_adjustment_reason", type: "text", col: "12" }
        ]
      },
      {
        title: "VI.  XÁC NHẬN CỦA CƠ QUAN (3)",
        fields: [
          { label: "Ông/Bà", name: "official_name", type: "text", col: "6" },
          { label: "Chức vụ", name: "official_position", type: "text", col: "6" },
          { label: "Thời hạn hiệu lực còn lại của hợp đồng lao động", name: "official_labor_contract_duration", type: "date", col: "6" },
          { label: "Tổng thu nhập hàng tháng", name: "official_total_income", type: "tel", col: "6" }
        ]
      },
      {
        title: "PHẦN DÀNH CHO NGÂN HÀNG",
        fields: [
          { 
            label: "Phần dành cho Ngân hàng", 
            name: "bank_section", 
            type: "checkbox-single",
            options: [
              {"label": "Đồng ý điều chỉnh HMTC theo đề xuất:", "value": "Đồng ý điều chỉnh HMTC theo đề xuất:", "showInput": true},
              {"label": "Không đồng ý cấp HMTC theo đề xuất. Lý do", "value": "Không đồng ý cấp HMTC theo đề xuất. Lý do", "showInput": true},
              {"label": "Ý kiến khác:", "value": "Ý kiến khác:", "showInput": true}
            ]
          }
        ]
      }
    ]
  },

  // Mẫu 07: PHỤ LỤC HỢP ĐỒNG CHO VAY HẠN MỨC THẤU CHI (mau_7.html)
  "phu-luc-hop-dong-cho-vay-hmtc": {
    sections: [
      {
        title: "Thông tin chung",
        fields: [
          { name: "branch_name", label: "Chi nhánh Ngân hàng", type: "text", required: true },
          { name: "document_date", label: "Ngày lập", type: "date", required: true, col: "6" },
          { name: "borrower_name", label: "Ông/Bà", type: "text", required: true, col: "6" }
        ]
      },
      {
        title: "Bên cho vay (Bên A)",
        fields: [
          { label: "Địa chỉ", name: "lender_address", type: "text", col: "6" },
          { label: "Mã số hợp tác xã", name: "lender_cooperative_code", type: "text", col: "6" },
          { label: "Điện thoại", name: "lender_phone", type: "tel", col: "6" },
          { label: "Fax", name: "lender_fax", type: "tel", col: "6" },
          { label: "Người đại diện Ông/Bà", name: "lender_representative", type: "text", col: "6" },
          { label: "Chức vụ", name: "lender_representative_position", type: "text", col: "6" },
          { label: "Giấy uy quyền số", name: "lender_authorization_number", type: "text", col: "6" },
          { label: "Giấy ủy quyền số do Ông/Bà", name: "lender_authorization_issuer", type: "text", col: "6" },
          { label: "Chức vụ", name: "lender_authorization_issuer_position", type: "text", col: "6" },
          { label: "Ký ngày", name: "lender_authorization_issuer_date", type: "date", col: "6" }
        ]
      },
      {
        title: "Bên vay (Bên B)",
        fields: [
          { label: "Hiện đang công tác tại", name: "borrower_workplace", type: "text", col: "6" },
          { label: "Điện thoại", name: "borrower_phone", type: "tel", col: "6" },
          { label: "Mã số thuế của khách hàng (nếu có)", name: "borrower_tax_code", type: "text", col: "6" },
          { label: "Tài khoản ngân hàng số", name: "borrower_bank_account_number", type: "tel", col: "6" },
          { label: "Tại ngân hàng", name: "borrower_bank_name", type: "text", col: "6" },
          { label: "Tài khoản Ngân hàng", name: "borrower_bank_account", type: "tel", col: "6" }
        ]
      },
      {
        title: "Điều luật phụ lục hợp đồng",
        fields: [
          { label: "Hạn mức thấu chi (Bằng số)", name: "hmtc_limit_amount", type: "tel", col: "6" },
          { label: "Hạn mức thấu chi (Bằng chữ)", name: "hmtc_limit_amount_text", type: "text", col: "6" }
        ]
      }
    ]
  },

  // Mẫu 08: ĐỀ NGHỊ TẠM DỪNG/MỞ LẠI/CHẤM DỨT HẠN MỨC THẤU CHI (mau_8.html)
  "de-nghi-tam-dung-mo-lai-cham-dut-hmtc": {
    sections: [
      {
        title: "Thông tin chung",
        fields: [
          { name: "branch_name", label: "Chi nhánh Ngân hàng", type: "text", required: true },
          { name: "document_location", label: "Nơi lập", type: "select-with-input", required: true, col: "6" },
          { name: "document_date", label: "Ngày lập", type: "date", required: true, col: "6" },
          {
            label: "Đề nghị NHHTX cho tôi được",
            name: "hmtc_request_type",
            type: "checkbox-single",
            vertical: true,
            options: [
              "Chấm dứt (trước hạn) hạn mức cho vay thấu chi trên tài khoản thanh toán", 
              "Tạm dừng hạn mức cho vay thấu chi trên tài khoản thanh toán", 
              "Mở lại hạn mức cho vay thấu chi trên tài khoản thanh toán"
            ],
          },
          { label: "Hợp đồng cho vay theo hạn mức thấu chi số", name: "hmtc_contract_number", type: "tel", col: "6" },
          { label: "Ký ngày", name: "hmtc_contract_date", type: "date", col: "6" },
          { label: "Hạn mức cho vay thấu chi (Bằng số)", name: "hmtc_limit_amount", type: "tel", col: "6" },
          { label: "Thời hạn hiệu lực của hạn mức cho vay thấu chi", name: "hmtc_effective_duration", type: "date", col: "6" },
          { label: "Hạn mức cho vay thấu chi (Bằng chữ)", name: "hmtc_limit_amount_text", type: "text" },
          { label: "Lý do tạm dừng/chấm dứt (trước hạn) hạn mức thấu chi", name: "hmtc_suspension_reason", type: "textarea", row: 3 }
        ]
      }
    ]
  },


};