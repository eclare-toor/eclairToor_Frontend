
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import BackgroundAura from '../Shared/BackgroundAura';

const UserLayout = () => {
  return (
    <div className="flex flex-col min-h-screen relative">
      <BackgroundAura />
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default UserLayout;