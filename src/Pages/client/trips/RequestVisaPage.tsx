import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCustomTripRequest, type CustomVisaRequestPayload } from '../../../api';
import { toast } from 'react-toastify';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Calendar, Users, ArrowRight, FileText, MapPin } from '../../../components/icons';
import LoadingSpinner from '../../../components/Shared/LoadingSpinner';
import BackgroundAura from '../../../components/Shared/BackgroundAura';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';
import visaImg from '../../../assets/visa.webp';


const VisaPage = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        pays_destination: '',
        type_visa: 'touristique',
        date_depart: '',
        remarques: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload: CustomVisaRequestPayload = {
                category: 'visa' as const,
                details: {
                    pays_destination: formData.pays_destination,
                    type_visa: formData.type_visa,
                    date_depart: formData.date_depart,
                    remarques: formData.remarques
                }
            };

            await createCustomTripRequest(payload);
            toast.success(t('visa.success'));
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
                    style={{ backgroundImage: `url(${visaImg})` }}

                />

                <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1, duration: 0.2 }}
                    >
                        <span className={cn(
                            "inline-block px-4 py-1.5 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30 text-white text-[10px] font-black uppercase mb-6",
                            i18n.language === 'ar' ? "font-arabic tracking-normal" : ""
                        )}>
                            {t('visa.tag', 'Service Visa')}
                        </span>
                        <h1 className={cn(
                            "text-6xl md:text-8xl font-black text-white drop-shadow-2xl mb-4 leading-tight",
                            i18n.language === 'ar' ? "font-arabic tracking-normal" : "italic tracking-tighter"
                        )}>
                            {t('visa.title')}
                        </h1>
                        <p className={cn(
                            "text-xl md:text-2xl text-white/90 font-medium drop-shadow-lg max-w-2xl mx-auto",
                            i18n.language === 'ar' ? "font-arabic" : "italic"
                        )}>
                            {t('visa.subtitle')}
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
                                <h2 className={cn(
                                    "text-3xl font-black text-slate-900",
                                    i18n.language === 'ar' ? "font-arabic tracking-normal" : "tracking-tighter italic"
                                )}>
                                    {t('visa.form_title')}
                                </h2>
                                <p className={cn(
                                    "text-slate-500 font-medium",
                                    i18n.language === 'ar' && "font-arabic"
                                )}>
                                    {t('visa.form_subtitle')}
                                </p>
                            </div>
                            <div className="p-4 rounded-3xl bg-primary/10 flex items-center justify-center">
                                <FileText className="w-8 h-8 text-primary rtl:scale-x-[-1]" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Pays de destination */}
                            <div className="space-y-3 md:col-span-2">
                                <Label htmlFor="pays_destination" className="flex items-center gap-2 text-slate-700 font-bold rtl:mr-1 ltr:ml-1 rtl:flex-row-reverse rtl:justify-end">
                                    <MapPin className="w-4 h-4 text-primary" /> {t('visa.pays_destination')}
                                </Label>
                                <Input
                                    id="pays_destination"
                                    placeholder={t('visa.pays_destination_placeholder')}
                                    value={formData.pays_destination}
                                    onChange={(e) => setFormData({ ...formData, pays_destination: e.target.value })}
                                    required
                                    className="h-14 bg-white/50 border-slate-200 focus:bg-white focus:ring-primary/20 focus:border-primary transition-all rounded-2xl md:text-lg"
                                />
                            </div>

                            {/* Type de visa */}
                            <div className="space-y-3 md:col-span-2">
                                <Label className="flex items-center gap-2 text-slate-700 font-bold rtl:mr-1 ltr:ml-1 rtl:flex-row-reverse rtl:justify-end">
                                    <FileText className="w-4 h-4 text-primary" /> {t('visa.type_visa')}
                                </Label>
                                <Select
                                    value={formData.type_visa}
                                    onValueChange={(val) => setFormData({ ...formData, type_visa: val })}
                                >
                                    <SelectTrigger className="h-14 bg-white/50 border-slate-200 focus:ring-primary rounded-2xl md:text-lg">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-slate-100 shadow-2xl">
                                        <SelectItem value="touristique" className="py-3 rounded-xl">{t('visa.type_touristique')}</SelectItem>
                                        <SelectItem value="affaires" className="py-3 rounded-xl">{t('visa.type_affaires')}</SelectItem>
                                        <SelectItem value="familiale" className="py-3 rounded-xl">{t('visa.type_familiale')}</SelectItem>
                                        <SelectItem value="amical" className="py-3 rounded-xl">{t('visa.type_amical')}</SelectItem>
                                        <SelectItem value="traitement_medical" className="py-3 rounded-xl">{t('visa.type_traitement_medical')}</SelectItem>
                                        <SelectItem value="travail" className="py-3 rounded-xl">{t('visa.type_travail')}</SelectItem>
                                        <SelectItem value="etude" className="py-3 rounded-xl">{t('visa.type_etude')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-3 md:col-span-2">
                                <Label htmlFor="date_depart" className="flex items-center gap-2 text-slate-700 font-bold rtl:mr-1 ltr:ml-1 rtl:flex-row-reverse rtl:justify-end">
                                    <Calendar className="w-4 h-4 text-primary" /> {t('visa.date_depart')}
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


                        </div>

                        {/* Remarks */}
                        <div className="space-y-4">
                            <Label htmlFor="remarques" className="flex items-center gap-2 text-slate-700 font-bold rtl:mr-1 ltr:ml-1 rtl:flex-row-reverse rtl:justify-end">
                                {t('visa.remarques')}
                            </Label>
                            <Textarea
                                id="remarques"
                                placeholder={t('visa.remarques_placeholder')}
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
                                    <span className="flex items-center gap-4 rtl:flex-row-reverse">
                                        {t('visa.submit')}
                                        <ArrowRight className="w-6 h-6 group-hover:translate-x-2 rtl:group-hover:-translate-x-2 transition-transform rtl:rotate-180" />
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
                        <FileText className="w-5 h-5" /> ASSISTANCE VISA
                    </div>
                    <div className="flex items-center gap-2 font-black text-slate-900 tracking-tighter italic">
                        <Users className="w-5 h-5" /> SUPPORT 24/7
                    </div>
                    <div className="flex items-center gap-2 font-black text-slate-900 tracking-tighter italic">
                        <MapPin className="w-5 h-5" /> WORLDWIDE
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default VisaPage;
