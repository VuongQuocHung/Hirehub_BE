import { describe, expect, it } from "vitest";
import { sanitizeRichText } from "../../helpers/sanitize-html.helper";

describe("sanitizeRichText", () => {
  it("giữ lại các thẻ HTML an toàn", () => {
    const result = sanitizeRichText(
      "<p>Nội dung <strong>quan trọng</strong></p>"
    );

    expect(result).toBe(
      "<p>Nội dung <strong>quan trọng</strong></p>"
    );
  });

  it("loại bỏ script và thuộc tính sự kiện nguy hiểm", () => {
    const result = sanitizeRichText(`
      <script>alert(1)</script>
      <img src="https://example.com/image.jpg" onerror="alert(2)">
    `);

    expect(result).not.toContain("<script");
    expect(result).not.toContain("onerror");
    expect(result).toContain("https://example.com/image.jpg");
  });

  it("loại bỏ URL javascript", () => {
    const result = sanitizeRichText(
      '<a href="javascript:alert(1)">Link nguy hiểm</a>'
    );

    expect(result).not.toContain("javascript:");
  });

  it("giữ URL an toàn và thêm rel bảo mật", () => {
    const result = sanitizeRichText(
      '<a href="https://example.com" target="_blank">Link an toàn</a>'
    );

    expect(result).toContain('href="https://example.com"');
    expect(result).toContain('rel="noopener noreferrer"');
  });

  it("trả về chuỗi rỗng khi dữ liệu không tồn tại", () => {
    expect(sanitizeRichText(null)).toBe("");
    expect(sanitizeRichText(undefined)).toBe("");
  });
});