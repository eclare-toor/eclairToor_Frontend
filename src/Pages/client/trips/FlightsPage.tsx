import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCustomTripRequest } from '../../../api';
import type { CustomFlightRequestPayload } from '../../../api';
import { toast } from 'react-toastify';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Plane, Calendar, MapPin, Users, ArrowRight } from 'lucide-react';
import LoadingSpinner from '../../../components/Shared/LoadingSpinner';

const FlightsPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Default form data
    const [formData, setFormData] = useState({
        type_vol: 'aller_retour' as 'aller_retour' | 'aller_simple',
        ville_depart: 'Alger',
        ville_arrivee: '',
        date_depart: '',
        date_retour: '',
        categorie: 'economique' as 'economique' | 'affaires' | 'premiere',
        passengers: {
            adult: 1,
            child: 0,
            baby: 0
        }
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload: CustomFlightRequestPayload = {
                category: 'vol',
                details: {
                    type_vol: formData.type_vol,
                    ville_depart: formData.ville_depart,
                    ville_arrivee: formData.ville_arrivee,
                    date_depart: formData.date_depart,
                    date_retour: formData.type_vol === 'aller_retour' ? formData.date_retour : undefined,
                    categorie: formData.categorie,
                    passengers: formData.passengers
                }
            };

            await createCustomTripRequest(payload);
            toast.success('Votre demande de vol a été envoyée avec succès !');
            navigate('/mon-compte', { state: { activeTab: 'requests' } });

        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Une erreur est survenue lors de l\'envoi de la demande.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-transparent pt-40 pb-12 px-4">
            <div className="container mx-auto max-w-3xl">

                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-sky-100 text-sky-600 mb-4">
                        <Plane className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-heading font-bold text-slate-900 mb-4">
                        Réservez votre Vol
                    </h1>
                    <p className="text-slate-600 max-w-2xl mx-auto">
                        Comparez et réservez vos billets d'avion au meilleur prix pour toutes destinations.
                    </p>
                </div>

                <div className="bg-white/70 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl shadow-blue-900/10 border border-white/50 overflow-hidden">
                    <div className="h-2 bg-gradient-to-r from-sky-500 to-indigo-600"></div>

                    <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-8">

                        {/* Trip Type Toggle */}
                        <div className="flex justify-center mb-6">
                            <div className="bg-slate-100 p-1 rounded-xl flex gap-1">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type_vol: 'aller_retour' })}
                                    className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${formData.type_vol === 'aller_retour' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    Aller-Retour
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type_vol: 'aller_simple' })}
                                    className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${formData.type_vol === 'aller_simple' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    Aller Simple
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Ville Départ */}
                            <div className="space-y-2">
                                <Label htmlFor="ville_depart" className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-sky-600" /> Ville de départ
                                </Label>
                                <Input
                                    id="ville_depart"
                                    placeholder="Ex: Alger"
                                    value={formData.ville_depart}
                                    onChange={(e) => setFormData({ ...formData, ville_depart: e.target.value })}
                                    required
                                    className="h-12 border-slate-200 focus:border-sky-500"
                                />
                            </div>

                            {/* Ville Arrivée */}
                            <div className="space-y-2">
                                <Label htmlFor="ville_arrivee" className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-sky-600" /> Ville d'arrivée
                                </Label>
                                <Input
                                    id="ville_arrivee"
                                    placeholder="Ex: Paris, Dubaï..."
                                    value={formData.ville_arrivee}
                                    onChange={(e) => setFormData({ ...formData, ville_arrivee: e.target.value })}
                                    required
                                    className="h-12 border-slate-200 focus:border-sky-500"
                                />
                            </div>

                            {/* Dates */}
                            <div className="space-y-2">
                                <Label htmlFor="date_depart" className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-sky-600" /> Date de départ
                                </Label>
                                <Input
                                    id="date_depart"
                                    type="date"
                                    value={formData.date_depart}
                                    onChange={(e) => setFormData({ ...formData, date_depart: e.target.value })}
                                    required
                                    className="h-12 border-slate-200 focus:border-sky-500 block w-full"
                                />
                            </div>

                            {formData.type_vol === 'aller_retour' && (
                                <div className="space-y-2">
                                    <Label htmlFor="date_retour" className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-sky-600" /> Date de retour
                                    </Label>
                                    <Input
                                        id="date_retour"
                                        type="date"
                                        min={formData.date_depart}
                                        value={formData.date_retour}
                                        onChange={(e) => setFormData({ ...formData, date_retour: e.target.value })}
                                        required
                                        className="h-12 border-slate-200 focus:border-sky-500 block w-full"
                                    />
                                </div>
                            )}

                            {/* Classe */}
                            <div className="space-y-2">
                                <Label htmlFor="categorie" className="flex items-center gap-2">
                                    <Plane className="w-4 h-4 text-sky-600" /> Classe
                                </Label>
                                <Select
                                    value={formData.categorie}
                                    onValueChange={(val: any) => setFormData({ ...formData, categorie: val })}
                                >
                                    <SelectTrigger className="h-12 border-slate-200 focus:ring-sky-500">
                                        <SelectValue placeholder="Choisir la classe" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="economique">Économique</SelectItem>
                                        <SelectItem value="affaires">Affaires</SelectItem>
                                        <SelectItem value="premiere">Première</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Passengers Section */}
                        <div className="space-y-4 pt-4 border-t border-slate-100">
                            <Label className="flex items-center gap-2 text-lg">
                                <Users className="w-5 h-5 text-sky-600" /> Passagers
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
                            <Button type="submit" className="w-full h-14 text-lg font-bold bg-sky-600 hover:bg-sky-700 shadow-lg shadow-sky-600/25 hover:scale-[1.01] transition-transform text-white" disabled={loading}>
                                {loading ? <LoadingSpinner /> : (
                                    <span className="flex items-center gap-2">
                                        Rechercher les vols <ArrowRight className="w-5 h-5" />
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

export default FlightsPage;
