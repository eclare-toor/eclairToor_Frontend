import React, { useEffect, useState } from 'react';
import type { Trip } from '../../Types';
import { getTripsByType, createTrip, updateTrip, deleteTrip } from '../../api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Plus, Edit, Trash2, MapPin, Calendar, Image as ImageIcon } from 'lucide-react';
import LoadingSpinner from '../../components/Shared/LoadingSpinner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

const AdminTripsPage = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('NATIONAL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTrip, setCurrentTrip] = useState<Partial<Trip>>({});
  const [isEditing, setIsEditing] = useState(false);

  const fetchTrips = async () => {
    setLoading(true);
    const data = await getTripsByType(filterType);
    setTrips(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchTrips();
  }, [filterType]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation/Default values
    const tripData = {
      ...currentTrip,
      created_at: currentTrip.created_at || new Date().toISOString(),
      images: currentTrip.images || [],
      equipment_list: currentTrip.equipment_list || [],
    } as Trip; 

    // If ID missing, generate one
    if (!tripData.id) tripData.id = `trip-${Date.now()}`;

    if (isEditing) {
      await updateTrip(tripData);
    } else {
      await createTrip(tripData);
    }

    setIsModalOpen(false);
    fetchTrips();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce voyage ?")) {
      await deleteTrip(id);
      fetchTrips();
    }
  };

  const openCreateModal = () => {
    setCurrentTrip({  
      type: 'NATIONAL',
      images: [],
      equipment_list: [],
      base_price: 0
    });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const openEditModal = (trip: Trip) => { 
    setCurrentTrip({ ...trip });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Gestion des Voyages</h2>
        <Button onClick={openCreateModal} className="gap-2">
          <Plus className="w-4 h-4" /> Ajouter Un Voyage
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-white p-1 rounded-xl w-fit border border-slate-200">
        {['NATIONAL', 'INTERNATIONAL', 'OMRA'].map((type) => (
          <button 
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${filterType === type
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
          >
            {type.charAt(0) + type.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Trips List */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <div key={trip.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow group">
              <div className="h-48 overflow-hidden relative">
                <img
                  src={trip.images[0] || 'https://via.placeholder.com/400x300'}
                  alt={trip.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-md text-xs font-bold shadow-sm">
                  {trip.type}
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-lg text-slate-900 mb-1">{trip.title}</h3>
                <div className="flex items-center text-sm text-slate-500 mb-4">
                  <MapPin className="w-4 h-4 mr-1" /> {trip.personalized_fields || 'Multi-destinations'}
                  <span className="mx-2">•</span>
                  <Calendar className="w-4 h-4 mr-1" /> {new Date(trip.start_date).toLocaleDateString()}
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                  <span className="font-bold text-primary">{trip.base_price.toLocaleString()} DA</span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openEditModal(trip)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => handleDelete(trip.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Modifier le voyage" : "Créer un nouveau voyage"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Titre du voyage</Label>
                <Input
                  required
                  value={currentTrip.title || ''}
                  onChange={(e) => setCurrentTrip({ ...currentTrip, title: e.target.value })}
                />
              </div>

              <div>
                <Label>Type de voyage</Label>
                <Select
                  value={currentTrip.type}
                  onValueChange={(val: any) => setCurrentTrip({ ...currentTrip, type: val })}
                >
                  <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NATIONAL">National</SelectItem>
                    <SelectItem value="INTERNATIONAL">International</SelectItem>
                    <SelectItem value="OMRA">Omra</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Destination</Label>
                <Input
                  value={currentTrip.personalized_fields || ''}
                  onChange={(e) => setCurrentTrip({ ...currentTrip, personalized_fields: e.target.value })}
                />
              </div>

              <div>
                <Label>Date de début</Label>
                <Input
                  type="date"
                  required
                  value={currentTrip.start_date || ''}
                  onChange={(e) => setCurrentTrip({ ...currentTrip, start_date: e.target.value })}
                />
              </div>
              <div>
                <Label>Date de fin</Label>
                <Input
                  type="date"
                  required
                  value={currentTrip.end_date || ''}
                  onChange={(e) => setCurrentTrip({ ...currentTrip, end_date: e.target.value })}
                />
              </div>

              <div>
                <Label>Prix (DA)</Label>
                <Input
                  type="number"
                  required
                  value={currentTrip.base_price || 0}
                  onChange={(e) => setCurrentTrip({ ...currentTrip, base_price: parseInt(e.target.value) })}
                />
              </div>

              <div>
                <Label>Image URL (Principale)</Label>
                <Input
                  value={currentTrip.images?.[0] || ''}
                  onChange={(e) => setCurrentTrip({ ...currentTrip, images: [e.target.value, ...(currentTrip.images?.slice(1) || [])] })}
                />
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                required
                className="h-32"
                value={currentTrip.description || ''}
                onChange={(e) => setCurrentTrip({ ...currentTrip, description: e.target.value })}
              />
            </div>

            <Button type="submit" className="w-full">
              {isEditing ? "Enregistrer les modifications" : "Créer le voyage"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTripsPage;