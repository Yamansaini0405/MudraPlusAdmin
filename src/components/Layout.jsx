

import Header from "./Header"
import Sidebar from "./Sidebar"
import { useState } from "react"


const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSidebarToggle = () => setSidebarOpen((prev) => !prev);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} /> */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={handleSidebarToggle} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">{children}</main>
      </div>
    </div>
  );
}

export default Layout