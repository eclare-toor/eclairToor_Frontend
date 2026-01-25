import React, { useEffect, useState } from 'react';
import { getUserProfile } from '../../api';
import type { User } from '../../Types';
import {
    User as UserIcon,
    Mail,
    Smartphone,
    Calendar,
    ShieldCheck,
    Facebook,
    Loader2,
    Globe,
    Shield,
    Fingerprint
} from '../../components/icons';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { toast } from 'react-toastify';
import { updateProfile } from '../../api';

const AdminProfilePage = () => {
    const [profile, setProfile] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<Partial<User>>({});
    const [updating, setUpdating] = useState(false);

    // Check if there are unsaved changes
    const isDirty = (() => {
        if (!profile || !isEditing) return false;

        const fields: (keyof User)[] = ['nom', 'prenom', 'email', 'phone', 'nationalite', 'linkfacebook'];
        return fields.some(key => {
            const originalValue = profile[key as keyof User] || '';
            const currentValue = editData[key as keyof typeof editData] || '';
            return currentValue !== originalValue;
        });
    })();

    // Handle browser refresh/close
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty]);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const data = await getUserProfile();
            setProfile(data);
            setEditData({
                nom: data.nom,
                prenom: data.prenom,
                email: data.email,
                phone: data.phone || '',
                nationalite: data.nationalite,
                linkfacebook: data.linkfacebook || ''
            });
        } catch (error) {
            console.error("Failed to load admin profile", error);
            toast.error("Échec du chargement du profil administrateur");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleUpdate = async () => {
        if (!profile) return;

        // On n'envoie que les champs qui ont réellement été modifiés
        const changedFields: Partial<User> = {};
        (Object.keys(editData) as Array<keyof typeof editData>).forEach(key => {
            const originalValue = profile[key as keyof User] || '';
            const currentValue = editData[key] || '';

            if (currentValue !== originalValue) {
                changedFields[key as keyof User] = editData[key] as any;
            }
        });

        if (Object.keys(changedFields).length === 0) {
            setIsEditing(false);
            return;
        }

        setUpdating(true);
        try {
            await updateProfile(changedFields);
            toast.success("Profil mis à jour avec succès");
            setIsEditing(false);
            await fetchProfile(); // Refresh profile data
        } catch (error: any) {
            console.error("Error updating profile:", error);
            toast.error(error.message || "Erreur lors de la mise à jour du profil");
        } finally {
            setUpdating(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEditData(prev => ({ ...prev, [name]: value }));
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                <p className="text-slate-500 font-medium">Chargement du profil administrateur...</p>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                <ShieldCheck className="w-16 h-16 text-slate-200 mb-4" />
                <h2 className="text-xl font-bold text-slate-800 mb-2">Profil Introuvable</h2>
                <p className="text-slate-500 mb-6 px-4">Nous n'avons pas pu récupérer les informations de votre compte admin.</p>
                <Button onClick={() => window.location.reload()}>Réessayer</Button>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Mon Profil Administrateur</h1>
                <p className="text-slate-500">Gérez vos informations personnelles et les accès de sécurité.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Avatar & Basic Stats */}
                <div className="flex flex-col gap-6">
                    <Card className="border-none shadow-sm overflow-hidden">
                        <div className="h-24 bg-gradient-to-r from-primary to-blue-600"></div>
                        <CardContent className="relative pt-12 pb-8 text-center">
                            <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                                <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-xl">
                                    <div className="w-full h-full rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                        <span className="text-3xl font-black uppercase">
                                            {profile.nom.charAt(0)}{profile.prenom.charAt(0)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 capitalize">
                                {profile.prenom} {profile.nom}
                            </h2>
                            <p className="text-sm text-slate-500 mb-4">{profile.email}</p>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-700 text-[10px] font-black uppercase tracking-wider border border-red-200">
                                <Shield className="w-3 h-3" />
                                Super Administrateur
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <Fingerprint className="w-4 h-4 text-primary" /> Sécurité
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between py-2 border-b border-slate-50">
                                <span className="text-xs text-slate-500">Statut du compte</span>
                                <span className="px-2 py-0.5 rounded-md bg-green-100 text-green-700 text-[10px] font-bold">ACTIF</span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-slate-50">
                                <span className="text-xs text-slate-500">Nationalité</span>
                                <span className="text-xs font-bold text-slate-700 capitalize">{profile.nationalite || 'N/A'}</span>
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <span className="text-xs text-slate-500">ID Système</span>
                                <span className="text-[10px] font-mono text-slate-400">{profile.id.substring(0, 8)}...</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Detailed Info */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-none shadow-sm">
                        <CardHeader className="border-b border-slate-50">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <UserIcon className="w-5 h-5 text-primary" />
                                Détails du Compte
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nom</label>
                                    {isEditing ? (
                                        <Input
                                            name="nom"
                                            value={editData.nom}
                                            onChange={handleChange}
                                            className="h-9 rounded-lg border-slate-200 focus:border-primary"
                                        />
                                    ) : (
                                        <p className="text-slate-800 font-bold border-b border-slate-100 pb-2">{profile.nom}</p>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Prénom</label>
                                    {isEditing ? (
                                        <Input
                                            name="prenom"
                                            value={editData.prenom}
                                            onChange={handleChange}
                                            className="h-9 rounded-lg border-slate-200 focus:border-primary"
                                        />
                                    ) : (
                                        <p className="text-slate-800 font-bold border-b border-slate-100 pb-2">{profile.prenom}</p>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Professionnel</label>
                                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                                        <Mail className="w-4 h-4 text-slate-300" />
                                        {isEditing ? (
                                            <Input
                                                name="email"
                                                value={editData.email}
                                                onChange={handleChange}
                                                className="h-9 rounded-lg border-slate-200 focus:border-primary flex-1 border-none bg-transparent h-auto p-0 focus-visible:ring-0"
                                            />
                                        ) : (
                                            <p className="text-slate-800 font-bold">{profile.email}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Téléphonique</label>
                                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                                        <Smartphone className="w-4 h-4 text-slate-300" />
                                        {isEditing ? (
                                            <Input
                                                name="phone"
                                                value={editData.phone}
                                                onChange={handleChange}
                                                placeholder="Non configuré"
                                                className="h-9 rounded-lg border-slate-200 focus:border-primary flex-1 border-none bg-transparent h-auto p-0 focus-visible:ring-0"
                                            />
                                        ) : (
                                            <p className="text-slate-800 font-bold">{profile.phone || 'Non configuré'}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date de création</label>
                                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                                        <Calendar className="w-4 h-4 text-slate-300" />
                                        <p className="text-slate-800 font-bold">
                                            {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Initialisation système'}
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lien Facebook</label>
                                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                                        <Facebook className="w-4 h-4 text-slate-300" />
                                        {isEditing ? (
                                            <Input
                                                name="linkfacebook"
                                                value={editData.linkfacebook}
                                                onChange={handleChange}
                                                placeholder="Lien Facebook"
                                                className="h-9 rounded-lg border-slate-200 focus:border-primary flex-1 border-none bg-transparent h-auto p-0 focus-visible:ring-0"
                                            />
                                        ) : (
                                            profile.linkfacebook ? (
                                                <a href={profile.linkfacebook} target="_blank" rel="noopener noreferrer" className="text-primary font-bold hover:underline">Connecté</a>
                                            ) : (
                                                <span className="text-slate-400 font-medium">Non relié</span>
                                            )
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-10 flex flex-wrap gap-4">
                                {isEditing ? (
                                    <>
                                        <Button
                                            onClick={handleUpdate}
                                            disabled={updating}
                                            className="bg-primary hover:bg-primary/90 rounded-xl px-8 shadow-lg shadow-primary/20"
                                        >
                                            {updating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                            Enregistrer les modifications
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => setIsEditing(false)}
                                            className="rounded-xl px-8 border-slate-200"
                                        >
                                            Annuler
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Button
                                            onClick={() => setIsEditing(true)}
                                            className="bg-primary hover:bg-primary/90 rounded-xl px-8 shadow-lg shadow-primary/20"
                                        >
                                            Modifier le Profil
                                        </Button>
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm bg-slate-900 text-white overflow-hidden">
                        <div className="p-6 relative">
                            <Globe className="absolute -bottom-4 -right-4 w-32 h-32 text-white/5" />
                            <h3 className="text-lg font-bold mb-2">Vérification de Sécurité</h3>
                            <p className="text-slate-400 text-sm mb-4 max-w-md">
                                En tant qu'administrateur, votre compte bénéficie d'une surveillance renforcée.
                                Assurez-vous de ne jamais partager vos identifiants.
                            </p>
                            <div className="flex items-center gap-2 text-green-400 text-xs font-bold">
                                <ShieldCheck className="w-4 h-4" />
                                Session Sécurisée (SSL 256-bit)
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AdminProfilePage;
