import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCustomTripRequest } from '../../../api';
import type { CustomFlightRequestPayload } from '../../../api';
import { toast } from 'react-toastify';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Plane, Calendar, MapPin, Users, ArrowRight, PlaneTakeoff } from 'lucide-react';
import LoadingSpinner from '../../../components/Shared/LoadingSpinner';
import BackgroundAura from '../../../components/Shared/BackgroundAura';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const FlightsPage = () => {
    const { t } = useTranslation();
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
            toast.success(t('flights_page.success'));
            navigate('/mon-compte', { state: { activeTab: 'requests' } });

        } catch (error: any) {
            console.error(error);
            toast.error(error.message || t('common.error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen pb-12 overflow-hidden">
            <BackgroundAura />

            {/* Hero Section */}
            <div className="relative h-[80vh] min-h-[700px] w-full flex items-center justify-center overflow-hidden mb-[-120px] pt-48 md:pt-56">
                <motion.div
                    initial={{ scale: 1.05, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1436491865332-7a61a109c0f3?q=80&w=2070&auto=format&fit=crop")' }}
                />
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#f8fafc]" />

                <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1, duration: 0.3 }}
                    >
                        <span className="inline-block px-4 py-1.5 rounded-full bg-sky-500/20 backdrop-blur-md border border-sky-500/30 text-white text-[10px] font-black uppercase tracking-[0.3em] mb-6">
                            {t('hero.subtitle')}
                        </span>
                        <h1 className="text-6xl md:text-8xl font-black text-white italic tracking-tighter drop-shadow-2xl mb-4 leading-tight uppercase">
                            {t('flights_page.title')}
                        </h1>
                    </motion.div>
                </div>
            </div>

            <div className="container mx-auto max-w-4xl relative z-20 px-4">
                <motion.div
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                    className="bg-white/80 backdrop-blur-3xl rounded-[3rem] shadow-2xl shadow-sky-900/10 border border-white/50 overflow-hidden"
                >
                    <div className="h-2 bg-gradient-to-r from-sky-500 to-indigo-600"></div>

                    <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-10">
                        {/* Trip Type Toggle */}
                        <div className="flex justify-between items-center border-b border-slate-100 pb-8 gap-4 flex-col md:flex-row">
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 tracking-tighter italic">{t('flights_page.form_title')}</h2>
                                <p className="text-slate-500 font-medium">{t('flights_page.subtitle')}</p>
                            </div>
                            <div className="bg-slate-100 p-1.5 rounded-2xl flex gap-1">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type_vol: 'aller_retour' })}
                                    className={`px-6 py-3 rounded-xl text-sm font-black italic transition-all ${formData.type_vol === 'aller_retour' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    {t('flights_page.round_trip')}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type_vol: 'aller_simple' })}
                                    className={`px-6 py-3 rounded-xl text-sm font-black italic transition-all ${formData.type_vol === 'aller_simple' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    {t('flights_page.one_way')}
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Ville Départ */}
                            <div className="space-y-3">
                                <Label htmlFor="ville_depart" className="flex items-center gap-2 text-slate-700 font-bold ml-1">
                                    <MapPin className="w-4 h-4 text-sky-600" /> {t('flights_page.from')}
                                </Label>
                                <Input
                                    id="ville_depart"
                                    placeholder="Ex: Alger"
                                    value={formData.ville_depart}
                                    onChange={(e) => setFormData({ ...formData, ville_depart: e.target.value })}
                                    required
                                    className="h-14 bg-white/50 border-slate-200 focus:bg-white focus:ring-sky-500/20 focus:border-sky-500 transition-all rounded-2xl md:text-lg"
                                />
                            </div>

                            {/* Ville Arrivée */}
                            <div className="space-y-3">
                                <Label htmlFor="ville_arrivee" className="flex items-center gap-2 text-slate-700 font-bold ml-1">
                                    <MapPin className="w-4 h-4 text-sky-600" /> {t('flights_page.to')}
                                </Label>
                                <Input
                                    id="ville_arrivee"
                                    placeholder="Ex: Paris, Dubaï..."
                                    value={formData.ville_arrivee}
                                    onChange={(e) => setFormData({ ...formData, ville_arrivee: e.target.value })}
                                    required
                                    className="h-14 bg-white/50 border-slate-200 focus:bg-white focus:ring-sky-500/20 focus:border-sky-500 transition-all rounded-2xl md:text-lg"
                                />
                            </div>

                            {/* Dates */}
                            <div className="space-y-3">
                                <Label htmlFor="date_depart" className="flex items-center gap-2 text-slate-700 font-bold ml-1">
                                    <Calendar className="w-4 h-4 text-sky-600" /> {t('flights_page.date_depart')}
                                </Label>
                                <Input
                                    id="date_depart"
                                    type="date"
                                    value={formData.date_depart}
                                    onChange={(e) => setFormData({ ...formData, date_depart: e.target.value })}
                                    required
                                    className="h-14 bg-white/50 border-slate-200 focus:bg-white focus:ring-sky-500/20 focus:border-sky-500 transition-all rounded-2xl md:text-lg block w-full"
                                />
                            </div>

                            {formData.type_vol === 'aller_retour' && (
                                <div className="space-y-3">
                                    <Label htmlFor="date_retour" className="flex items-center gap-2 text-slate-700 font-bold ml-1">
                                        <Calendar className="w-4 h-4 text-sky-600" /> {t('flights_page.date_return')}
                                    </Label>
                                    <Input
                                        id="date_retour"
                                        type="date"
                                        min={formData.date_depart}
                                        value={formData.date_retour}
                                        onChange={(e) => setFormData({ ...formData, date_retour: e.target.value })}
                                        required
                                        className="h-14 bg-white/50 border-slate-200 focus:bg-white focus:ring-sky-500/20 focus:border-sky-500 transition-all rounded-2xl md:text-lg block w-full"
                                    />
                                </div>
                            )}

                            {/* Classe */}
                            <div className="space-y-3">
                                <Label htmlFor="categorie" className="flex items-center gap-2 text-slate-700 font-bold ml-1">
                                    <Plane className="w-4 h-4 text-sky-600" /> {t('flights_page.class')}
                                </Label>
                                <Select
                                    value={formData.categorie}
                                    onValueChange={(val: any) => setFormData({ ...formData, categorie: val })}
                                >
                                    <SelectTrigger className="h-14 bg-white/50 border-slate-200 focus:ring-sky-500 rounded-2xl md:text-lg">
                                        <SelectValue placeholder="Choisir la classe" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-slate-100 shadow-2xl">
                                        <SelectItem value="economique" className="py-3 rounded-xl">{t('flights_page.eco')}</SelectItem>
                                        <SelectItem value="affaires" className="py-3 rounded-xl">{t('flights_page.business')}</SelectItem>
                                        <SelectItem value="premiere" className="py-3 rounded-xl">{t('flights_page.first')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Passengers Section */}
                        <div className="space-y-6 pt-8 border-t border-slate-100">
                            <Label className="flex items-center gap-2 text-xl font-black text-slate-900 italic">
                                <Users className="w-6 h-6 text-sky-600" /> {t('hotels_page.passengers')}
                            </Label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                {/* Adults */}
                                <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase tracking-widest text-slate-400">{t('hotels_page.adults')}</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={formData.passengers.adult}
                                        onChange={(e) => setFormData({ ...formData, passengers: { ...formData.passengers, adult: parseInt(e.target.value) || 1 } })}
                                        className="h-12 bg-slate-50 border-slate-100 focus:bg-white rounded-xl font-bold"
                                    />
                                </div>
                                {/* Children */}
                                <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase tracking-widest text-slate-400">{t('hotels_page.children')}</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={formData.passengers.child}
                                        onChange={(e) => setFormData({ ...formData, passengers: { ...formData.passengers, child: parseInt(e.target.value) || 0 } })}
                                        className="h-12 bg-slate-50 border-slate-100 focus:bg-white rounded-xl font-bold"
                                    />
                                </div>
                                {/* Babies */}
                                <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase tracking-widest text-slate-400">{t('hotels_page.babies')}</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={formData.passengers.baby}
                                        onChange={(e) => setFormData({ ...formData, passengers: { ...formData.passengers, baby: parseInt(e.target.value) || 0 } })}
                                        className="h-12 bg-slate-50 border-slate-100 focus:bg-white rounded-xl font-bold"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-6">
                            <Button
                                type="submit"
                                className="w-full h-20 text-xl font-black italic bg-sky-600 hover:bg-sky-700 shadow-2xl shadow-sky-600/30 hover:scale-[1.02] transition-all rounded-[1.5rem] text-white group"
                                disabled={loading}
                            >
                                {loading ? <LoadingSpinner /> : (
                                    <span className="flex items-center gap-4 uppercase tracking-tighter">
                                        {t('flights_page.submit')} <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                                    </span>
                                )}
                            </Button>
                        </div>

                    </form>
                </motion.div>

                {/* Additional Trust Badges */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="mt-12 flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500"
                >
                    <div className="flex items-center gap-2 font-black text-slate-900 tracking-tighter italic uppercase">
                        <PlaneTakeoff className="w-5 h-5 text-sky-600" /> IATA Certified
                    </div>
                    <div className="flex items-center gap-2 font-black text-slate-900 tracking-tighter italic uppercase">
                        <Plane className="w-5 h-5 text-sky-600" /> World Wide
                    </div>
                    <div className="flex items-center gap-2 font-black text-slate-900 tracking-tighter italic uppercase">
                        <Users className="w-5 h-5 text-sky-600" /> Best Support
                    </div>
                </motion.div>

            </div>
        </div>
    );
};

export default FlightsPage;
