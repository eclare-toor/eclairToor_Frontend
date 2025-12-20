import React, { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Plane, Calendar, Users, CheckCircle, ArrowRightLeft, ArrowRight, Luggage } from 'lucide-react';
import { cn } from '../../../lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";

type TripType = "ONE_WAY" | "ROUND_TRIP";
type FlightClass = "ECONOMY" | "BUSINESS" | "FIRST";

const FlightsPage = () => {
  const [tripType, setTripType] = useState<TripType>("ROUND_TRIP");
  const [formData, setFormData] = useState({
    departure_city: '',
    arrival_city: '',
    departure_date: '',
    return_date: '',
    flight_class: "ECONOMY" as FlightClass,
    passengers_adults: 1,
    passengers_children: 0,
    passengers_babies: 0,
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleNumberChange = (field: string, value: number) => {
    setFormData({
      ...formData,
      [field]: Math.max(0, value)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log("Flight Request:", { ...formData, trip_type: tripType });
    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex items-center justify-center bg-slate-50">
        <div className="bg-white p-12 rounded-3xl shadow-xl text-center max-w-lg mx-4">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Demande de Vol Reçue !</h2>
          <p className="text-slate-600 mb-8">
            Nous traitons votre demande. Vous recevrez nos meilleures offres de vol par email très prochainement.
          </p>
          <Button onClick={() => setSuccess(false)} variant="outline" className="w-full">
            Nouvelle recherche
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 relative">

      {/* Hero Section */}
      <div className="relative h-[40vh] bg-sky-900 overflow-hidden">
        <div className="absolute inset-0 bg-blue-500/10 mix-blend-overlay z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-50 to-transparent z-20" />
        <div
          className="absolute inset-0 opacity-80"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.3&auto=format&fit=crop&w=2074&q=80")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        <div className="relative z-30 container mx-auto px-4 h-full flex flex-col justify-center items-center text-center pt-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-sm font-medium mb-4 shadow-sm">
            <Plane className="w-4 h-4 transform -rotate-45" />
            <span>Vols Nationaux & Internationaux</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-slate-900 mb-4 drop-shadow-sm">
            Envolez-vous vers l'horizon
          </h1>
        </div>
      </div>

      {/* Form Section */}
      <div className="container mx-auto px-4 -mt-32 relative z-40 pb-20">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 max-w-5xl mx-auto">

          {/* Tabs */}
          <div className="flex border-b border-slate-100">
            <button
              onClick={() => setTripType("ROUND_TRIP")}
              className={cn(
                "flex-1 py-4 text-center font-bold text-sm uppercase tracking-wide transition-colors flex items-center justify-center gap-2",
                tripType === "ROUND_TRIP" ? "bg-primary/5 text-primary border-b-2 border-primary" : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              )}
            >
              <ArrowRightLeft className="w-4 h-4" /> Aller-Retour
            </button>
            <button
              onClick={() => setTripType("ONE_WAY")}
              className={cn(
                "flex-1 py-4 text-center font-bold text-sm uppercase tracking-wide transition-colors flex items-center justify-center gap-2",
                tripType === "ONE_WAY" ? "bg-primary/5 text-primary border-b-2 border-primary" : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              )}
            >
              <ArrowRight className="w-4 h-4" /> Aller Simple
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-8">

            {/* Route */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-slate-600">Départ de</Label>
                <div className="relative">
                  <Plane className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                  <Input
                    name="departure_city"
                    required
                    placeholder="Ville ou Aéroport"
                    className="pl-9 bg-slate-50 border-slate-200 h-12 text-lg font-medium"
                    value={formData.departure_city}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Visual connector for desktop */}
              <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white border border-slate-200 rounded-full items-center justify-center z-10 shadow-sm text-slate-400">
                <ArrowRight className="w-4 h-4" />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-slate-600">Arrivée à</Label>
                <div className="relative">
                  <Plane className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                  <Input
                    name="arrival_city"
                    required
                    placeholder="Ville ou Aéroport"
                    className="pl-9 bg-slate-50 border-slate-200 h-12 text-lg font-medium"
                    value={formData.arrival_city}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Dates & Class */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-slate-600">
                  <Calendar className="w-4 h-4 text-primary" /> Date départ
                </Label>
                <Input
                  type="date"
                  name="departure_date"
                  required
                  className="bg-white border-slate-200 h-11"
                  value={formData.departure_date}
                  onChange={handleChange}
                />
              </div>

              <div className={cn("space-y-2", tripType === "ONE_WAY" && "opacity-50 pointer-events-none grayscale")}>
                <Label className="flex items-center gap-2 text-slate-600">
                  <Calendar className="w-4 h-4 text-primary" /> Date retour
                </Label>
                <Input
                  type="date"
                  name="return_date"
                  required={tripType === "ROUND_TRIP"}
                  disabled={tripType === "ONE_WAY"}
                  className="bg-white border-slate-200 h-11"
                  value={formData.return_date}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-slate-600">
                  <Luggage className="w-4 h-4 text-primary" /> Classe
                </Label>
                <Select
                  value={formData.flight_class}
                  onValueChange={(val: FlightClass) => setFormData({ ...formData, flight_class: val })}
                >
                  <SelectTrigger className="h-11 border-slate-200 bg-white">
                    <SelectValue placeholder="Classe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ECONOMY">Economique</SelectItem>
                    <SelectItem value="BUSINESS">Affaires</SelectItem>
                    <SelectItem value="FIRST">Première</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Passengers */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-2 mb-6">
                <Users className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-slate-900">Passagers</h3>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs text-slate-500 uppercase font-bold">Adultes</Label>
                  <Input
                    type="number"
                    min="1"
                    className="bg-white text-center font-bold"
                    value={formData.passengers_adults}
                    onChange={(e) => handleNumberChange('passengers_adults', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-slate-500 uppercase font-bold">Enfants</Label>
                  <Input
                    type="number"
                    min="0"
                    className="bg-white text-center font-bold"
                    value={formData.passengers_children}
                    onChange={(e) => handleNumberChange('passengers_children', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-slate-500 uppercase font-bold">Bébés</Label>
                  <Input
                    type="number"
                    min="0"
                    className="bg-white text-center font-bold"
                    value={formData.passengers_babies}
                    onChange={(e) => handleNumberChange('passengers_babies', parseInt(e.target.value))}
                  />
                </div>
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full text-lg h-14 font-bold shadow-lg shadow-primary/20 hover:scale-[1.01] transition-all" disabled={loading}>
              {loading ? "Recherche en cours..." : "Rechercher un vol"}
            </Button>

          </form>
        </div>
      </div>
    </div>
  );
};

export default FlightsPage;