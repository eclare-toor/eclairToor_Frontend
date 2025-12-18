import React, { useEffect, useState } from 'react';
import type { User } from '../../Types';
import { getUsers, deleteUser } from '../../api';
import { Button } from '../../components/ui/button';
import { Trash2, Shield, User as UserIcon } from 'lucide-react';
import LoadingSpinner from '../../components/Shared/LoadingSpinner';

const AdminUsersPage = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        setLoading(true);
        const data = await getUsers();
        setUsers(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDelete = async (id: string) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
            await deleteUser(id);
            fetchUsers();
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Gestion des Utilisateurs ({users.length})</h2>

            {loading ? (
                <LoadingSpinner />
            ) : (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="p-4 font-semibold text-slate-600">Utilisateur</th>
                                <th className="p-4 font-semibold text-slate-600">Email</th>
                                <th className="p-4 font-semibold text-slate-600">Nationalité</th>
                                <th className="p-4 font-semibold text-slate-600">Rôle</th>
                                <th className="p-4 font-semibold text-slate-600 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-4 font-medium text-slate-900 flex items-center gap-3">
                                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                                            {user.role === 'ADMIN' ? <Shield className="w-5 h-5 text-primary" /> : <UserIcon className="w-5 h-5" />}
                                        </div>
                                        {user.full_name || `${user.nom} ${user.prenom}`}
                                    </td>
                                    <td className="p-4 text-slate-600">{user.email}</td>
                                    <td className="p-4 text-slate-600">{user.nationality || '-'}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${user.role === 'ADMIN' ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-500'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        {user.role !== 'ADMIN' && (
                                            <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-500 hover:bg-red-50" onClick={() => handleDelete(user.id)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminUsersPage;
