import { useState, useEffect } from "react";
import { Plus, FileText, Search, BookOpen } from "lucide-react";

export default function NotesPage({ notebooks, setNotebooks }) {
  const [selectedNotebook, setSelectedNotebook] = useState(notebooks[0]);
  const [selectedPage, setSelectedPage] = useState(notebooks[0]?.pages[0] ?? null);
  const [text, setText] = useState(selectedPage?.content ?? "");

  useEffect(() => {
    setText(selectedPage?.content ?? "");
  }, [selectedPage]);

  const saveNote = () => {
    if (!selectedNotebook || !selectedPage) return;
    setNotebooks((all) =>
      all.map((nb) =>
        nb.id !== selectedNotebook.id
          ? nb
          : {
              ...nb,
              pages: nb.pages.map((p) => (p.id === selectedPage.id ? { ...p, content: text } : p)),
            }
      )
    );
  };

  return (
    <div className="flex h-[calc(100vh-80px)]">
      {/* Notebooks Sidebar */}
      <div className="w-72 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={() =>
              setNotebooks((n) => [
                ...n,
                {
                  id: Date.now().toString(),
                  name: `Notebook ${n.length + 1}`,
                  color: "blue",
                  courseId: null,
                  pages: [
                    {
                      id: Date.now().toString() + "-p",
                      title: "Page 1",
                      content: "",
                      createdDate: new Date().toISOString(),
                    },
                  ],
                },
              ])
            }
            className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold flex items-center justify-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Notebook
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {notebooks.map((nb) => (
            <button
              key={nb.id}
              onClick={() => {
                setSelectedNotebook(nb);
                setSelectedPage(nb.pages[0]);
              }}
              className={`w-full flex items-center justify-between p-3 rounded-lg mb-2 transition-colors ${
                selectedNotebook?.id === nb.id ? "bg-blue-50 border border-blue-200" : "hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center space-x-3">
                <BookOpen className="w-5 h-5 text-blue-500" />
                <span className="font-medium text-gray-900">{nb.name}</span>
              </div>
              <span className="text-gray-400">→</span>
            </button>
          ))}
        </div>
      </div>

      {/* Pages Sidebar */}
      <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-blue-500" />
            {selectedNotebook?.name}
          </h3>
          <button
            onClick={() => {
              if (!selectedNotebook) return;
              const newP = {
                id: Date.now().toString(),
                title: `Page ${selectedNotebook.pages.length + 1}`,
                content: "",
                createdDate: new Date().toISOString(),
              };
              setNotebooks((all) => all.map((nb) => (nb.id === selectedNotebook.id ? { ...nb, pages: [newP, ...nb.pages] } : nb)));
              setSelectedPage(newP);
            }}
            className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Page
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search pages..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>

          {selectedNotebook?.pages.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPage(p)}
              className={`w-full text-left p-3 rounded-lg mb-2 transition-colors ${
                selectedPage?.id === p.id ? "bg-white shadow-sm border border-gray-200" : "hover:bg-white"
              }`}
            >
              <div className="flex items-center space-x-2 mb-1">
                <FileText className="w-4 h-4 text-gray-400" />
                <span className="font-medium text-gray-900 text-sm">{p.title}</span>
              </div>
              <p className="text-xs text-gray-500">{new Date(p.createdDate).toLocaleString()}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 bg-white flex flex-col">
        <div className="border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">{selectedPage?.title}</h2>
          <div className="flex gap-3">
            <button
              onClick={saveNote}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium flex items-center"
            >
              <FileText className="w-4 h-4 mr-2" />
              Save
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          <textarea
            className="w-full border border-gray-300 rounded-lg p-4 min-h-[200px] focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Start typing your notes..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
