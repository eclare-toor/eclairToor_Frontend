import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCustomTripRequest } from '../../../api';
import type { CustomHotelRequestPayload } from '../../../api';
import { toast } from 'react-toastify';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { MapPin, Calendar, Users, Star, ArrowRight } from 'lucide-react';
import LoadingSpinner from '../../../components/Shared/LoadingSpinner';

const HotelPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        wilaya: '',
        lieu_exact: '',
        nbre_etoile: '4',
        date_debut: '',
        date_fin: '',
        passengers: {
            adult: 2,
            child: 0,
            baby: 0
        }
    });

    const calculateDays = () => {
        if (formData.date_debut && formData.date_fin) {
            const start = new Date(formData.date_debut);
            const end = new Date(formData.date_fin);
            const diffTime = Math.abs(end.getTime() - start.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays;
        }
        return 0;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload: CustomHotelRequestPayload = {
                category: 'hotel',
                details: {
                    wilaya: formData.wilaya,
                    lieu_exact: formData.lieu_exact,
                    nbre_etoile: parseInt(formData.nbre_etoile),
                    date_debut: formData.date_debut,
                    date_fin: formData.date_fin,
                    passengers: formData.passengers
                }
            };

            await createCustomTripRequest(payload);
            toast.success('Votre demande de réservation d\'hôtel a été envoyée avec succès !');
            navigate('/mon-compte', { state: { activeTab: 'requests' } });

        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Une erreur est survenue lors de l\'envoi de la demande.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-transparent pb-12">
            {/* Hero Section */}
            <div className="relative h-[500px] w-full flex items-center justify-center overflow-hidden mb-[-100px]">
                <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
                    style={{ backgroundImage: 'url("/src/assets/hotel.jpeg")' }} />
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[px]" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#f8fafc]" />

                <div className="relative z-10 text-center px-4">

                    <h1 className="text-5xl md:text-7xl font-black text-white italic tracking-tighter drop-shadow-2xl">
                        VOTRE <span className="text-primary-400">HÔTEL</span> IDÉAL
                    </h1>
                </div>
            </div>

            <div className="container mx-auto max-w-3xl relative z-20 px-4">

                <div className="bg-white/70 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl shadow-blue-900/10 border border-white/50 overflow-hidden">
                    <div className="h-2 bg-gradient-to-r from-blue-500 to-blue-700"></div>

                    <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-8">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Wilaya / Ville */}
                            <div className="space-y-2">
                                <Label htmlFor="wilaya" className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-blue-600" /> Wilaya / Ville
                                </Label>
                                <Input
                                    id="wilaya"
                                    placeholder="Ex: Alger, Oran..."
                                    value={formData.wilaya}
                                    onChange={(e) => setFormData({ ...formData, wilaya: e.target.value })}
                                    required
                                    className="h-12 bg-white/50 border-white/40 focus:bg-white/90 transition-all rounded-xl"
                                />
                            </div>

                            {/* Lieu Exact */}
                            <div className="space-y-2">
                                <Label htmlFor="lieu_exact" className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-blue-600" /> Lieu / Quartier (Optionnel)
                                </Label>
                                <Input
                                    id="lieu_exact"
                                    placeholder="Ex: Centre ville, Bord de mer..."
                                    value={formData.lieu_exact}
                                    onChange={(e) => setFormData({ ...formData, lieu_exact: e.target.value })}
                                    className="h-12 border-slate-200 focus:border-blue-500"
                                />
                            </div>

                            {/* Dates */}
                            <div className="space-y-2">
                                <Label htmlFor="date_debut" className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-blue-600" /> Date d'arrivée
                                </Label>
                                <Input
                                    id="date_debut"
                                    type="date"
                                    value={formData.date_debut}
                                    onChange={(e) => setFormData({ ...formData, date_debut: e.target.value })}
                                    required
                                    className="h-12 bg-white/50 border-white/40 focus:bg-white/90 transition-all rounded-xl block w-full"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="date_fin" className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-blue-600" /> Date de départ
                                </Label>
                                <Input
                                    id="date_fin"
                                    type="date"
                                    min={formData.date_debut}
                                    value={formData.date_fin}
                                    onChange={(e) => setFormData({ ...formData, date_fin: e.target.value })}
                                    required
                                    className="h-12 bg-white/50 border-white/40 focus:bg-white/90 transition-all rounded-xl block w-full"
                                />
                            </div>

                            {/* Nombre d'étoiles */}
                            <div className="space-y-2">
                                <Label htmlFor="nbre_etoile" className="flex items-center gap-2">
                                    <Star className="w-4 h-4 text-blue-600" /> Standing (Étoiles)
                                </Label>
                                <Select
                                    value={formData.nbre_etoile}
                                    onValueChange={(val) => setFormData({ ...formData, nbre_etoile: val })}
                                >
                                    <SelectTrigger className="h-12 bg-white/50 border-white/40 focus:ring-blue-500 rounded-xl">
                                        <SelectValue placeholder="Choisir le nombre d'étoiles" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="2">2 Étoiles</SelectItem>
                                        <SelectItem value="3">3 Étoiles</SelectItem>
                                        <SelectItem value="4">4 Étoiles</SelectItem>
                                        <SelectItem value="5">5 Étoiles (Luxe)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Durée Info */}
                            <div className="flex items-center justify-center">
                                <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-medium text-sm">
                                    {calculateDays() > 0 ? `Durée du séjour: ${calculateDays()} nuits` : 'Sélectionnez vos dates'}
                                </div>
                            </div>
                        </div>

                        {/* Passengers Section */}
                        <div className="space-y-4 pt-4 border-t border-slate-100">
                            <Label className="flex items-center gap-2 text-lg">
                                <Users className="w-5 h-5 text-blue-600" /> Passagers
                            </Label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {/* Adults */}
                                <div className="space-y-1">
                                    <Label className="text-xs text-slate-500">Adultes (+12 ans)</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={formData.passengers.adult}
                                        onChange={(e) => setFormData({ ...formData, passengers: { ...formData.passengers, adult: parseInt(e.target.value) || 1 } })}
                                        className="h-10 border-slate-200"
                                    />
                                </div>
                                {/* Children */}
                                <div className="space-y-1">
                                    <Label className="text-xs text-slate-500">Enfants (2-11 ans)</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={formData.passengers.child}
                                        onChange={(e) => setFormData({ ...formData, passengers: { ...formData.passengers, child: parseInt(e.target.value) || 0 } })}
                                        className="h-10 border-slate-200"
                                    />
                                </div>
                                {/* Babies */}
                                <div className="space-y-1">
                                    <Label className="text-xs text-slate-500">Bébés (-2 ans)</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={formData.passengers.baby}
                                        onChange={(e) => setFormData({ ...formData, passengers: { ...formData.passengers, baby: parseInt(e.target.value) || 0 } })}
                                        className="h-10 border-slate-200"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-6">
                            <Button type="submit" className="w-full h-14 text-lg font-bold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/25 hover:scale-[1.01] transition-transform text-white" disabled={loading}>
                                {loading ? <LoadingSpinner /> : (
                                    <span className="flex items-center gap-2">
                                        Envoyer ma demande <ArrowRight className="w-5 h-5" />
                                    </span>
                                )}
                            </Button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
};

export default HotelPage;
