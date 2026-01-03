import { useEffect, useState } from 'react';
import { useAuth } from '../../Context/AuthContext';
import { getUserProfile } from '../../api';
import type { User } from '../../Types';
import { UserCircle, Mail, Phone, MapPin, Calendar, Shield, Facebook, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { toast } from 'react-toastify';

const Profile = () => {
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
                toast.error("Impossible de charger le profil utilisateur");
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
                <p className="text-muted-foreground">Chargement de votre profil...</p>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <p className="text-red-500 mb-4">Erreur lors du chargement du profil.</p>
                <Button onClick={() => window.location.reload()}>Réessayer</Button>
            </div>
        );
    }

    // Determine role color/badge
    const roleBadgeColor = profile.role === 'admin'
        ? 'bg-red-100 text-red-700 border-red-200'
        : 'bg-green-100 text-green-700 border-green-200';

    return (
        <div className="min-h-screen bg-transparent pt-40 pb-24">
            <div className="container mx-auto px-4 max-w-4xl">

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
                                <h1 className="text-3xl font-heading font-bold text-gray-900 capitalize">
                                    {profile.prenom} {profile.nom}
                                </h1>
                                <p className="text-muted-foreground flex items-center justify-center md:justify-start gap-2 mt-2">
                                    <Mail className="w-4 h-4" />
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
                    <Card className="md:col-span-2 border-none shadow-md">
                        <CardHeader>
                            <CardTitle className="text-xl flex items-center gap-2">
                                <UserCircle className="w-5 h-5 text-primary" />
                                Informations Personnelles
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Nom</label>
                                    <p className="font-medium text-gray-900 border-b pb-2">{profile.nom}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Prénom</label>
                                    <p className="font-medium text-gray-900 border-b pb-2">{profile.prenom}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</label>
                                    <div className="flex items-center gap-2 border-b pb-2">
                                        <Mail className="w-4 h-4 text-gray-400" />
                                        <p className="font-medium text-gray-900">{profile.email}</p>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Téléphone</label>
                                    <div className="flex items-center gap-2 border-b pb-2">
                                        <Phone className="w-4 h-4 text-gray-400" />
                                        <p className="font-medium text-gray-900">{profile.phone || 'Non renseigné'}</p>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Nationalité</label>
                                    <div className="flex items-center gap-2 border-b pb-2">
                                        <MapPin className="w-4 h-4 text-gray-400" />
                                        <p className="font-medium text-gray-900 capitalize">{profile.nationalite || 'Non renseignée'}</p>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Date d'inscription</label>
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
                    <div className="space-y-8">
                        <Card className="border-none shadow-md bg-white">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-primary" />
                                    Statut du Compte
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${profile.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                    <span className="font-medium text-gray-700">
                                        {profile.is_active ? 'Actif' : 'Inactif'}
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-2">
                                    Votre compte est {profile.is_active ? 'pleinement opérationnel' : 'désactivé'}.
                                </p>
                            </CardContent>
                        </Card>

                        {profile.linkfacebook && (
                            <Card className="border-none shadow-md overflow-hidden">
                                <div className="bg-[#1877F2] p-4 flex items-center justify-center">
                                    <Facebook className="w-8 h-8 text-white" />
                                </div>
                                <CardContent className="pt-6 text-center">
                                    <p className="font-medium text-gray-900 mb-4">Lié à Facebook</p>
                                    <a
                                        href={profile.linkfacebook}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-primary hover:underline break-all"
                                    >
                                        Voir le profil
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
