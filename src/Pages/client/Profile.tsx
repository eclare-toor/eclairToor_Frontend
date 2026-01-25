import { useEffect, useState } from 'react';
import { useAuth } from '../../Context/AuthContext';
import { getUserProfile, updateProfile } from '../../api';
import type { User } from '../../Types';
import { UserCircle, Mail, Phone, MapPin, Calendar, Shield, Facebook, Loader2, Edit3, Globe } from '../../components/icons';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { toast } from 'react-toastify';

import { useTranslation } from 'react-i18next';
import BackgroundAura from '../../components/Shared/BackgroundAura';

const Profile = () => {
    const { t, i18n } = useTranslation();
    useAuth();
    const [profile, setProfile] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editFormData, setEditFormData] = useState<Partial<User>>({
        nom: '',
        prenom: '',
        email: '',
        phone: '',
        nationalite: '',
        linkfacebook: ''
    });

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const data = await getUserProfile();
            setProfile(data);
            setEditFormData({
                nom: data.nom || '',
                prenom: data.prenom || '',
                email: data.email || '',
                phone: data.phone || '',
                nationalite: data.nationalite || '',
                linkfacebook: data.linkfacebook || ''
            });
        } catch (error) {
            console.error("Failed to load profile", error);
            toast.error(t('profile.error'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleUpdateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile) return;

        // Diffing: only send changed fields
        const changes: any = {};
        const fields: (keyof User)[] = ['nom', 'prenom', 'email', 'phone', 'nationalite', 'linkfacebook'];

        fields.forEach(field => {
            const newValue = (editFormData as any)[field];
            const oldValue = (profile as any)[field];
            if (newValue !== oldValue && (newValue !== '' || oldValue !== null)) {
                changes[field] = newValue;
            }
        });

        if (Object.keys(changes).length === 0) {
            toast.info(t('profile.no_changes', { defaultValue: "Aucune modification détectée" }));
            setIsEditModalOpen(false);
            return;
        }

        try {
            await updateProfile(changes);
            toast.success(t('profile.update_success', { defaultValue: 'Profil mis à jour avec succès' }));
            setIsEditModalOpen(false);
            fetchProfile(); // Refresh profile data
        } catch (error: any) {
            toast.error(error.message || t('profile.update_error', { defaultValue: 'Erreur lors de la mise à jour' }));
        }
    };


    // --- BOOKINGS LOGIC REMOVED ---

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">{t('profile.loading')}</p>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <p className="text-red-500 mb-4">{t('profile.error')}</p>
                <Button onClick={() => window.location.reload()}>{t('profile.retry')}</Button>
            </div>
        );
    }

    // Determine role color/badge
    const roleBadgeColor = profile.role === 'admin'
        ? 'bg-red-100 text-red-700 border-red-200'
        : 'bg-green-100 text-green-700 border-green-200';

    return (
        <div className="min-h-screen bg-transparent pt-48 md:pt-56 pb-24 px-4 relative">
            <BackgroundAura />
            <div className="container mx-auto max-w-5xl">

                {/* Header Section */}
                <div className="bg-white/70 backdrop-blur-2xl rounded-2xl shadow-xl shadow-blue-900/5 border border-white/40 p-8 mb-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-primary/20 to-secondary/20 -z-0"></div>

                    <div className="relative z-10">
                        <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-gray-100 flex items-center justify-center text-gray-400 overflow-hidden">
                            {/* Placeholder for avatar since API doesn't provide one explicitly, or use initials */}
                            <span className="text-4xl font-bold text-gray-300">
                                {profile.nom.charAt(0).toUpperCase()}{profile.prenom.charAt(0).toUpperCase()}
                            </span>
                        </div>
                    </div>

                    <div className="flex-1 text-center md:text-left z-10 pt-4 md:pt-0">
                        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-4">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-heading font-black text-slate-900 capitalize tracking-tight">
                                    {profile.prenom} {profile.nom}
                                </h1>
                                <p className="text-slate-500 font-medium flex items-center justify-center md:justify-start gap-2 mt-2">
                                    <Mail className="w-4 h-4 text-primary" />
                                    {profile.email}
                                </p>
                            </div>
                            <div className={`px-4 py-1.5 rounded-full border text-sm font-semibold uppercase tracking-wide ${roleBadgeColor}`}>
                                {t(`profile.roles.${profile.role}`, { defaultValue: profile.role })}
                            </div>
                            <Button
                                onClick={() => setIsEditModalOpen(true)}
                                className="h-10 px-6 rounded-xl bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 font-bold shadow-sm flex items-center gap-2"
                            >
                                <Edit3 className="w-4 h-4" />
                                {t('profile.edit_button', { defaultValue: 'Modifier le profil' })}
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Main Info */}
                    <Card className="md:col-span-2 border-none shadow-xl shadow-slate-200/50 bg-white/80 backdrop-blur-xl h-fit">
                        <CardHeader className="border-b border-slate-100 pb-4">
                            <CardTitle className="text-xl font-bold flex items-center gap-3 text-slate-800">
                                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                    <UserCircle className="w-6 h-6" />
                                </div>
                                {t('profile.personal_info')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-8 pt-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('profile.nom')}</label>
                                    <p className="font-medium text-gray-900 border-b pb-2">{profile.nom}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('profile.prenom')}</label>
                                    <p className="font-medium text-gray-900 border-b pb-2">{profile.prenom}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('profile.email')}</label>
                                    <div className="flex items-center gap-2 border-b pb-2">
                                        <Mail className="w-4 h-4 text-gray-400" />
                                        <p className="font-medium text-gray-900">{profile.email}</p>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('profile.phone')}</label>
                                    <div className="flex items-center gap-2 border-b pb-2">
                                        <Phone className="w-4 h-4 text-gray-400" />
                                        <p className="font-medium text-gray-900">{profile.phone || t('profile.not_provided')}</p>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('profile.nationality')}</label>
                                    <div className="flex items-center gap-2 border-b pb-2">
                                        <MapPin className="w-4 h-4 text-gray-400" />
                                        <p className="font-medium text-gray-900 capitalize">{profile.nationalite || t('profile.not_provided')}</p>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('profile.joined_date')}</label>
                                    <div className="flex items-center gap-2 border-b pb-2">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <p className="font-medium text-gray-900">
                                            {profile.created_at ? new Date(profile.created_at).toLocaleDateString(i18n.language, {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            }) : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Sidebar / Extra Info */}
                    <div className="space-y-6">
                        <Card className="border-none shadow-xl shadow-slate-200/50 bg-white/80 backdrop-blur-xl">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-primary" />
                                    {t('profile.account_status')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${profile.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                    <span className="font-medium text-gray-700">
                                        {profile.is_active ? t('profile.active') : t('profile.inactive')}
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-2">
                                    {profile.is_active ? t('profile.status_desc_active') : t('profile.status_desc_inactive')}
                                </p>
                            </CardContent>
                        </Card>

                        {profile.linkfacebook && (
                            <Card className="border-none shadow-md overflow-hidden">
                                <div className="bg-[#1877F2] p-4 flex items-center justify-center">
                                    <Facebook className="w-8 h-8 text-white" />
                                </div>
                                <CardContent className="pt-6 text-center">
                                    <p className="font-medium text-gray-900 mb-4">{t('profile.linked_facebook')}</p>
                                    <a
                                        href={profile.linkfacebook}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-primary hover:underline break-all"
                                    >
                                        {t('profile.view_profile')}
                                    </a>
                                </CardContent>
                            </Card>
                        )}
                    </div>


                </div>
            </div>

            {/* Edit Profile Dialog */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="sm:max-w-[500px] rounded-[2rem] p-8">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black text-slate-900 mb-6">
                            {t('profile.edit_title', { defaultValue: 'Modifier mes informations' })}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdateSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-slate-400">
                                {t('profile.nom', { defaultValue: 'Nom' })}
                            </Label>
                            <Input
                                required
                                value={editFormData.nom || ''}
                                onChange={e => setEditFormData({ ...editFormData, nom: e.target.value })}
                                className="h-12 rounded-xl bg-slate-50 border-slate-100 font-bold"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-slate-400">
                                {t('profile.prenom', { defaultValue: 'Prénom' })}
                            </Label>
                            <Input
                                required
                                value={editFormData.prenom || ''}
                                onChange={e => setEditFormData({ ...editFormData, prenom: e.target.value })}
                                className="h-12 rounded-xl bg-slate-50 border-slate-100 font-bold"
                            />
                        </div>
                        <div className="space-y-2 col-span-1 md:col-span-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-slate-400">
                                {t('profile.email', { defaultValue: 'Email' })}
                            </Label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    type="email"
                                    required
                                    value={editFormData.email || ''}
                                    onChange={e => setEditFormData({ ...editFormData, email: e.target.value })}
                                    className="h-12 pl-12 rounded-xl bg-slate-50 border-slate-100 font-bold"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-slate-400">
                                {t('profile.phone', { defaultValue: 'Téléphone' })}
                            </Label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    value={editFormData.phone || ''}
                                    onChange={e => setEditFormData({ ...editFormData, phone: e.target.value })}
                                    className="h-12 pl-12 rounded-xl bg-slate-50 border-slate-100 font-bold"
                                    placeholder="0555..."
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-slate-400">
                                {t('profile.nationality', { defaultValue: 'Nationalité' })}
                            </Label>
                            <div className="relative">
                                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    value={editFormData.nationalite || ''}
                                    onChange={e => setEditFormData({ ...editFormData, nationalite: e.target.value })}
                                    className="h-12 pl-12 rounded-xl bg-slate-50 border-slate-100 font-bold"
                                />
                            </div>
                        </div>
                        <div className="space-y-2 col-span-1 md:col-span-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-slate-400">
                                {t('profile.linkfacebook', { defaultValue: 'Lien Facebook' })}
                            </Label>
                            <div className="relative">
                                <Facebook className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    value={editFormData.linkfacebook || ''}
                                    onChange={e => setEditFormData({ ...editFormData, linkfacebook: e.target.value })}
                                    className="h-12 pl-12 rounded-xl bg-slate-50 border-slate-100 font-bold"
                                />
                            </div>
                        </div>
                        <DialogFooter className="col-span-1 md:col-span-2 mt-6">
                            <Button type="submit" className="w-full h-14 rounded-2xl font-black uppercase tracking-widest bg-primary text-white shadow-xl shadow-primary/20">
                                {t('profile.save_button', { defaultValue: 'Enregistrer' })}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>


        </div>
    );
};

export default Profile;
