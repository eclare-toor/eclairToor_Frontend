import React from 'react';
import type { Trip } from '../../Types';
import { Calendar, MapPin, ArrowRight, Clock, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface TripCardProps {
    trip: Trip;
}

const TripCard: React.FC<TripCardProps> = ({ trip }) => {
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

    const getTypeColor = (type: string) => {
        const lowerType = type.toLowerCase();
        switch (lowerType) {
            case 'national': return 'from-emerald-500 to-teal-600';
            case 'international': return 'from-blue-500 to-indigo-600';
            case 'religieuse': return 'from-amber-500 to-orange-600';
            case 'omra': return 'from-amber-500 to-orange-600';
            default: return 'from-slate-500 to-slate-700';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -12 }}
            className="group relative flex h-full flex-col overflow-hidden rounded-[2.5rem] bg-white/40 backdrop-blur-xl border border-white/40 shadow-2xl shadow-blue-900/5 transition-all duration-500"
        >
            {/* Image Container */}
            <div className="relative aspect-[16/10] overflow-hidden">
                <img
                    src={trip.images[0] ? (trip.images[0].startsWith('http') ? trip.images[0] : `http://localhost:3000/api${trip.images[0]}`) : 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80'}
                    alt={trip.title}
                    className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />

                {/* Image Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />

                {/* Price Tag Overlay */}
                <div className="absolute top-6 right-6 z-20">
                    <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl border border-white/50">
                        <p className="text-[10px] font-black uppercase text-slate-400 leading-none mb-1">À partir de</p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-xl font-black text-primary leading-none">
                                {trip.base_price.toLocaleString()}
                            </span>
                            <span className="text-[10px] font-bold text-slate-600">DZD</span>
                        </div>
                    </div>
                </div>

                {/* Badges */}
                <div className="absolute top-6 left-6 flex flex-col gap-2 z-20">
                    <span className={`bg-gradient-to-r ${getTypeColor(trip.type)} text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-black/10`}>
                        {trip.type}
                    </span>
                    {isNew && (
                        <span className="bg-white text-primary px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                            </span>
                            Nouveau
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
            <div className="flex flex-1 flex-col p-8 bg-gradient-to-b from-transparent to-white/20">
                <div className="flex items-center gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="w-3 h-3 fill-amber-400 text-amber-400" />
                    ))}
                    <span className="text-[10px] font-bold text-slate-400 ml-2 uppercase tracking-tighter">Éclat Garanti</span>
                </div>

                <h3 className="mb-4 text-2xl font-black leading-tight text-slate-900 group-hover:text-primary transition-colors duration-300 line-clamp-2">
                    {trip.title}
                </h3>

                <div className="flex items-center gap-6 mb-8">
                    <div className="flex items-center gap-2 text-slate-500 bg-slate-100/50 px-3 py-1.5 rounded-xl border border-white/50">
                        <Clock className="w-4 h-4 text-primary" />
                        <span className="text-sm font-bold">{duration} Jours</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">{startDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                    </div>
                </div>

                <Link
                    to={`/voyages/${trip.id}`}
                    className="mt-auto group/btn relative flex items-center justify-center gap-3 w-full bg-slate-900 text-white rounded-2xl py-4 font-black text-sm uppercase tracking-widest overflow-hidden transition-all duration-300 hover:bg-primary hover:shadow-2xl hover:shadow-primary/40 active:scale-95"
                >
                    <span className="relative z-10 flex items-center gap-2">
                        Découvrir <ArrowRight className="w-4 h-4 transition-transform duration-500 group-hover/btn:translate-x-1" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/10 to-primary/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000" />
                </Link>
            </div>
        </motion.div>
    );
};

export default TripCard;
