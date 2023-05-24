import Quill from "quill";

// export const initializeEditor = function () {
//   var options = {
//     debug: "info",
//     modules: {
//       toolbar: "#toolbar",
//     },
//     placeholder: "Compose an epic...",
//     readOnly: true,
//     theme: "snow",
//   };
//   var quill = new Quill("#editor", {
//     theme: "snow",
//   });
// };

export const getQuillInstance = function (elementId) {
  const toolbarOptions = [
    ["bold", "italic", "underline", "strike"], // Formatting tools
    [{ header: [1, 2, 3, 4, 5, 6, false] }], // Heading styles
    [{ align: [] }], // Text alignment
    ["list", "ordered"], // Lists
    ["blockquote"], // Block quote
    ["link"], // Insert/Edit link
    ["image"], // Insert image
    ["code", "code-block"], // Code
    [{ script: "sub" }, { script: "super" }],
    ["clean"], // Clear formatting
  ];
  return new Quill(`#${elementId}`, {
    placeholder: "Write your next masterpiece...",
    theme: "snow",
    modules: {
      toolbar: {
        container: "#toolbar",
        options: toolbarOptions,
      },
    },
  });
};

export const getHTMLContent = function (quill) {
  const content = quill.getContents();
  return quill.root.innerHTML;
};

export const renderHTMLContent = function (elementId, htmlContent) {
  document.getElementById(elementId).innerHTML = htmlContent;
};
