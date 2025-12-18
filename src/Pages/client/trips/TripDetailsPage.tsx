import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getTrip } from '../../../api';
import type { TripDetails } from '../../../api';
import LoadingSpinner from '../../../components/Shared/LoadingSpinner';
import { Button } from '../../../components/ui/button';
import { Calendar, MapPin, Clock, CheckCircle2, Hotel as HotelIcon, ArrowLeft, Share2, Heart, ExternalLink, ShieldCheck, Zap, Star } from 'lucide-react';
import { cn } from '../../../lib/utils';  

const TripDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [trip, setTrip] = useState<TripDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrip = async () => {
      if (!id) return;
      try {
        const data = await getTrip(id);
        if (!data) {
          setError('Trip not found');
        } else {
          setTrip(data);
        }
      } catch (err) {
        setError('Failed to load trip details');
      } finally {
        setLoading(false);
      }
    };

    fetchTrip();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex justify-center items-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen pt-24 flex flex-col justify-center items-center gap-4">
        <h2 className="text-2xl font-bold text-destructive">{error || 'Trip not found'}</h2>
        <Link to="/voyages">
          <Button variant="outline">Back to Trips</Button>
        </Link>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const durationDays = Math.ceil(
    (new Date(trip.end_date).getTime() - new Date(trip.start_date).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="min-h-screen bg-background pb-20 pt-20">
      {/* Navigation Bar for Details */}
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/voyages" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 font-medium">
          <ArrowLeft className="w-4 h-4" />
          Retour aux voyages
        </Link>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors">
            <Share2 className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-red-50 hover:text-red-500 transition-colors">
            <Heart className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Image Gallery with Smooth Scroll */}
      <div className="container mx-auto px-4 mb-12">
        <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar h-[50vh] md:h-[60vh] rounded-3xl  active:cursor-grabbing gap-4">
          {trip.images.map((img, idx) => (
            <div key={idx} className="min-w-full snap-center relative">
              <img
                src={img}
                alt={`${trip.title} ${idx + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-8 left-8 text-white">
                <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-sm font-medium border border-white/30 mb-2 inline-block">
                  {idx + 1} / {trip.images.length}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-12">

          {/* Header Info */}
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-4 text-primary font-medium">
              <span className="bg-primary/10 px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide uppercase">
                {trip.type === 'NATIONAL' ? 'Voyage National' : trip.type === 'INTERNATIONAL' ? 'Voyage International' : 'Omra'}
              </span>
              <span className="flex items-center gap-1.5 text-sm text-slate-600 font-semibold bg-slate-100 px-3 py-1.5 rounded-full">
                <Clock className="w-4 h-4" />
                {durationDays} Jours
              </span>
              <span className="flex items-center gap-1.5 text-sm text-slate-600 font-semibold bg-slate-100 px-3 py-1.5 rounded-full">
                <MapPin className="w-4 h-4" />
                {trip.personalized_fields}
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-heading font-bold text-slate-900 leading-tight">
              {trip.title}
            </h1>
          </div>

          {/* Description */}
          <div className="prose prose-lg max-w-none text-slate-600">
            <h3 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Zap className="w-6 h-6 text-yellow-500 fill-yellow-500" />
              À propos du voyage
            </h3>
            <p className="leading-relaxed">{trip.description}</p>
          </div>

          {/* Itinerary */}
          <div>
            <h3 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-primary" />
              Itinéraire détaillé
            </h3>
            <div className="space-y-8 border-l-2 border-primary/20 ml-3 pl-8 relative">
              {trip.itinerary.map((item, index) => (
                <div key={item.id} className="relative group">
                  <span className="absolute -left-[43px] top-0 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold ring-4 ring-background transition-transform group-hover:scale-110">
                    {item.day_number}
                  </span>
                  <h4 className="text-xl font-bold text-slate-800 mb-3">Jour {item.day_number}</h4>
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 hover:shadow-md transition-shadow">
                    <ul className="space-y-3">
                      {Array.isArray(item.activities) ? (
                        item.activities.map((activity, idx) => (
                          <li key={idx} className="flex items-start gap-3 text-slate-600">
                            <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                            <span className="font-medium">{activity}</span>
                          </li>
                        ))
                      ) : (
                        <li className="flex items-start gap-3 text-slate-600">
                          <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                          <span className="font-medium">{item.activities}</span>
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hotels */}
          {trip.hotels.length > 0 && (
            <div>
              <h3 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-2">
                <HotelIcon className="w-6 h-6 text-primary" />
                Hébergement
              </h3>
              <div className="grid grid-cols-1 gap-6">
                {trip.hotels.map((hotel) => (
                  <div key={hotel.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                    <div className="bg-blue-50 p-4 rounded-xl shrink-0">
                      <HotelIcon className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <h4 className="text-xl font-bold text-slate-900">{hotel.name}</h4>
                        <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-md border border-yellow-100">
                          {Array.from({ length: hotel.stars }).map((_, i) => (
                            <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-slate-500 flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {hotel.city} {hotel.address && `• ${hotel.address}`}
                      </p>
                    </div>
                    <a
                      href={hotel.maps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors text-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Voir sur la carte
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-8">

            {/* Booking Card */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 space-y-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-secondary" />

              <div className="space-y-2">
                <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider">Prix total par personne</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-slate-900">
                    {trip.base_price.toLocaleString('fr-DZ')}
                  </span>
                  <span className="text-lg font-semibold text-slate-500">DZD</span>
                </div>
                <div className="inline-flex items-center gap-1 text-green-600 text-sm font-medium bg-green-50 px-2 py-1 rounded-md">
                  <ShieldCheck className="w-4 h-4" />
                  Meilleur prix garanti
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-slate-100">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">Date de départ</span>
                  <span className="font-bold text-slate-900 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
                    {formatDate(trip.start_date)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">Date de retour</span>
                  <span className="font-bold text-slate-900 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
                    {formatDate(trip.end_date)}
                  </span>
                </div>
              </div>
              <Link to={`/voyages/${trip.id}/reservation`} state={{ trip }}>
                <Button className="w-full text-lg py-7 font-bold shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] transition-all duration-300 rounded-xl">
                  Réserver maintenant
                </Button>
              </Link>

              <div className="grid grid-cols-2 gap-4 text-xs text-slate-500 pt-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Confirmation immédiate</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Paiement sécurisé</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Support 24/7</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Annulation flexible</span>
                </div>
              </div>
            </div>

            {/* Equipment List */}
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
              <h4 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Équipement recommandé
              </h4>
              <div className="flex flex-wrap gap-2">
                {trip.equipment_list.map((item, idx) => (
                  <span key={idx} className="bg-slate-100 text-slate-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-200 transition-colors cursor-default">
                    {item}
                  </span>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default TripDetailsPage;