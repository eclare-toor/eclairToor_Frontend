import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getTrips } from '../../../api';
import type { Trip } from '../../../Types';
import TripCard from '../../../components/Shared/TripCard';
import LoadingSpinner from '../../../components/Shared/LoadingSpinner';
import BackgroundAura from '../../../components/Shared/BackgroundAura';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

const PromotionsPage = () => {
    const { t } = useTranslation();
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPromotions = async () => {
            try {
                const allTrips = await getTrips();
                const promotedTrips = allTrips.filter(trip => trip.promotion && trip.promotion > 0);
                setTrips(promotedTrips);
            } catch (error) {
                console.error('Error fetching promotions:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPromotions();
    }, []);

    return (
        <div className="min-h-screen bg-transparent relative overflow-hidden pt-48 md:pt-56 pb-20">
            <BackgroundAura />

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-4xl mx-auto text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-xs font-black uppercase tracking-widest mb-6 border border-emerald-100"
                    >
                        <Zap className="w-4 h-4 fill-emerald-600" />
                        {t('promotions.badge')}
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter mb-6"
                    >
                        {t('promotions.title')}
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-slate-500 font-medium max-w-2xl mx-auto"
                    >
                        {t('promotions.subtitle')}
                    </motion.p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <LoadingSpinner />
                    </div>
                ) : (
                    <>
                        {trips.length === 0 ? (
                            <div className="text-center py-20 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200 max-w-2xl mx-auto">
                                <p className="text-slate-500 font-bold">{t('promotions.no_promotions')}</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {trips.map((trip, idx) => (
                                    <motion.div
                                        key={trip.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: idx * 0.1 }}
                                    >
                                        <TripCard trip={trip} />
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default PromotionsPage;
