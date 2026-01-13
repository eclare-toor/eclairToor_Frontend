import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminTopBar from './AdminTopBar';
import BackgroundAura from '../Shared/BackgroundAura';

const AdminLayout = () => {

  return (
    <div className="min-h-screen bg-transparent flex relative overflow-hidden">
      <BackgroundAura />

      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen relative z-10">
        {/* Topbar */}
        <AdminTopBar />

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
