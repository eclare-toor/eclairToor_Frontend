import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCustomTripRequest } from '../../../api';
import type { CustomHotelRequestPayload } from '../../../api';
import { toast } from 'react-toastify';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { MapPin, Calendar, Users, Star, ArrowRight, Hotel, BedDouble } from '../../../components/icons';
import LoadingSpinner from '../../../components/Shared/LoadingSpinner';
import BackgroundAura from '../../../components/Shared/BackgroundAura';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import hotelImg from '../../../assets/hotel.webp';


const HotelPage = () => {
    const { t } = useTranslation();
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
            toast.success(t('hotels_page.success'));
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
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${hotelImg})` }}

                />


                <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1, duration: 0.2 }}
                    >
                        <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 text-white text-[10px] font-black uppercase  mb-6">
                            {t('hotels_page.subtitle')}
                        </span>
                        <h1 className="text-6xl md:text-8xl font-black text-white italic tracking-tighter drop-shadow-2xl mb-4 leading-tight uppercase">
                            {t('hotels_page.title')}
                        </h1>
                    </motion.div>
                </div>
            </div>

            <div className="container mx-auto max-w-4xl relative z-20 px-4">
                <motion.div
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.2 }}
                    className="bg-white/80 backdrop-blur-3xl rounded-[3rem] shadow-2xl shadow-emerald-900/10 border border-white/50 overflow-hidden"
                >
                    <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-700"></div>

                    <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-10">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-8">
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 tracking-tighter italic">{t('hotels_page.form_title')}</h2>
                                <p className="text-slate-500 font-medium">{t('hotels_page.subtitle')}</p>
                            </div>
                            <div className="p-4 rounded-3xl bg-emerald-50 flex items-center justify-center">
                                <Hotel className="w-8 h-8 text-emerald-600" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Wilaya / Ville */}
                            <div className="space-y-3">
                                <Label htmlFor="wilaya" className="flex items-center gap-2 text-slate-700 font-bold ml-1">
                                    <MapPin className="w-4 h-4 text-emerald-600" /> {t('hotels_page.wilaya')}
                                </Label>
                                <Input
                                    id="wilaya"
                                    placeholder="Ex: Alger, Oran..."
                                    value={formData.wilaya}
                                    onChange={(e) => setFormData({ ...formData, wilaya: e.target.value })}
                                    required
                                    className="h-14 bg-white/50 border-slate-200 focus:bg-white focus:ring-emerald-500/20 focus:border-emerald-500 transition-all rounded-2xl md:text-lg"
                                />
                            </div>

                            {/* Lieu Exact */}
                            <div className="space-y-3">
                                <Label htmlFor="lieu_exact" className="flex items-center gap-2 text-slate-700 font-bold ml-1">
                                    <MapPin className="w-4 h-4 text-emerald-600" /> {t('hotels_page.lieu')}
                                </Label>
                                <Input
                                    id="lieu_exact"
                                    placeholder="Ex: Centre ville, Bord de mer..."
                                    value={formData.lieu_exact}
                                    onChange={(e) => setFormData({ ...formData, lieu_exact: e.target.value })}
                                    className="h-14 bg-white/50 border-slate-200 focus:bg-white focus:ring-emerald-500/20 focus:border-emerald-500 transition-all rounded-2xl md:text-lg"
                                />
                            </div>

                            {/* Dates */}
                            <div className="space-y-3">
                                <Label htmlFor="date_debut" className="flex items-center gap-2 text-slate-700 font-bold ml-1">
                                    <Calendar className="w-4 h-4 text-emerald-600" /> {t('hotels_page.arrival')}
                                </Label>
                                <Input
                                    id="date_debut"
                                    type="date"
                                    value={formData.date_debut}
                                    onChange={(e) => setFormData({ ...formData, date_debut: e.target.value })}
                                    required
                                    className="h-14 bg-white/50 border-slate-200 focus:bg-white focus:ring-emerald-500/20 focus:border-emerald-500 transition-all rounded-2xl md:text-lg block w-full"
                                />
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="date_fin" className="flex items-center gap-2 text-slate-700 font-bold ml-1">
                                    <Calendar className="w-4 h-4 text-emerald-600" /> {t('hotels_page.departure')}
                                </Label>
                                <Input
                                    id="date_fin"
                                    type="date"
                                    min={formData.date_debut}
                                    value={formData.date_fin}
                                    onChange={(e) => setFormData({ ...formData, date_fin: e.target.value })}
                                    required
                                    className="h-14 bg-white/50 border-slate-200 focus:bg-white focus:ring-emerald-500/20 focus:border-emerald-500 transition-all rounded-2xl md:text-lg block w-full"
                                />
                            </div>

                            {/* Nombre d'étoiles */}
                            <div className="space-y-3">
                                <Label htmlFor="nbre_etoile" className="flex items-center gap-2 text-slate-700 font-bold ml-1">
                                    <Star className="w-4 h-4 text-emerald-600" /> {t('hotels_page.standing')}
                                </Label>
                                <Select
                                    value={formData.nbre_etoile}
                                    onValueChange={(val) => setFormData({ ...formData, nbre_etoile: val })}
                                >
                                    <SelectTrigger className="h-14 bg-white/50 border-slate-200 focus:ring-emerald-500 rounded-2xl md:text-lg">
                                        <SelectValue placeholder="Choisir le nombre d'étoiles" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-slate-100 shadow-2xl">
                                        <SelectItem value="2" className="py-3 rounded-xl">2 Stars</SelectItem>
                                        <SelectItem value="3" className="py-3 rounded-xl">3 Stars</SelectItem>
                                        <SelectItem value="4" className="py-3 rounded-xl">4 Stars</SelectItem>
                                        <SelectItem value="5" className="py-3 rounded-xl">5 Stars (Luxe)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Durée Info */}
                            <div className="flex items-end pb-1 ml-1">
                                <div className="bg-emerald-50 text-emerald-700 px-6 py-4 rounded-2xl font-black italic text-sm border border-emerald-100 w-full text-center uppercase tracking-tighter">
                                    {calculateDays() > 0 ? t('hotels_page.duration', { count: calculateDays() }) : t('hotels_page.select_dates')}
                                </div>
                            </div>
                        </div>

                        {/* Passengers Section */}
                        <div className="space-y-6 pt-8 border-t border-slate-100">
                            <Label className="flex items-center gap-2 text-xl font-black text-slate-900 italic">
                                <Users className="w-6 h-6 text-emerald-600" /> {t('hotels_page.passengers')}
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
                                className="w-full h-20 text-xl font-black italic bg-emerald-600 hover:bg-emerald-700 shadow-2xl shadow-emerald-600/30 hover:scale-[1.02] transition-all rounded-[1.5rem] text-white group"
                                disabled={loading}
                            >
                                {loading ? <LoadingSpinner /> : (
                                    <span className="flex items-center gap-4 uppercase tracking-tighter">
                                        {t('hotels_page.submit')} <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
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
                        <BedDouble className="w-5 h-5 text-emerald-600" /> Best Prices
                    </div>
                    <div className="flex items-center gap-2 font-black text-slate-900 tracking-tighter italic uppercase">
                        <Star className="w-5 h-5 text-emerald-600" /> Premium Selection
                    </div>
                    <div className="flex items-center gap-2 font-black text-slate-900 tracking-tighter italic uppercase">
                        <MapPin className="w-5 h-5 text-emerald-600" /> Ideal Locations
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default HotelPage;
