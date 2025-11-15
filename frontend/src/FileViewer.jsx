import React from "react";
import {Document, Page} from "react-pdf";
import ReactPlayer from "react-player";
import Viewer from "react-viewer";

export default function FileViwer({ url }) {
    if(!url){
        return <p> no file selected. </p>;
    }

    const ext = url.split(".").pop().toLowerCase();

      // 🧩 PDF viewer
  if (ext === "pdf") {
    return (
      <div className="flex justify-center">
        <Document file={fileUrl}>
          <Page pageNumber={1} />
        </Document>
      </div>
    );
  }

  //file types//
  if (["doc", "docx", "ppt", "pptx", "xls", "xlsx"].includes(ext)) {
    return (
      <iframe
        src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
          window.location.origin + fileUrl
        )}`}
        width="100%"
        height="600px"
        frameBorder="0"
        title="Office Viewer"
      />
    );
  }

  if (["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(ext)) {
    return (
      <div className="flex justify-center">
        <img
          src={fileUrl}
          alt="preview"
          className="max-w-full max-h-[80vh] rounded shadow"
        />
      </div>
    );
  }

  if (["mp4", "mov", "webm", "avi", "mp3", "wav"].includes(ext)) {
    return (
      <div className="flex justify-center">
        <ReactPlayer url={fileUrl} controls width="100%" />
      </div>
    );
  }

  return (
    <iframe
      src={`https://docs.google.com/gview?url=${encodeURIComponent(
        window.location.origin + fileUrl
      )}&embedded=true`}
      width="100%"
      height="600px"
      frameBorder="0"
      title="Generic File Viewer"
    />
  );

}