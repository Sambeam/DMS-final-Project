import React, {useEffect,useState} from "react";
import Dumpster from "../../assets/trash_icon.png";
import AddButton from "../../assets/AddButton.png";
import FileViewer from "../../FileViewer.jsx";

export default function ResourceView(){
  const [testResources, setResources] = useState([]);
  //file upload form state//
  const[showForm, setShowForm]= useState(false);
  const[fileViewer, setFileToOpen] = useState("");

  useEffect(() => {
      const localDB = localStorage.getItem("resources");
      if(localDB){
        setResources(JSON.parse(localDB));
      }
  }, []);

  const fileDeleteHandler = (file) => {  
    const user_confirmation = window.confirm(`You are about to delete ${file.resource_name}.${file.type}`);
    if(user_confirmation){
        var resources = JSON.parse(localStorage.getItem("resources"));
        resources = resources.filter((resource) => resource.resource_id !== file.resource_id);
        localStorage.setItem("resources",JSON.stringify(resources));
        setResources(resources);
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
        {showForm && <UploadForm setShowForm={setShowForm} setResources={setResources}/>}
        {testResources.map((tr) => (
          <div key={tr.resource_id} className="flex justify-between items-center py-3" onClick={(() => setFileToOpen(tr.file_url))}>
            <span className="text-gray-800 font-medium">{tr.resource_name}</span>
            <span className="text-gray-700 font-semibold">uploaded on: {tr.last_updated_time}</span>
            <button className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded" 
                    onClick={() => fileDeleteHandler(tr)}>
              <img src={Dumpster} alt="Delete" className="w-5 h-5" />
            </button>
          </div>
        ))}
        {fileViewer && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <h3 className="text-xl font-semibold mb-2">Preview:</h3>
                <FileViewer fileUrl={fileViewer} />
            </div>
        )}
      </div>
    </div>
  );
}

function UploadForm ({setShowForm, setResources}){
  const [uploadFileName, setUploadFileName] = useState("");
  const [fileToUpload, setFileToUpload] = useState(null);
  const [uploadFileType, setFileType] = useState("");

  const cancelForm = () =>{
    setShowForm(false);
  };

  const handleFormSubmit = (e) =>{
    e.preventDefault();
    if(!fileToUpload){
      alert("No file selected");
      return;
    }

    const randomId = Math.floor(Math.random()*100000);

    const resource = {
      resource_id: randomId,
      resource_name: (uploadFileName == "" ? fileToUpload.name.split(".")[0] : uploadFileName),
      file_url: `/uploads/${fileToUpload.name}`,
      type: fileToUpload.type.split("/")[1],
      last_updated_time: new Date().toISOString().split("T")[0],
    };

    const existing_resource = JSON.parse(localStorage.getItem("resources")) || [];
    const updated_resource = [...existing_resource,resource];
    localStorage.setItem("resources",JSON.stringify(updated_resource));
    setResources(updated_resource);


    cancelForm();
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
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
            Upload
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}