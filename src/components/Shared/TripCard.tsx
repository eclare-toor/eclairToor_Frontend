import React, { useEffect } from 'react';
import type { Trip } from '../../Types';
import { Calendar, MapPin, ArrowRight, Clock, Star } from '../icons';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';
import { API_URL } from '../../config/api';

interface TripCardProps {
    trip: Trip;
}

const TripCard: React.FC<TripCardProps> = ({ trip }) => {
    const { t, i18n } = useTranslation();
    const startDate = new Date(trip.start_date);
    const endDate = new Date(trip.end_date);
    const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    const isNew = React.useMemo(() => {
        const createdDate = new Date(trip.created_at);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - createdDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7;
    }, [trip.created_at]);

    useEffect(() => {
        console.log(trip.images[0]);
    }, [trip.images]);

    return (
        <div
            className="group relative flex h-full flex-col overflow-hidden rounded-[2rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/40 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10"
            dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
        >
            <Link to={`/voyages/${trip.id}`} className="flex flex-col h-full">
                {/* Image Container */}
                <div className="relative aspect-[16/10] overflow-hidden">
                    <img
                        src={trip.images[0] ? (`${API_URL}/api${trip.images[0]}`) : 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80'}
                        alt={trip.title}
                        className="h-full w-full object-cover transition-transform duration-1000"
                    />

                    {/* Image Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />

                    {/* Price Tag Overlay */}
                    <div className={cn("absolute top-6 z-20", i18n.language === 'ar' ? "left-6" : "right-6")}>
                        <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl border border-white/50">
                            <p className="text-[10px] font-black uppercase text-slate-400 leading-none mb-1">{t('trips.card.from')}</p>
                            <div className="flex flex-col items-end">
                                {Number(trip.promotion) > 0 ? (
                                    <>
                                        <span className="text-[10px] font-bold text-slate-400 line-through decoration-red-400/50">
                                            {trip.base_price.toLocaleString()} DZD
                                        </span>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-2xl font-black text-emerald-600 leading-none">
                                                {(trip.base_price * (1 - Number(trip.promotion) / 100)).toLocaleString()}
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-600">DZD</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-xl font-black text-primary leading-none">
                                            {trip.base_price.toLocaleString()}
                                        </span>
                                        <span className="text-[10px] font-bold text-slate-600">DZD</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Badges */}
                    <div className={cn("absolute top-6 flex flex-col gap-2 z-20", i18n.language === 'ar' ? "right-6" : "left-6")}>
                        {Number(trip.promotion) > 0 && (
                            <div
                                className="bg-emerald-500 text-white px-4 py-2 rounded-2xl text-sm font-black shadow-xl border border-emerald-400 flex flex-col items-center justify-center min-w-[60px] animate-in fade-in zoom-in-75 duration-300"
                            >
                                <span className="text-[10px] uppercase tracking-tighter opacity-80 leading-none mb-1">PROMO</span>
                                <span className="text-lg leading-none">-{trip.promotion}%</span>
                            </div>
                        )}
                        {isNew && (
                            <span className="bg-white text-primary px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                                </span>
                                {t('trips.card.new')}
                            </span>
                        )}
                    </div>

                    {/* Location at bottom of image */}
                    <div className="absolute bottom-6 left-6 right-6 z-20 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-white/90">
                            <div className="p-2 bg-white/20 backdrop-blur-md rounded-lg">
                                <MapPin className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-bold tracking-wide uppercase">
                                {trip.destination_wilaya || trip.destination_country || trip.omra_category || trip.type}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="flex flex-1 flex-col p-6 pt-6">
                    <div className="flex items-center gap-1 mb-4">
                        {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className="w-3 h-3 fill-amber-400 text-amber-400" />
                        ))}
                        <span className={cn(
                            "text-[10px] font-bold text-slate-400 uppercase tracking-tighter",
                            i18n.language === 'ar' ? "mr-2" : "ml-2"
                        )}>{t('trips.card.guarantee')}</span>
                    </div>

                    <h3 className="mb-4 text-2xl font-black leading-tight text-slate-900 group-hover:text-primary transition-colors duration-300 line-clamp-2 text-start">
                        {trip.title}
                    </h3>

                    <div className="flex items-center gap-6 mb-8">
                        <div className="flex items-center gap-2 text-slate-500 bg-slate-100/50 px-3 py-1.5 rounded-xl border border-white/50">
                            <Clock className="w-4 h-4 text-primary" />
                            <span className="text-sm font-bold">{duration} {t('trips.card.days')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500">
                            <Calendar className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium">{startDate.toLocaleDateString(i18n.language, { day: 'numeric', month: 'short' })}</span>
                        </div>
                    </div>

                    <div
                        className="mt-auto group/btn relative flex items-center justify-center gap-3 w-full bg-slate-900 text-white rounded-2xl py-4 font-black text-sm uppercase tracking-widest overflow-hidden transition-all duration-300 group-hover:bg-primary group-hover:shadow-lg group-hover:shadow-primary/30"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            {t('trips.card.discover')} <ArrowRight className={cn("w-4 h-4 transition-transform duration-300", i18n.language === 'ar' ? "rotate-180 group-hover:-translate-x-1" : "group-hover:translate-x-1")} />
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/10 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    </div>
                </div>
            </Link>
        </div>
    );
};

export default TripCard;
