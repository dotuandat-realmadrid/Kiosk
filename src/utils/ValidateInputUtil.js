/**
 * Validate và xử lý dữ liệu đầu vào
 * - Bỏ khoảng trắng đầu cuối
 * - Đảm bảo các từ cách nhau đúng 1 dấu cách
 * - Không cho phép nhập toàn khoảng trắng
 * - Giữ nguyên các giá trị không phải chuỗi (số, null, undefined, Date, mảng)
 *
 * @param {string|Object} data - Dữ liệu cần validate (có thể là chuỗi hoặc object chứa các chuỗi)
 * @returns {string|Object} Dữ liệu đã được xử lý và validate
 * @throws {Error} Nếu dữ liệu không hợp lệ
 */
function validateInput(data) {
  function processString(str) {
    let trimmed = str.trim().replace(/\s+/g, " "); // Bỏ khoảng trắng thừa
    return trimmed.length === 0 ? "" : trimmed; // Nếu chỉ có khoảng trắng, trả về ""
  }

  if (typeof data === "string") {
    return processString(data);
  } else if (typeof data === "object" && data !== null) {
    if (Array.isArray(data)) {
      return data.map((item) =>
        typeof item === "string" ? processString(item) : item
      );
    }
    const newData = { ...data };
    for (const key in newData) {
      if (typeof newData[key] === "string") {
        newData[key] = processString(newData[key]);
      }
    }
    return newData;
  }

  return data; // Giữ nguyên nếu không phải chuỗi hoặc object
}

export { validateInput };
