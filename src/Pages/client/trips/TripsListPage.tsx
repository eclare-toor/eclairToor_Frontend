import { useEffect, useState, useMemo } from 'react';
import { getTrips } from '../../../api';
import TripCard from '../../../components/Shared/TripCard';
import type { Trip } from '../../../Types';
import LoadingSpinner from '../../../components/Shared/LoadingSpinner';

import { Star } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Search, MapPin, Filter, Zap, Plane } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { Slider } from "../../../components/ui/slider";
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";

type TripCategory = 'NATIONAL' | 'INTERNATIONAL' | 'OMRA';

import { useTranslation } from 'react-i18next';

const TripsListPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<TripCategory | 'ALL'>('ALL');

  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);

  // Filters
  const [destinationFilter, setDestinationFilter] = useState('');
  const [maxDuration, setMaxDuration] = useState(30);

  const categories: { id: TripCategory | 'ALL', label: string, icon: any }[] = [
    { id: 'ALL', label: t('trips.categories.all'), icon: Filter },
    { id: 'NATIONAL', label: t('trips.categories.national'), icon: MapPin },
    { id: 'INTERNATIONAL', label: t('trips.categories.international'), icon: MapPin },
    { id: 'OMRA', label: t('trips.categories.omra'), icon: Star },
  ];

  useEffect(() => {
    const fetchTrips = async () => {
      setLoading(true);
      try {
        const data = await getTrips();
        setTrips(data);
      } catch (err: any) {
        const backendMessage = err.response?.data?.error || err.message;
        setError(backendMessage || 'Failed to load trips. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, []);

  const categoryTrips = useMemo(() => {
    if (selectedCategory === 'ALL') return trips;
    const lowerCategory = selectedCategory.toLowerCase();
    if (lowerCategory === 'omra') {
      return trips.filter(trip => trip.type === 'religieuse');
    }
    return trips.filter(trip => trip.type === lowerCategory);
  }, [trips, selectedCategory]);

  const filteredTrips = useMemo(() => {
    return categoryTrips.filter(trip => {
      const searchLower = destinationFilter.toLowerCase();
      const matchDestination = destinationFilter === '' ||
        trip.title.toLowerCase().includes(searchLower) ||
        (trip.destination_wilaya?.toLowerCase().includes(searchLower) ?? false) ||
        (trip.destination_country?.toLowerCase().includes(searchLower) ?? false) ||
        (trip.omra_category?.toLowerCase().includes(searchLower) ?? false);

      const duration = Math.ceil((new Date(trip.end_date).getTime() - new Date(trip.start_date).getTime()) / (1000 * 60 * 60 * 24));
      const matchDuration = duration <= maxDuration;

      return matchDestination && matchDuration;
    });
  }, [categoryTrips, destinationFilter, maxDuration]);

  return (
    <div className="pt-32 min-h-screen bg-[#f8fafc] pb-20 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-primary/5 to-transparent -z-10" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10 animate-pulse" />
      <div className="absolute top-1/2 -left-24 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl -z-10" />

      <div className="container mx-auto px-4 max-w-[1600px]">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-2">
              Nos <span className="text-primary italic">Voyages</span>
            </h1>
            <p className="text-slate-500 font-medium text-lg">Découvrez le monde avec élégance.</p>
          </div>

          {/* Voyage à la carte button */}
          <div className="shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="h-14 px-8 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest shadow-2xl shadow-slate-900/20 group transition-all hover:scale-[1.02]">
                  <Zap className="w-5 h-5 mr-3 text-primary animate-pulse" />
                  {t('trips.custom_trip.button')}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72 p-2 rounded-[1.5rem] border-slate-200/50 shadow-2xl bg-white/95 backdrop-blur-xl">
                <DropdownMenuLabel className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('trips.custom_trip.label')}</DropdownMenuLabel>
                <DropdownMenuSeparator className="mx-2" />
                <DropdownMenuItem onClick={() => navigate('/voyages/CustomTripPage', { state: { type: 'national' } })} className="rounded-xl px-4 py-3 cursor-pointer group hover:bg-primary/5">
                  <MapPin className="mr-3 h-5 w-5 text-slate-400 group-hover:text-primary" />
                  <span className="font-bold">{t('trips.custom_trip.options.national')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/voyages/CustomTripPage', { state: { type: 'international' } })} className="rounded-xl px-4 py-3 cursor-pointer group hover:bg-primary/5">
                  <Plane className="mr-3 h-5 w-5 text-slate-400 group-hover:text-primary" />
                  <span className="font-bold">{t('trips.custom_trip.options.international')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/voyages/CustomOmraTripPage')} className="rounded-xl px-4 py-3 cursor-pointer group hover:bg-primary/5">
                  <Star className="mr-3 h-5 w-5 text-slate-400 group-hover:text-primary" />
                  <span className="font-bold">{t('trips.custom_trip.options.omra')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-80 shrink-0 space-y-8 sticky top-32">
            <div className="bg-white/80 backdrop-blur-xl border border-white/60 p-6 rounded-[2rem] shadow-xl shadow-slate-200/40">
              <div className="flex items-center gap-2 mb-6 text-slate-900">
                <Filter className="w-5 h-5 text-primary" />
                <span className="font-black uppercase tracking-widest text-sm">Filtres</span>
              </div>

              {/* Search */}
              <div className="mb-8">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">Recherche</label>
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <Input
                    placeholder="Destination..."
                    className="pl-10 h-12 bg-slate-50 border-slate-100 focus:bg-white focus:border-primary/20 rounded-xl font-bold text-sm transition-all shadow-sm"
                    value={destinationFilter}
                    onChange={(e) => setDestinationFilter(e.target.value)}
                  />
                </div>
              </div>

              {/* Duration Slider */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Durée Max</label>
                  <span className="text-sm font-black text-primary bg-primary/10 px-2 py-0.5 rounded-md">{maxDuration} Jours</span>
                </div>
                <Slider
                  defaultValue={[30]}
                  max={60}
                  min={1}
                  step={1}
                  value={[maxDuration]}
                  onValueChange={(val) => setMaxDuration(val[0])}
                  className="w-full"
                />
              </div>

              {/* Categories */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">Catégories</label>
                <div className="flex flex-col gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={cn(
                        "relative w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-between group overflow-hidden",
                        selectedCategory === cat.id
                          ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20"
                          : "bg-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                      )}
                    >
                      <div className="flex items-center gap-3 relative z-10">
                        <cat.icon className={cn("w-4 h-4", selectedCategory === cat.id ? "text-primary" : "text-slate-400 group-hover:text-primary/50")} />
                        <span>{cat.label}</span>
                      </div>
                      {selectedCategory === cat.id && <div className="w-1.5 h-1.5 rounded-full bg-primary relative z-10" />}
                      {/* Small hover effect */}
                      {selectedCategory !== cat.id && (
                        <div className="absolute inset-0 bg-slate-50 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300 z-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary to-blue-600 p-6 rounded-[2rem] text-white shadow-xl shadow-primary/20 relative overflow-hidden group hidden lg:block">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 transition-transform duration-700 group-hover:scale-150" />
              <h3 className="font-black text-xl mb-2 relative z-10">Besoin d'aide ?</h3>
              <p className="text-white/80 text-sm mb-6 relative z-10 font-medium leading-relaxed">Nos conseillers sont là pour organiser votre voyage de rêve.</p>
              <Button variant="secondary" className="w-full bg-white text-primary hover:bg-blue-50 font-bold rounded-xl shadow-lg border-none" onClick={() => navigate('/contact')}>
                Contactez-nous
              </Button>
            </div>
          </aside>

          {/* Main Content - Grid */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-6">
              <p className="text-slate-500 font-medium text-sm">
                Affichage de <span className="text-slate-900 font-bold">{filteredTrips.length}</span> voyages
              </p>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-40 gap-4">
                <LoadingSpinner />
                <p className="text-slate-400 font-black text-xs uppercase tracking-widest animate-pulse">{t('trips.loading')}</p>
              </div>
            ) : filteredTrips.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredTrips.map((trip) => (
                  <div
                    key={trip.id}
                    className="w-full h-full"
                  >
                    <TripCard trip={trip} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                  <Search className="w-10 h-10 text-slate-200" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight italic">{t('trips.empty.title')}</h3>
                <p className="text-slate-500 font-medium mb-8">{t('trips.empty.desc')}</p>
                <Button
                  variant="outline"
                  className="rounded-full px-8 h-12 border-slate-200 font-bold hover:bg-slate-50 transition-all text-slate-600"
                  onClick={() => {
                    setDestinationFilter('');
                    setMaxDuration(30);
                    setSelectedCategory('ALL');
                  }}
                >
                  {t('trips.empty.reset')}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripsListPage;