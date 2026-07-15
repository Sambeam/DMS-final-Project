import { BookOpen, Menu, X } from "lucide-react";

export default function Sidebar({ menuItems, currentPage, setCurrentPage, sidebarOpen, setSidebarOpen, displayUser, avatarInitial }) {
  return (
    <>
      {/* Top bar (mobile) */}
      <div className="md:hidden sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <button aria-label="Open menu" onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-gray-100">
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold">StudyHub</span>
        </div>
        <div className="w-8" />
      </div>

      {/* Sidebar (drawer on mobile, sticky on desktop) */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-white border-r border-gray-200 transition-transform md:static md:translate-x-0 md:h-screen ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">StudyHub</h1>
              <p className="text-xs text-gray-500">Your Academic Companion</p>
            </div>
          </div>
          <button aria-label="Close menu" className="md:hidden p-2 rounded-lg hover:bg-gray-100" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentPage(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                  active ? "bg-blue-50 text-blue-700" : "hover:bg-gray-50 text-gray-700"
                }`}
              >
                <Icon className={`w-5 h-5 mr-3 ${active ? "text-blue-600" : "text-gray-500"}`} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200 hidden md:block">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-purple-200 flex items-center justify-center text-purple-700 font-bold">
              {avatarInitial}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{displayUser.name}</p>
              <p className="text-xs text-gray-500 truncate">{displayUser.email}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
