import { Bell } from 'lucide-react';

const AdminTopBar = () => {
    return (
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm">
            <h1 className="font-bold text-slate-800">Panneau d'administration</h1>

            <div className="flex items-center gap-4">
                <button className="relative p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
                </button>
                <div className="flex items-center gap-3 border-l pl-4 ml-2 border-slate-100">
                    <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden">
                        <img
                            src="https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff"
                            alt="Admin"
                        />
                    </div>
                    <div className="hidden sm:block text-right">
                        <p className="text-sm font-bold text-slate-900 leading-none">Admin User</p>
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mt-0.5">Super Admin</p>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default AdminTopBar;
