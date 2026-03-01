// src/assets/js/industry_list.js
export const INDUSTRY_LIST = [
  {
    code: "J",
    name: "HOẠT ĐỘNG XUẤT BẢN, PHÁT SÓNG, SẢN XUẤT VÀ PHÂN PHỐI NỘI DUNG",
    children: []
  },
  {
    code: "K",
    name: "HOẠT ĐỘNG VIỄN THÔNG; LẬP TRÌNH MÁY TÍNH, TU VẤN, CƠ SỞ HẠ TẦNG MÁY TÍNH VÀ CÁC DỊCH VỤ THÔNG TIN KHÁC",
    children: []
  },
  {
    code: "L",
    name: "HOẠT ĐỘNG TÀI CHÍNH, NGÂN HÀNG VÀ BẢO HIỂM",
    children: []
  },
  {
    code: "M",
    name: "HOẠT ĐỘNG KINH DOANH BẤT ĐỘNG SẢN",
    children: [
      {
        code: "68",
        name: "Hoạt động kinh doanh bất động sản",
        children: [
          {
            code: "681",
            name: "Kinh doanh bất động sản, quyền sử dụng đất thuộc chủ sở hữu, chủ sử dụng hoặc đi thuê",
            children: [
              {
                code: "6810",
                name: "Kinh doanh bất động sản, quyền sử dụng đất thuộc chủ sở hữu, chủ sử dụng hoặc đi thuê",
                children: [
                  {
                    code: "68101",
                    name: "Mua, bán nhà ở và quyền sử dụng đất ở",
                    children: [
                      {
                        content: "Chi tiết",
                        detail: "Nhóm này gồm: Hoạt động kinh doanh mua/bán nhà để ở và quyền sử dụng đất để ở."
                        + "\nLoại trừ: Chia tách và cải tạo đất được phân vào nhóm 42990 (Xây dựng công trình kỹ thuật dân dụng khác)."
                      }
                    ]
                  },
                  {
                    code: "68102",
                    name: "Mua, bán nhà và quyền sử dụng đất không để ở",
                    children: [
                      {
                        content: "Chi tiết:",
                        detail: "Nhóm này gồm: Hoạt động kinh doanh/mua bán và quyền sử dụng đất không để ở như văn phòng, cửa hàng, trung tâm thương mại, nhà xưởng sản xuất, khu triển lãm, nhà kho,...."
                      }
                    ],
                  },
                  {
                    code: "68103",
                    name: "Cho thuê và vận hành nhà ở và đất ở",
                    children: [
                      {
                        content: "Chi tiết:",
                        detail: "Nhóm này gồm:"
                        + "\n- Cho thuê nhà, căn hộ có đồ đạc, không có đồ đạc hoặc các phòng sử dụng để ở lâu dài, theo tháng hoặc theo năm;"
                        + "\n- Cho thuê mái nhà, ví dụ: để lắp đặt hệ thống năng lượng mặt trời."
                        + "\nLoại trừ: Hoạt động của khách sạn và những căn hộ tương tự, nhà nghỉ, lều trại, cắm trại du lịch và những nơi không phải để ở khác hoặc phòng cho thuê ngắn ngày được phân vào nhóm ngành 55 (Dịch vụ lưu trú)."
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            code: "682",
            name: "Hoạt động bất động sản trên cơ sở phí hoặc hợp đồng",
            children: [
              {
                code: "6821",
                name: "Dịch vụ trung gian cho hoạt động bất động sản",
                children: [
                  {
                    code: "68210",
                    name: "Dịch vụ trung gian cho hoạt động bất động sản",
                    children: [
                      {
                        content: "Chi tiết",
                        detail: "Nhóm này gồm: Hoạt động trung gian trong mua bán và cho thuê bất động sản thông qua kết nối người mua với người bán hoặc nhà cung cấp dịch vụ để nhận phí hoặc hoa hồng. Các hoạt động trung gian này có thể được thực hiện trên nền tảng số hoặc qua các kênh phi kỹ thuật số (gặp mặt trực tiếp, tiếp thị tận nhà, qua điện thoại, thư tín,...); bao gồm cả hoạt động cung cấp dịch vụ bất động sản thông qua các đại lý bất động sản hoặc môi giới bất động sản độc lập như làm trung gian mua bán và cho thuê bất động sản trên cơ sở phí hoặc hợp đồng."
                        + "\nPhí hoặc hoa hồng nhận được có thể từ người mua, người bán bất động sản hoặc nhà cung cấp dịch vụ bất động sản. Doanh thu từ hoạt động trung gian cũng có thể bao gồm các nguồn thu khác như doanh thu từ việc bán không gian quảng cáo cho bên thứ ba."
                        + "\nNhóm này cũng gồm: Dịch vụ niêm yết bất động sản."
                        + "\nLoại trừ:"
                        + "\n- Hoạt động pháp lý được phân vào nhóm 6910 (Hoạt động pháp luật);"
                        + "\n- Hoạt động của đại lý ký quỹ bất động sản được phân vào nhóm 6829 (Hoạt động bất động sản khác trên cơ sở phí hoặc hợp đồng)."
                      }
                    ]
                  }
                ]
              },
              {
                code: "6829",
                name: "Hoạt động bất động sản khác trên cơ sở phí hoặc hợp đồng",
                children: [
                  {
                    code: "68291",
                    name: "Hoạt động tư vấn và quản lý nhà ở và quyền sử dụng đất ở",
                    children: [
                      {
                        content: "Chi tiết",
                        detail: "Nhóm này bao gồm:"
                        + "\n- Hoạt động quản lý bất động sản là nhà chung cư, nhà ở riêng lẻ, nhà ở thuộc sở hữu chung, đất ở trên cơ sở phí hoặc hợp đồng;"
                        + "\n- Hoạt động tư vấn liên quan đến việc mua bán và cho thuê bất động sản là nhà chung cư, nhà ở riêng lẻ, nhà ở thuộc sở hữu chung, đất ở trên cơ sở phí hoặc hợp đồng."
                        + "\nLoại trừ: Hoạt động tư vấn pháp lý được phân vào nhóm 6910 (Hoạt động pháp luật)."
                      }
                    ]
                  },
                  {
                    code: "68292",
                    name: "Hoạt động tư vấn và quản lý nhà và quyền sử dụng đất không để ở",
                    children: [
                      {
                        content: "Chi tiết",
                        detail: "Nhóm này bao gồm:"
                        + "\n- Hoạt động quản lý bất động sản không để ở như nhà xưởng, văn phòng, nhà máy, đất,...trên cơ sở phí hoặc hợp đồng;"
                        + "\n- Hoạt động tư vấn liên quan đến việc mua bán và cho thuê bất động sản không để ở trên cơ sở phí hoặc hợp đồng."
                        + "\nLoại trừ: Hoạt động tư vấn pháp lý được phân vào nhóm 6910 (Hoạt động pháp luật)."
                      }
                    ]
                  },
                  {
                    code: "68293",
                    name: "Hoạt động đấu giá bất động sản, đấu giá quyền sử dụng bất động sản",
                    children: [
                      {
                        content: "Chi tiết",
                        detail: "- Nhóm này gồm: Các hoạt động thẩm định, định giá bất động sản, kiểm tra pháp lý, lập hồ sơ đấu giá bất động sản; tổ chức và công bố đấu giá; tiến hành phiên đấu giá (trực tiếp hoặc trực tuyến); hỗ trợ chuyển quyền sở hữu, kê khai thuế, làm thủ tục sang tên sau đấu giá; ..."
                        + "\nHoạt động đấu giá bất động sản, đấu giá quyền sử dụng bất động sản có thể được thực hiện bởi các đơn vị: trung tâm dịch vụ đấu giá tài sản (thuộc Sở Tư pháp); doanh nghiệp đấu giá tài sản; ngân hàng (đấu giá tài sản bảo đảm); cơ quan thi hành án (tài sản bị kê biên, phát mãi); sàn giao dịch bất động sản có chức năng tổ chức đấu giá (nếu được cấp phép)."
                      }
                    ]
                  },
                  {
                    code: "68299",
                    name: "Hoạt động bất động sản khác chưa được phân vào đâu trên cơ sở phí hoặc hợp đồng",
                    children: [
                      {
                        content: "Chi tiết",
                        detail: "Nhóm này gồm:"
                        + "\n- Hoạt động của các công ty thu tiền thuê bất động sản;"
                        + "\n- Hoạt động của các đại lý ký quỹ bất động sản;"
                        + "\n- Các hoạt động bất động sản khác chưa được phân vào đâu trên cơ sở phí hoặc hợp đồng."
                        + "\nLoại trừ: Dịch vụ hỗ trợ cơ sở vật chất (kết hợp các dịch vụ như vệ sinh nội thất, bảo trì và sửa chữa nhỏ, thu gom rác thải, bảo vệ và an ninh được phân vào nhóm 81100 (Dịch vụ hỗ trợ tổng hợp)."
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    code: "N",
    name: "HOẠT ĐỘNG CHUYÊN MÔN, KHOA HỌC VÀ CÔNG NGHỆ",
    children: []
  },
  {
    code: "O",
    name: "HOẠT ĐỘNG HÀNH CHÍNH VÀ DỊCH VỤ HỖ TRỢ",
    children: []
  },
  {
    code: "P",
    name: "HOẠT ĐỘNG CỦA ĐẢNG CỘNG SẢN, TỔ CHỨC CHÍNH TRỊ - XÃ HỘI, QUẢN LÝ NHÀ NƯỚC, AN NINH QUỐC PHÒNG; BẢO ĐẢM XÃ HỘI BẮT BUỘC",
    children: []
  },
  {
    code: "Q",
    name: "GIÁO DỤC VÀ ĐÀO TẠO",
    children: []
  },
  {
    code: "R",
    name: "Y TẾ VÀ HOẠT ĐỘNG TRỢ GIÚP XÃ HỘI",
    children: []
  },
  {
    code: "S",
    name: "NGHỆ THUẬT, THỂ THAO VÀ GIẢI TRÍ",
    children: []
  }
];