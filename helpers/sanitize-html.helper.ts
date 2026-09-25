import sanitizeHtml from "sanitize-html";

// Chỉ giữ các thẻ HTML cần thiết cho nội dung được nhập từ TinyMCE.
// Script, iframe, thuộc tính onClick và URL javascript:... sẽ bị loại bỏ.
export const sanitizeRichText = (value: unknown): string => {
  return sanitizeHtml(String(value ?? ""), {
    allowedTags: [
      "a", "blockquote", "br", "caption", "code", "div", "em",
      "figcaption", "figure", "h1", "h2", "h3", "h4", "h5", "h6",
      "hr", "img", "li", "ol", "p", "pre", "span", "strong",
      "table", "tbody", "td", "tfoot", "th", "thead", "tr", "ul"
    ],
    allowedAttributes: {
      a: ["href", "target", "rel", "title"],
      img: ["src", "alt", "title", "width", "height", "loading"],
      td: ["colspan", "rowspan"],
      th: ["colspan", "rowspan", "scope"]
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowProtocolRelative: false,
    transformTags: {
      // Bảo vệ trang hiện tại khi người dùng mở link trong tab mới.
      a: sanitizeHtml.simpleTransform(
        "a",
        {
          rel: "noopener noreferrer"
        },
        true
      )
    }
  });
};
