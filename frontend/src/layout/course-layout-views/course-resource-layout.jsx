import React, {useEffect,useState} from "react";
import Dumpster from "../../assets/trash_icon.png";
import AddButton from "../../assets/AddButton.png";
import FileViewer from "../../FileViewer.jsx";
import api from "../../api/client.js";

export default function ResourceView({ course }){
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  //file upload form state//
  const [showForm, setShowForm]= useState(false);
  const [fileViewer, setFileToOpen] = useState("");

  const loadResources = async () => {
    try {
      const response = await api.get(`/resource/course/${course._id}`);
      setResources(response.data);
    } catch (error) {
      console.error("Fetch resources error:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
      loadResources();
  }, [course._id]);

  const fileDeleteHandler = async (file) => {
    const user_confirmation = window.confirm(`You are about to delete ${file.resource_name}.`);
    if(user_confirmation){
        try {
          await api.delete(`/resource/${file._id}`);
          setResources((prev) => prev.filter((resource) => resource._id !== file._id));
        } catch (error) {
          console.error("Delete resource error:", error.response?.data || error.message);
          alert("Failed to delete resource.");
        }
    }
  };

  return (
    <div className="p-1">
      <div className="divide-y divide-gray-300">
        <button  className="flex items-center gap-2 px-4 pb-2 mb-4 rounded
             bg-transparent text-blue-600
             hover:bg-gray-200
             focus:outline-none focus:ring-0
             active:outline-none active:ring-0
             border-none transition"
  style={{ outline: "none", boxShadow: "none" }}
          onClick={() => setShowForm(true)}>
          <img src={AddButton} alt="Add File" className="w-5 h-5" />
          Upload a file
        </button>
        {showForm && (
          <UploadForm
            course={course}
            setShowForm={setShowForm}
            onUploaded={(resource) => setResources((prev) => [resource, ...prev])}
          />
        )}
        {loading ? (
          <p className="text-gray-500 py-3">Loading...</p>
        ) : resources.length === 0 ? (
          <p className="text-gray-500 py-3">No resources uploaded yet.</p>
        ) : (
          resources.map((tr) => (
            <div key={tr._id} className="flex justify-between items-center py-3">
              <button className="text-left text-gray-800 font-medium hover:underline" onClick={() => setFileToOpen(tr.file_url)}>
                {tr.resource_name}
              </button>
              <span className="text-gray-700 font-semibold">
                uploaded on: {new Date(tr.upload_time).toLocaleDateString()}
              </span>
              <button className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded"
                      onClick={() => fileDeleteHandler(tr)}>
                <img src={Dumpster} alt="Delete" className="w-5 h-5" />
              </button>
            </div>
          ))
        )}
        {fileViewer && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setFileToOpen("")}>
                <div className="bg-white rounded-xl shadow-lg p-6 w-[90%] max-w-3xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                    <h3 className="text-xl font-semibold mb-2">Preview:</h3>
                    <FileViewer url={fileViewer} />
                </div>
            </div>
        )}
      </div>
    </div>
  );
}

function UploadForm ({course, setShowForm, onUploaded}){
  const [uploadFileName, setUploadFileName] = useState("");
  const [fileToUpload, setFileToUpload] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const cancelForm = () =>{
    setShowForm(false);
  };

  const handleFormSubmit = async (e) =>{
    e.preventDefault();
    if(!fileToUpload){
      alert("No file selected");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("file", fileToUpload);
      const uploadResponse = await api.post("/upload", formData);

      const resourceResponse = await api.post("/resource", {
        course_id: course._id,
        resource_name: uploadFileName || fileToUpload.name.split(".")[0],
        file_url: uploadResponse.data.url,
        type: fileToUpload.type,
      });

      onUploaded(resourceResponse.data);
      cancelForm();
    } catch (error) {
      console.error("Upload resource error:", error.response?.data || error.message);
      alert("Failed to upload file.");
    } finally {
      setSubmitting(false);
    }
  };

  return(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-[90%] max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Upload a new file
        </h2>
        <form onSubmit={handleFormSubmit} className="space-y-4">

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              File Name
            </label>
            <input type="text"
                    value={uploadFileName}
                    onChange={(e) => setUploadFileName(e.target.value)}
                    className="w-full text-black bg-white border border-gray-300 rounded p-2 focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Select File
            </label>
            <input
              type="file"
              onChange={(e) => setFileToUpload(e.target.files[0])}
              className="w-full text-black bg-white border border-gray-300 rounded p-2 appearance-none file:bg-blue-600 file:text-white file:border-0 file:rounded file:px-3 file:py-1 hover:file:bg-blue-700"
            />
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={() => cancelForm()}
              className="px-4 py-2 rounded bg-gray-300 text-gray-800 hover:bg-gray-400"
            >
            Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-70"
            >
            {submitting ? "Uploading..." : "Upload"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
