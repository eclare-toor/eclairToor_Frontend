import { useEffect, useState, useMemo } from 'react';
import { getTrips } from '../../../api';
import TripCard from '../../../components/Shared/TripCard';
import type { Trip } from '../../../Types';
import LoadingSpinner from '../../../components/Shared/LoadingSpinner';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Search, MapPin, Calendar, Filter } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { Slider } from "../../../components/ui/slider";
import { useNavigate } from 'react-router-dom';

type TripCategory = 'NATIONAL' | 'INTERNATIONAL' | 'OMRA';

const TripsListPage = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<TripCategory | 'ALL'>('NATIONAL');

  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);

  // Filters
  const [destinationFilter, setDestinationFilter] = useState('');
  const [maxDuration, setMaxDuration] = useState(30);

  const categories: { id: TripCategory, label: string }[] = [
    { id: 'NATIONAL', label: 'Voyages Nationaux' },
    { id: 'INTERNATIONAL', label: 'Voyages Internationaux' },
    { id: 'OMRA', label: 'Omra' },
  ];

  useEffect(() => {
    const fetchTrips = async () => {
      setLoading(true);
      try {
        const data = await getTrips();
        setTrips(data);
      } catch (err) {
        setError('Failed to load trips. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, []);

  const categoryTrips = useMemo(() => {
    const lowerCategory = selectedCategory.toLowerCase();
    if (lowerCategory === 'omra') {
      return trips.filter(trip => trip.type === 'religieuse');
    }
    return trips.filter(trip => trip.type === lowerCategory);
  }, [trips, selectedCategory]);

  const filteredTrips = useMemo(() => {
    return categoryTrips.filter(trip => {
      // Filter by Destination - check title or specific destination fields
      const searchLower = destinationFilter.toLowerCase();
      const matchDestination = destinationFilter === '' ||
        trip.title.toLowerCase().includes(searchLower) ||
        (trip.destination_wilaya?.toLowerCase().includes(searchLower) ?? false) ||
        (trip.destination_country?.toLowerCase().includes(searchLower) ?? false) ||
        (trip.omra_category?.toLowerCase().includes(searchLower) ?? false);

      // Filter by Duration
      const duration = Math.ceil((new Date(trip.end_date).getTime() - new Date(trip.start_date).getTime()) / (1000 * 60 * 60 * 24));
      const matchDuration = duration <= maxDuration;

      return matchDestination && matchDuration;
    });
  }, [categoryTrips, destinationFilter, maxDuration]);

  return (
    <div className="pt-40 min-h-screen bg-transparent pb-20">
      <div className="container mx-auto px-4 space-y-8">

        {/* Header & Title */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em]"
          >
            <Star className="w-3 h-3 fill-primary" /> Nos Meilleurs Voyages
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-[0.9]">
            Explorez votre <br /><span className="text-primary italic">prochaine aventure</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
            De l'Algérie profonde aux capitales mondiales, vivez des moments d'exception avec nos itinéraires soigneusement sélectionnés.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "relative px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-500 border overflow-hidden",
                selectedCategory === cat.id
                  ? "text-primary-foreground border-transparent scale-105"
                  : "bg-white/40 backdrop-blur-md text-slate-800 border-white/50 hover:bg-white/60"
              )}
            >
              {cat.label}
              {selectedCategory === cat.id && (
                <motion.div
                  layoutId="active-cat"
                  className="absolute inset-0 bg-primary rounded-full -z-10 shadow-xl shadow-primary/25"
                />
              )}
            </button>
          ))}
        </div>

        {/* Filters Bar */}
        <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-blue-900/5 border border-white/40 p-4 md:p-8 mb-12 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">

            {/* Destination Search */}
            <div className="md:col-span-5 space-y-2">
              <Label htmlFor="destination" className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Destination
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="destination"
                  placeholder="Rechercher une destination..."
                  className="pl-9 bg-white/50 border-white/40 focus:bg-white/80 transition-colors rounded-xl h-12"
                  value={destinationFilter}
                  onChange={(e) => setDestinationFilter(e.target.value)}
                />
              </div>
            </div>

            {/* Duration Slider */}
            <div className="md:col-span-5 space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Durée Max
                </Label>
                <span className="text-sm font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                  {maxDuration} Jours
                </span>
              </div>
              <Slider
                defaultValue={[30]}
                max={60}
                min={1}
                step={1}
                value={[maxDuration]}
                onValueChange={(val) => setMaxDuration(val[0])}
                className="py-2"
              />
            </div>

            {/* Results Count (Visual only) */}
            <div className="md:col-span-2 flex justify-end">
              <div className="text-right">
                <span className="block text-2xl font-bold text-slate-900 leading-none">{filteredTrips.length}</span>
                <span className="text-xs text-slate-500 font-medium">Voyages trouvés</span>
              </div>
            </div>

          </div>
        </div>

        {/* Custom Trip CTA - Dynamic based on Category */}
        <div className="bg-gradient-to-r from-primary/10 to-blue-500/10 border border-primary/20 p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              {selectedCategory === 'OMRA' ? 'Votre Omra sur mesure' : 'Vous ne trouvez pas votre bonheur ?'}
            </h3>
            <p className="text-slate-600 max-w-xl">
              {selectedCategory === 'OMRA'
                ? 'Personnalisez votre pèlerinage selon vos besoins et votre budget. Nous nous occupons de tout.'
                : 'Créez votre voyage de rêve sur mesure ! Choisissez votre destination, vos dates et vos préférences, et nous vous proposerons un devis personnalisé.'}
            </p>
          </div>

          <div className="relative z-10 shrink-0">
            {selectedCategory === 'OMRA' ? (
              <Button
                className="bg-primary hover:bg-primary/90 text-white px-8 h-12 rounded-xl shadow-lg shadow-primary/25 transition-transform hover:scale-105 uppercase font-bold tracking-wide"
                onClick={() => navigate('/voyages/CustomOmraTripPage')}
              >
                Personnaliser ma Omra
              </Button>
            ) : (
              <Button
                className="bg-primary hover:bg-primary/90 text-white px-8 h-12 rounded-xl shadow-lg shadow-primary/25 transition-transform hover:scale-105 uppercase font-bold tracking-wide"
                onClick={() => navigate('/voyages/CustomTripPage', { state: { type: selectedCategory === 'NATIONAL' ? 'national' : 'international' } })}
              >
                Créer un voyage {selectedCategory === 'NATIONAL' ? 'National' : 'International'}
              </Button>
            )}
          </div>
        </div>

        {/* Results Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner />
          </div>
        ) : filteredTrips.length > 0 ? (
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-3">
            {filteredTrips.map((trip, index) => (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <TripCard trip={trip} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
            <div className="inline-flex bg-slate-50 p-4 rounded-full mb-4">
              <Filter className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Aucun voyage trouvé</h3>
            <p className="text-slate-500">Essayez de modifier vos filtres de recherche.</p>
            <Button
              variant="ghost"
              className="mt-4 text-primary"
              onClick={() => {
                setDestinationFilter('');
                setMaxDuration(30);
              }}
            >
              Réinitialiser les filtres
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TripsListPage;