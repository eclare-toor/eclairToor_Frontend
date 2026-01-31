import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Map,
    Hotel,
    FileText,
    MessageSquare,
    Users,
    LogOut
} from '../../components/icons';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';
import { useAuth } from '../../Context/AuthContext';

import logo from '../../assets/logo.webp';

const AdminSidebar = () => {
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
    };

    const navItems = [
        { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
        { path: '/admin/voyages', label: 'Voyages', icon: Map },
        { path: '/admin/hotels', label: 'Hôtels (Omra)', icon: Hotel },
        { path: '/admin/demandes', label: 'Demandes', icon: FileText },
        { path: '/admin/messages', label: 'Messages', icon: MessageSquare },
        { path: '/admin/users', label: 'Utilisateurs', icon: Users },
    ];

    return (
        <aside className="w-64 bg-slate-900/95 backdrop-blur-xl text-white fixed h-full z-20 hidden md:flex flex-col border-r border-white/5">
            <div className="p-8 flex flex-col items-center border-b border-white/5 bg-black/20">
                <img
                    src={logo}
                    alt="Logo"
                    width={80}
                    height={80}
                    loading="lazy"
                    decoding="async"
                    className="w-20 h-20 object-contain mb-4 drop-shadow-2xl"
                />
                <div className="text-center">
                    <h2 className="text-xl font-black tracking-tighter text-white uppercase italic">
                        Eclair Travel
                    </h2>
                    <p className="text-[10px] text-primary font-black uppercase  mt-1 ml-1 opacity-80">
                        Administration
                    </p>
                </div>
            </div>

            <nav className="flex-1 py-6 px-3 space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.exact}
                        className={({ isActive }) => cn(
                            "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                            isActive
                                ? "bg-primary text-white shadow-lg shadow-primary/25"
                                : "text-slate-400 hover:text-white hover:bg-white/5"
                        )}
                    >
                        <item.icon className="w-5 h-5" />
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-white/10 space-y-2">
                <Button
                    variant="ghost"
                    className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-400/10"
                    onClick={handleLogout}
                >
                    <LogOut className="w-4 h-4 mr-2" /> Déconnexion
                </Button>
            </div>
        </aside>
    );
};

export default AdminSidebar;
