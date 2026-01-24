import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCustomTripRequest } from '../../../api';
import { toast } from 'react-toastify';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Calendar, Users, ArrowRight, Car, Briefcase, PlaneLanding, MapPin } from 'lucide-react';
import LoadingSpinner from '../../../components/Shared/LoadingSpinner';
import BackgroundAura from '../../../components/Shared/BackgroundAura';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const TransportPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        date_depart: '',
        aeroport: '',
        hotel: '',
        nbre_person: 1,
        bagages: 'non',
        remarques: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                category: 'transport' as const,
                details: {
                    date_depart: formData.date_depart,
                    aeroport: formData.aeroport,
                    hotel: formData.hotel,
                    nbre_person: formData.nbre_person,
                    bagages: formData.bagages,
                    remarques: formData.remarques
                }
            };

            await createCustomTripRequest(payload);
            toast.success(t('transport.success'));
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

            {/* Hero Section with Premium Image */}
            <div className="relative h-[80vh] min-h-[700px] w-full flex items-center justify-center overflow-hidden mb-[-120px] pt-48 md:pt-56">
                <motion.div
                    initial={{ scale: 1.05, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: 'url("src/assets/cars.jpeg")' }}
                />

                <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1, duration: 0.2 }}
                    >
                        <span className="inline-block px-4 py-1.5 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30 text-white text-[10px] font-black uppercase tracking-[0.3em] mb-6">
                            Service Premium
                        </span>
                        <h1 className="text-6xl md:text-8xl font-black text-white italic tracking-tighter drop-shadow-2xl mb-4 leading-tight">
                            {t('transport.title')}
                        </h1>
                        <p className="text-xl md:text-2xl text-white/90 font-medium italic drop-shadow-lg max-w-2xl mx-auto">
                            {t('transport.subtitle')}
                        </p>
                    </motion.div>
                </div>
            </div>

            <div className="container mx-auto max-w-4xl relative z-20 px-4">
                <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.2 }}
                    className="bg-white/80 backdrop-blur-3xl rounded-[3rem] shadow-2xl shadow-blue-900/20 border border-white/50 overflow-hidden"
                >
                    <div className="h-2 bg-gradient-to-r from-primary to-blue-600"></div>

                    <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-10">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-8">
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 tracking-tighter italic">{t('transport.form_title')}</h2>
                                <p className="text-slate-500 font-medium">{t('transport.subtitle')}</p>
                            </div>
                            <div className="p-4 rounded-3xl bg-primary/10 flex items-center justify-center">
                                <Car className="w-8 h-8 text-primary" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Transfer Date */}
                            <div className="space-y-3">
                                <Label htmlFor="date_depart" className="flex items-center gap-2 text-slate-700 font-bold ml-1">
                                    <Calendar className="w-4 h-4 text-primary" /> {t('transport.date_depart')}
                                </Label>
                                <Input
                                    id="date_depart"
                                    type="date"
                                    value={formData.date_depart}
                                    onChange={(e) => setFormData({ ...formData, date_depart: e.target.value })}
                                    required
                                    className="h-14 bg-white/50 border-slate-200 focus:bg-white focus:ring-primary/20 focus:border-primary transition-all rounded-2xl md:text-lg"
                                />
                            </div>

                            {/* Airport */}
                            <div className="space-y-3">
                                <Label htmlFor="aeroport" className="flex items-center gap-2 text-slate-700 font-bold ml-1">
                                    <PlaneLanding className="w-4 h-4 text-primary" /> {t('transport.aeroport')}
                                </Label>
                                <Input
                                    id="aeroport"
                                    placeholder="Ex: Aéroport Alger (ALG)"
                                    value={formData.aeroport}
                                    onChange={(e) => setFormData({ ...formData, aeroport: e.target.value })}
                                    required
                                    className="h-14 bg-white/50 border-slate-200 focus:bg-white focus:ring-primary/20 focus:border-primary transition-all rounded-2xl md:text-lg"
                                />
                            </div>

                            {/* Destination */}
                            <div className="space-y-3">
                                <Label htmlFor="hotel" className="flex items-center gap-2 text-slate-700 font-bold ml-1">
                                    <MapPin className="w-4 h-4 text-primary" /> {t('transport.hotel')}
                                </Label>
                                <Input
                                    id="hotel"
                                    placeholder="Ex: Hotel El Djazair"
                                    value={formData.hotel}
                                    onChange={(e) => setFormData({ ...formData, hotel: e.target.value })}
                                    required
                                    className="h-14 bg-white/50 border-slate-200 focus:bg-white focus:ring-primary/20 focus:border-primary transition-all rounded-2xl md:text-lg"
                                />
                            </div>

                            {/* Number of Persons */}
                            <div className="space-y-3">
                                <Label htmlFor="nbre_person" className="flex items-center gap-2 text-slate-700 font-bold ml-1">
                                    <Users className="w-4 h-4 text-primary" /> {t('transport.nbre_person')}
                                </Label>
                                <Input
                                    id="nbre_person"
                                    type="number"
                                    min="1"
                                    value={formData.nbre_person}
                                    onChange={(e) => setFormData({ ...formData, nbre_person: parseInt(e.target.value) || 1 })}
                                    required
                                    className="h-14 bg-white/50 border-slate-200 focus:bg-white focus:ring-primary/20 focus:border-primary transition-all rounded-2xl md:text-lg"
                                />
                            </div>
                        </div>

                        {/* Luggage Section */}
                        <div className="space-y-4 pt-6 border-t border-slate-100">
                            <Label className="flex items-center gap-2 text-slate-700 font-bold ml-1">
                                <Briefcase className="w-5 h-5 text-primary" /> {t('transport.bagages')}
                            </Label>
                            <Select
                                value={formData.bagages}
                                onValueChange={(val) => setFormData({ ...formData, bagages: val })}
                            >
                                <SelectTrigger className="h-14 bg-white/50 border-slate-200 focus:ring-primary rounded-2xl md:text-lg">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-slate-100 shadow-2xl">
                                    <SelectItem value="oui" className="py-3 rounded-xl">{t('transport.bagages_yes')}</SelectItem>
                                    <SelectItem value="non" className="py-3 rounded-xl">{t('transport.bagages_no')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Remarks */}
                        <div className="space-y-4">
                            <Label htmlFor="remarques" className="flex items-center gap-2 text-slate-700 font-bold ml-1">
                                {t('transport.remarques')}
                            </Label>
                            <Textarea
                                id="remarques"
                                placeholder="Notez ici votre numéro de vol ou toute autre indication..."
                                value={formData.remarques}
                                onChange={(e) => setFormData({ ...formData, remarques: e.target.value })}
                                className="min-h-[120px] bg-white/50 border-slate-200 focus:bg-white focus:ring-primary/20 focus:border-primary transition-all rounded-3xl md:text-lg p-6"
                            />
                        </div>

                        <div className="pt-6">
                            <Button
                                type="submit"
                                className="w-full h-20 text-xl font-black italic bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/30 hover:scale-[1.02] transition-all rounded-[1.5rem] group"
                                disabled={loading}
                            >
                                {loading ? <LoadingSpinner /> : (
                                    <span className="flex items-center gap-4">
                                        {t('transport.submit')}
                                        <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
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
                    <div className="flex items-center gap-2 font-black text-slate-900 tracking-tighter italic">
                        <Car className="w-5 h-5" /> EXCLUSIVE FLEET
                    </div>
                    <div className="flex items-center gap-2 font-black text-slate-900 tracking-tighter italic">
                        <Users className="w-5 h-5" /> 24/7 SUPPORT
                    </div>
                    <div className="flex items-center gap-2 font-black text-slate-900 tracking-tighter italic">
                        <Briefcase className="w-5 h-5" /> ALL-INCLUSIVE
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default TransportPage;
