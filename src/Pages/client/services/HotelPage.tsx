import React, { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Hotel, MapPin, Calendar, Star, Users, CheckCircle, Search } from '../../../components/icons';
import { Slider } from "../../../components/ui/slider";

const HotelPage = () => {
  const [formData, setFormData] = useState({
    wilaya: '',
    exact_location: '',
    check_in_date: '',
    check_out_date: '',
    stars_preference: 4,
    rooms_count: 1,
    guests_adults: 2,
    guests_children: 0,
    guests_babies: 0,
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
    console.log("Hotel Request:", formData);
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
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Demande Envoyée !</h2>
          <p className="text-slate-600 mb-8">
            Votre demande de réservation d'hôtel a été bien reçue. Notre équipe vous contactera dans les plus brefs délais avec les meilleures propositions.
          </p>
          <Button onClick={() => setSuccess(false)} variant="outline" className="w-full">
            Faire une autre demande
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 relative">

      {/* Hero Section */}
      <div className="relative h-[40vh] bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-blue-900/20 mix-blend-overlay z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent z-20" />
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        <div className="relative z-30 container mx-auto px-4 h-full flex flex-col justify-center items-center text-center pt-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium mb-4">
            <Hotel className="w-4 h-4" />
            <span>Hébergement Premium</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-white mb-4">
            Trouvez l'Hôtel Parfait
          </h1>
          <p className="text-lg text-slate-200 max-w-2xl">
            Des hôtels de luxe aux séjours confortables, faites-nous part de vos besoins et nous trouverons l'offre idéale pour vous.
          </p>
        </div>
      </div>

      {/* Form Section */}
      <div className="container mx-auto px-4 -mt-20 relative z-40 pb-20">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 max-w-4xl mx-auto">
          <div className="h-2 bg-gradient-to-r from-primary to-blue-400" />

          <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-8">

            {/* Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-slate-600">
                  <MapPin className="w-4 h-4 text-primary" /> Destination (Wilaya)
                </Label>
                <Input
                  name="wilaya"
                  required
                  placeholder="Ex: Alger, Oran..."
                  className="bg-slate-50 border-slate-200 h-11"
                  value={formData.wilaya}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-slate-600">
                  <Search className="w-4 h-4 text-primary" /> Précision (Quartier/Ville)
                </Label>
                <Input
                  name="exact_location"
                  placeholder="Ex: Bab Ezzouar, Centre-ville..."
                  className="bg-slate-50 border-slate-200 h-11"
                  value={formData.exact_location}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-slate-600">
                  <Calendar className="w-4 h-4 text-primary" /> Date d'arrivée
                </Label>
                <Input
                  type="date"
                  name="check_in_date"
                  required
                  className="bg-white border-slate-200 h-11"
                  value={formData.check_in_date}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-slate-600">
                  <Calendar className="w-4 h-4 text-primary" /> Date de départ
                </Label>
                <Input
                  type="date"
                  name="check_out_date"
                  required
                  className="bg-white border-slate-200 h-11"
                  value={formData.check_out_date}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Preferences */}
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="flex items-center gap-2 text-slate-600">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" /> Standing souhaité
                  </Label>
                  <span className="text-sm font-bold bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">
                    {formData.stars_preference} Etoiles
                  </span>
                </div>
                <Slider
                  defaultValue={[4]}
                  max={5}
                  min={1}
                  step={1}
                  value={[formData.stars_preference]}
                  onValueChange={(val) => handleNumberChange('stars_preference', val[0])}
                  className="py-2"
                />
                <div className="flex justify-between text-xs text-slate-400 px-1">
                  <span>Economique</span>
                  <span>Standard</span>
                  <span>Confort</span>
                  <span>Supérieur</span>
                  <span>Luxe</span>
                </div>
              </div>
            </div>

            {/* Rooms & Guests */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-2 mb-6">
                <Users className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-slate-900">Occupants</h3>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs text-slate-500 uppercase font-bold">Chambres</Label>
                  <Input
                    type="number"
                    min="1"
                    className="bg-white text-center font-bold"
                    value={formData.rooms_count}
                    onChange={(e) => handleNumberChange('rooms_count', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-slate-500 uppercase font-bold">Adultes</Label>
                  <Input
                    type="number"
                    min="1"
                    className="bg-white text-center font-bold"
                    value={formData.guests_adults}
                    onChange={(e) => handleNumberChange('guests_adults', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-slate-500 uppercase font-bold">Enfants</Label>
                  <Input
                    type="number"
                    min="0"
                    className="bg-white text-center font-bold"
                    value={formData.guests_children}
                    onChange={(e) => handleNumberChange('guests_children', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-slate-500 uppercase font-bold">Bébés</Label>
                  <Input
                    type="number"
                    min="0"
                    className="bg-white text-center font-bold"
                    value={formData.guests_babies}
                    onChange={(e) => handleNumberChange('guests_babies', parseInt(e.target.value))}
                  />
                </div>
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full text-lg h-14 font-bold shadow-lg shadow-primary/20 hover:scale-[1.01] transition-all" disabled={loading}>
              {loading ? "Envoi en cours..." : "Envoyer ma demande"}
            </Button>

          </form>
        </div>
      </div>
    </div>
  );
};

export default HotelPage;