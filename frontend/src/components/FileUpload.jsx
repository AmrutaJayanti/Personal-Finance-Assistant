import React from 'react';


// This component allows users to upload files for expense tracking
// It provides two buttons: one for uploading receipt images and another for PDF files
// The uploaded files are handled by a callback function passed as a prop
function FileUploader({ handleFileUpload }) {
  return (
    <div className="mt-8 flex flex-col md:flex-row gap-4">
      {/* Receipt Upload (Images) */}
      <label className="inline-block cursor-pointer bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-xl shadow-md">
        📷 Upload Receipt
        <input
          type="file"
          accept="image/png, image/jpeg, image/jpg"
          className="hidden"
          onChange={(e) => handleFileUpload(e, false)}
        />
      </label>

      {/* PDF Upload */}
      <label className="inline-block cursor-pointer bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-xl shadow-md">
        📄 Upload PDF
        <input
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => handleFileUpload(e, true)}
        />
      </label>
    </div>
  );
}

export default FileUploader;
