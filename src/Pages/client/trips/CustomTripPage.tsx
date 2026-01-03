import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createCustomTripRequest } from '../../../api';
import type { CustomTripRequestPayload } from '../../../api';
import { toast } from 'react-toastify';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Calendar, MapPin, Clock, Hotel, Plane, Coffee, ArrowRight } from 'lucide-react';
import LoadingSpinner from '../../../components/Shared/LoadingSpinner';

const CustomTripPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Default type from location state or 'international'
  const initialType = location.state?.type === 'national' ? 'national' : 'international';

  const [formData, setFormData] = useState({
    type: initialType as 'national' | 'international',
    destination: '',
    duree: 7,
    date_debut: '',
    hebergement: '4 étoiles',
    options: {
      restauration: 'petit déjeuner',
      transport: 'inclus'
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: CustomTripRequestPayload = {
        category: 'voyage',
        details: {
          type: formData.type,
          destination: formData.destination,
          duree: Number(formData.duree),
          date_debut: formData.date_debut,
          hebergement: formData.hebergement,
          options: {
            restauration: formData.options.restauration,
            transport: formData.options.transport
          }
        }
      };

      await createCustomTripRequest(payload);
      toast.success('Votre demande de voyage a été envoyée avec succès !');
      // Navigate to dashboard requests tab (assuming we can pass state to switch tab or just go there)
      navigate('/mon-compte', { state: { activeTab: 'requests' } });

    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Une erreur est survenue lors de l\'envoi de la demande.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent pt-40 pb-12 px-4">
      <div className="container mx-auto max-w-3xl">

        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-slate-900 mb-4">
            Créez votre voyage sur mesure
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Confiez-nous vos envies, nous construirons pour vous le séjour idéal.
            Remplissez ce formulaire pour recevoir un devis personnalisé.
          </p>
        </div>

        <div className="bg-white/70 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl shadow-blue-900/10 border border-white/50 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-primary to-blue-600"></div>

          <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-8">

            {/* Type Selection */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-1.5 rounded-xl">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'national' })}
                className={`py-2.5 rounded-lg text-sm font-bold transition-all ${formData.type === 'national' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Voyage National
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'international' })}
                className={`py-2.5 rounded-lg text-sm font-bold transition-all ${formData.type === 'international' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Voyage International
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Destination */}
              <div className="col-span-1 md:col-span-2 space-y-2">
                <Label htmlFor="destination" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" /> Destination souhaitée
                </Label>
                <Input
                  id="destination"
                  placeholder={formData.type === 'national' ? 'Ex: Bejaia, Oran, désert...' : 'Ex: Italie, Turquie, Maldives...'}
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  required
                  className="h-12 border-slate-200 focus:border-primary"
                />
              </div>

              {/* Date Début */}
              <div className="space-y-2">
                <Label htmlFor="date_debut" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" /> Date de départ
                </Label>
                <Input
                  id="date_debut"
                  type="date"
                  value={formData.date_debut}
                  onChange={(e) => setFormData({ ...formData, date_debut: e.target.value })}
                  required
                  className="h-12 border-slate-200 focus:border-primary block w-full"
                />
              </div>

              {/* Durée */}
              <div className="space-y-2">
                <Label htmlFor="duree" className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" /> Durée (jours)
                </Label>
                <Input
                  id="duree"
                  type="number"
                  min="1"
                  value={formData.duree}
                  onChange={(e) => setFormData({ ...formData, duree: parseInt(e.target.value) || 0 })}
                  required
                  className="h-12 border-slate-200 focus:border-primary"
                />
              </div>

              {/* Hébergement */}
              <div className="space-y-2">
                <Label htmlFor="hebergement" className="flex items-center gap-2">
                  <Hotel className="w-4 h-4 text-primary" /> Hébergement
                </Label>
                <Select
                  value={formData.hebergement}
                  onValueChange={(val) => setFormData({ ...formData, hebergement: val })}
                >
                  <SelectTrigger className="h-12 border-slate-200">
                    <SelectValue placeholder="Choisir un standing" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2 étoiles">2 Étoiles</SelectItem>
                    <SelectItem value="3 étoiles">3 Étoiles</SelectItem>
                    <SelectItem value="4 étoiles">4 Étoiles</SelectItem>
                    <SelectItem value="5 étoiles">5 Étoiles (Luxe)</SelectItem>
                    <SelectItem value="Appartement">Appartement / Villa</SelectItem>
                    <SelectItem value="Autre">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Restauration Option */}
              <div className="space-y-2">
                <Label htmlFor="restauration" className="flex items-center gap-2">
                  <Coffee className="w-4 h-4 text-primary" /> Restauration
                </Label>
                <Select
                  value={formData.options.restauration}
                  onValueChange={(val) => setFormData({ ...formData, options: { ...formData.options, restauration: val } })}
                >
                  <SelectTrigger className="h-12 border-slate-200">
                    <SelectValue placeholder="Préférence repas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="petit déjeuner">Petit déjeuner inclus</SelectItem>
                    <SelectItem value="demi-pension">Demi-pension (Matin + Soir)</SelectItem>
                    <SelectItem value="pension complète">Pension complète</SelectItem>
                    <SelectItem value="all inclusive">All Inclusive</SelectItem>
                    <SelectItem value="sans repas">Sans repas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Transport Option - Single Column */}
            <div className="space-y-3 pt-2">
              <Label className="flex items-center gap-2">
                <Plane className="w-4 h-4 text-primary" /> Transport & Transferts
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {['inclus', 'navette aéroport', 'non inclus'].map((opt) => (
                  <div
                    key={opt}
                    onClick={() => setFormData({ ...formData, options: { ...formData.options, transport: opt } })}
                    className={`cursor-pointer border rounded-xl p-3 text-center transition-all ${formData.options.transport === opt ? 'border-primary bg-primary/5 text-primary font-bold' : 'border-slate-200 hover:border-slate-300 text-slate-600'}`}
                  >
                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6">
              <Button type="submit" className="w-full h-14 text-lg font-bold shadow-lg shadow-primary/25 hover:scale-[1.01] transition-transform" disabled={loading}>
                {loading ? <LoadingSpinner /> : (
                  <span className="flex items-center gap-2">
                    Envoyer ma demande <ArrowRight className="w-5 h-5" />
                  </span>
                )}
              </Button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}

export default CustomTripPage