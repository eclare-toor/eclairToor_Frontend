import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Map,
    Hotel,
    FileText,
    MessageSquare,
    Users,
    LogOut
} from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';
import { useAuth } from '../../Context/AuthContext';

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
        <aside className="w-64 bg-slate-900 text-white fixed h-full z-10 hidden md:flex flex-col">
            <div className="p-6 border-b border-white/10">
                <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                    <span className="text-primary font-black text-3xl">E</span>clair
                </h2>
                <p className="text-xs text-slate-400 mt-1">Administration</p>
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
