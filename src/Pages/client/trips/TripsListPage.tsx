import React, { useEffect, useState, useMemo } from 'react';
import { getTripsByType } from '../../../api';
import TripCard from '../../../components/Shared/TripCard';
import type { Trip } from '../../../Types';
import LoadingSpinner from '../../../components/Shared/LoadingSpinner';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Search, MapPin, Calendar, Filter } from 'lucide-react';
import { cn } from '../../../lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Slider } from "../../../components/ui/slider";

type TripCategory = 'NATIONAL' | 'INTERNATIONAL' | 'OMRA';

const TripsListPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<TripCategory | 'ALL'>('NATIONAL'); // Default to NATIONAL as per request implies defaulting to one, or maybe ALL. Let's start with NATIONAL as "3 button national intenation and omra"
  // Actually typically tabs default to first one.

  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        const data = await getTripsByType(selectedCategory);
        setTrips(data);
      } catch (err) {
        setError('Failed to load trips. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, [selectedCategory]);

  const filteredTrips = useMemo(() => {
    return trips.filter(trip => {
      // Filter by Destination (personalized_fields)
      const matchDestination = destinationFilter === '' ||
        (trip.personalized_fields?.toLowerCase().includes(destinationFilter.toLowerCase()) ?? false) ||
        trip.title.toLowerCase().includes(destinationFilter.toLowerCase());

      // Filter by Duration
      const duration = Math.ceil((new Date(trip.end_date).getTime() - new Date(trip.start_date).getTime()) / (1000 * 60 * 60 * 24));
      const matchDuration = duration <= maxDuration;

      return matchDestination && matchDuration;
    });
  }, [trips, destinationFilter, maxDuration]);

  return (
    <div className="pt-24 min-h-screen bg-slate-50/50 pb-20">
      <div className="container mx-auto px-4 space-y-8">

        {/* Header & Title */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h1 className="text-4xl font-heading font-bold text-slate-900 mb-3">
            Explorez le Monde
          </h1>
          <p className="text-slate-500">
            Découvrez nos meilleures destinations sélectionnées pour vous.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 border",
                selectedCategory === cat.id
                  ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25 scale-105"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Filters Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 md:p-6 mb-8 max-w-5xl mx-auto">
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
                  className="pl-9 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
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

        {/* Results Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner />
          </div>
        ) : filteredTrips.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredTrips.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
              />
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