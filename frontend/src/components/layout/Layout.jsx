import Sidebar from "./Sidebar";

function Layout({ children }) {
  return (
    <div className="flex h-screen">
      <Sidebar />

      <div className="flex-1 flex flex-col">

        <div className="flex-1 p-6 bg-gray-100 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Layout;