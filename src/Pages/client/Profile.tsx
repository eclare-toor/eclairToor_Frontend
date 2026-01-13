import { useEffect, useState } from 'react';
import { useAuth } from '../../Context/AuthContext';
import { getUserProfile } from '../../api';
import type { User } from '../../Types';
import { UserCircle, Mail, Phone, MapPin, Calendar, Shield, Facebook, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { toast } from 'react-toastify';

import { useTranslation } from 'react-i18next';

const Profile = () => {
    const { t } = useTranslation();
    const { } = useAuth();
    const [profile, setProfile] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await getUserProfile();
                setProfile(data);
            } catch (error) {
                console.error("Failed to load profile", error);
                toast.error(t('profile.error'));
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

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
        <div className="min-h-screen bg-transparent pt-32 pb-24 px-4">
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
                                {profile.role}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Main Info */}
                    <Card className="md:col-span-2 border-none shadow-xl shadow-slate-200/50 bg-white/80 backdrop-blur-xl">
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
                                            {profile.created_at ? new Date(profile.created_at).toLocaleDateString('fr-FR', {
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
        </div>
    );
};

export default Profile;
