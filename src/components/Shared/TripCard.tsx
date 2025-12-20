import React from 'react';
import type { Trip } from '../../Types';
import { Calendar, MapPin, ArrowRight, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface TripCardProps {
    trip: Trip;
}

const TripCard: React.FC<TripCardProps> = ({ trip }) => {
    // Calculate duration
    const startDate = new Date(trip.start_date);
    const endDate = new Date(trip.end_date);
    const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    // Check if trip is new (created within last 7 days)
    const isNew = React.useMemo(() => {
        const createdDate = new Date(trip.created_at);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - createdDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7;
    }, [trip.created_at]);

    // Type Badge Colors
    const getTypeColor = (type: string) => {
        switch (type) {
            case 'NATIONAL': return 'bg-emerald-500/90 text-white';
            case 'INTERNATIONAL': return 'bg-blue-500/90 text-white';
            case 'OMRA': return 'bg-amber-500/90 text-white';
            default: return 'bg-gray-500/90 text-white';
        }
    };

    return (
        <motion.div
            whileHover={{ y: -8 }}
            className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/50 bg-card shadow-lg transition-all duration-300 hover:shadow-xl hover:shadow-primary/10"
        >
            {/* Image Section */}
            <div className="relative aspect-[4/3] overflow-hidden">
                <img
                    src={trip.images[0]}
                    alt={trip.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 transition-opacity group-hover:opacity-40" />

                {/* Badges Container */}
                <div className="absolute left-3 top-3 flex flex-col gap-2 z-10">
                    {/* Type Badge */}
                    <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md ${getTypeColor(trip.type)}`}>
                        {trip.type}
                    </span>
                </div>

                {/* New Badge */}
                {isNew && (
                    <div className="absolute right-3 top-3 z-10">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                        </span>
                        <span className="ml-2 rounded-full bg-primary/90 px-3 py-1 text-[10px] font-bold uppercase text-primary-foreground backdrop-blur-md shadow-sm">
                            New
                        </span>
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="flex flex-1 flex-col p-5">
                {/* Location */}
                <div className="mb-3 flex items-center text-xs font-semibold text-muted-foreground/80">
                    {(trip.type === 'NATIONAL' || trip.type === 'INTERNATIONAL') && (
                        <MapPin className="mr-1.5 h-3.5 w-3.5 text-primary" />
                    )}
                    <span className="uppercase tracking-wider">{trip.personalized_fields || trip.type}</span>
                </div>

                {/* Title */}
                <h3 className="mb-3 line-clamp-2 text-xl font-bold leading-tight text-foreground group-hover:text-primary transition-colors duration-300">
                    {trip.title}
                </h3>

                {/* Info Row */}
                <div className="mb-5 flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5  px-2.5 py-1 rounded-md">
                        <Clock className="h-4 w-4 text-primary" />
                        <span className="font-medium">{duration} Days</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span>{startDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                    </div>
                </div>

                {/* Bottom Section: Price & Action */}
                <div className="mt-auto flex items-end justify-between border-t border-border/50 pt-4">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-medium uppercase text-muted-foreground mb-0.5">Starting from</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-xl font-bold text-primary">
                                {trip.base_price.toLocaleString()}
                            </span>
                            <span className="text-xs font-semibold text-muted-foreground">DZD</span>
                        </div>
                    </div>

                    <Link
                        to={`/voyages/${trip.id}`}
                        className="group/btn flex items-center justify-center rounded-full bg-primary/10 p-3 text-primary transition-all duration-300 hover:bg-primary hover:text-primary-foreground"
                        aria-label="View details"
                    >
                        <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover/btn:-rotate-45" />
                    </Link>
                </div>
            </div>
        </motion.div>
    );
};

export default TripCard;
