import React, { useEffect, useState } from 'react';
import type { User } from '../../Types';
import { getUsers, deleteUser } from '../../api';
import { Button } from '../../components/ui/button';
import { Trash2, Shield, User as UserIcon, Plus, Facebook, Phone, Globe, Mail, Lock, Copy } from 'lucide-react';
import LoadingSpinner from '../../components/Shared/LoadingSpinner';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "../../components/ui/dialog";
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { toast } from 'react-toastify';
import { register } from '../../api';
import { cn } from '../../lib/utils';

const AdminUsersPage = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        email: '',
        password: '',
        linkFacebook: '',
        nationalite: 'Algérie',
        phone: '',
        role: 'user'
    });

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await getUsers();
            setUsers(data);
        } catch (error: any) {
            toast.error(error.message || "Erreur lors du chargement des utilisateurs");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDelete = async (id: string) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
            try {
                await deleteUser(id);
                toast.success("Utilisateur supprimé");
                fetchUsers();
            } catch (error: any) {
                toast.error(error.message || "Erreur lors de la suppression");
            }
        }
    };

    const handleCopyId = (id: string) => {
        navigator.clipboard.writeText(id);
        toast.info("ID copié : " + id);
    };

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await register(formData);
            toast.success("Utilisateur créé avec succès");
            setIsAddModalOpen(false);
            setFormData({
                nom: '',
                prenom: '',
                email: '',
                password: '',
                linkFacebook: '',
                nationalite: 'Algérie',
                phone: '',
                role: 'user'
            });
            fetchUsers();
        } catch (error: any) {
            toast.error(error.message || "Erreur lors de la création de l'utilisateur");
        }
    };

    return (
        <div className="space-y-8 p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight">Gestion <span className="text-primary italic">Utilisateurs</span></h2>
                    <p className="text-slate-500 font-bold mt-1 uppercase tracking-widest text-[10px]">Total: {users.length} Comptes</p>
                </div>

                <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                    <DialogTrigger asChild>
                        <Button className="h-12 px-6 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest shadow-lg shadow-primary/20 flex items-center gap-3 transition-all hover:scale-[1.02]">
                            <Plus className="w-5 h-5 border-2 border-white/30 rounded-full" />
                            Ajouter un utilisateur
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px] rounded-[2.5rem] p-8">
                        <DialogHeader>
                            <DialogTitle className="text-3xl font-black text-slate-900 mb-6">Nouvel <span className="text-primary italic">Utilisateur</span></DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleAddUser} className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Nom</Label>
                                <Input
                                    required
                                    value={formData.nom}
                                    onChange={e => setFormData({ ...formData, nom: e.target.value })}
                                    className="h-12 rounded-xl bg-slate-50 border-slate-100 font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Prénom</Label>
                                <Input
                                    required
                                    value={formData.prenom}
                                    onChange={e => setFormData({ ...formData, prenom: e.target.value })}
                                    className="h-12 rounded-xl bg-slate-50 border-slate-100 font-bold"
                                />
                            </div>
                            <div className="space-y-2 col-span-2">
                                <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Email professionnel</Label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        className="h-12 pl-12 rounded-xl bg-slate-50 border-slate-100 font-bold"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Mot de passe</Label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        type="password"
                                        required
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        className="h-12 pl-12 rounded-xl bg-slate-50 border-slate-100 font-bold"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Téléphone</Label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        className="h-12 pl-12 rounded-xl bg-slate-50 border-slate-100 font-bold"
                                        placeholder="0555..."
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Nationalité</Label>
                                <div className="relative">
                                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        value={formData.nationalite}
                                        onChange={e => setFormData({ ...formData, nationalite: e.target.value })}
                                        className="h-12 pl-12 rounded-xl bg-slate-50 border-slate-100 font-bold"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Lien Facebook</Label>
                                <div className="relative">
                                    <Facebook className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        value={formData.linkFacebook}
                                        onChange={e => setFormData({ ...formData, linkFacebook: e.target.value })}
                                        className="h-12 pl-12 rounded-xl bg-slate-50 border-slate-100 font-bold"
                                    />
                                </div>
                            </div>
                            <DialogFooter className="col-span-2 mt-6">
                                <Button type="submit" className="w-full h-14 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20">
                                    Créer le compte utilisateur
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {loading ? (
                <div className="flex justify-center p-20"><LoadingSpinner /></div>
            ) : (
                <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-2xl shadow-slate-200/50">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 border-b border-slate-100">
                                <tr>
                                    <th className="p-6 font-black text-[10px] text-slate-400 uppercase tracking-[0.2em]">Contact</th>
                                    <th className="p-6 font-black text-[10px] text-slate-400 uppercase tracking-[0.2em]">Infos Personnelles</th>
                                    <th className="p-6 font-black text-[10px] text-slate-400 uppercase tracking-[0.2em]">Réseaux</th>
                                    <th className="p-6 font-black text-[10px] text-slate-400 uppercase tracking-[0.2em]">Rôle & Statut</th>
                                    <th className="p-6 font-black text-[10px] text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="p-6">
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110",
                                                    user.role.toUpperCase() === 'ADMIN' ? "bg-primary text-white shadow-primary/20" : "bg-slate-100 text-slate-400 shadow-slate-200/50"
                                                )}>
                                                    {user.role.toUpperCase() === 'ADMIN' ? <Shield className="w-6 h-6 border-2 border-white/30 rounded-full p-0.5" /> : <UserIcon className="w-6 h-6" />}
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-900 leading-tight italic uppercase tracking-tight">{user.nom} {user.prenom}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Mail className="w-3 h-3 text-slate-300" />
                                                        <span className="text-[11px] font-bold text-slate-500">{user.email}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-2">
                                                    <Globe className="w-3.5 h-3.5 text-slate-300" />
                                                    <span className="text-xs font-black text-slate-600 uppercase tracking-tighter">{user.nationalite || 'Algérienne'}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Phone className="w-3.5 h-3.5 text-slate-300" />
                                                    <span className="text-xs font-bold text-slate-500">{user.phone || '-'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            {user.linkfacebook ? (
                                                <a href={user.linkfacebook} target="_blank" rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                                                    <Facebook className="w-3.5 h-3.5" /> Facebook
                                                </a>
                                            ) : (
                                                <span className="text-[10px] font-black text-slate-300 uppercase italic">Aucun lien</span>
                                            )}
                                        </td>
                                        <td className="p-6">
                                            <div className="flex flex-col gap-2">
                                                <span className={cn(
                                                    "inline-flex items-center justify-center w-fit px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border",
                                                    user.role.toUpperCase() === 'ADMIN'
                                                        ? "border-primary/20 bg-primary/5 text-primary"
                                                        : "border-slate-200 bg-slate-50 text-slate-500"
                                                )}>
                                                    {user.role}
                                                </span>
                                                {user.is_active !== null && (
                                                    <span className={cn(
                                                        "text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5",
                                                        user.is_active ? "text-emerald-500" : "text-amber-500"
                                                    )}>
                                                        <div className={cn("w-1.5 h-1.5 rounded-full ring-2", user.is_active ? "bg-emerald-500 ring-emerald-100" : "bg-amber-500 ring-amber-100")} />
                                                        {user.is_active ? 'Actif' : 'Inactif'}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost" size="icon"
                                                    title="Copier l'ID"
                                                    className="w-10 h-10 rounded-xl text-slate-300 hover:text-primary hover:bg-primary/5 transition-all"
                                                    onClick={() => handleCopyId(user.id)}
                                                >
                                                    <Copy className="w-5 h-5" />
                                                </Button>
                                                {user.role.toUpperCase() !== 'ADMIN' && (
                                                    <Button
                                                        variant="ghost" size="icon"
                                                        className="w-10 h-10 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
                                                        onClick={() => handleDelete(user.id)}
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsersPage;
