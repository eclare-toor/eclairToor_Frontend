import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import type { Trip } from '../../Types';
import { getTrips, createTrip, deleteTrip, createTripItineraries, linkTripHotels, type CreateItineraryPayload } from '../../api';
import { Button } from '../../components/ui/button';
import { Plus, Trash2, MapPin, Calendar, Eye } from 'lucide-react';
import LoadingSpinner from '../../components/Shared/LoadingSpinner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import TripForm from './components/TripForm';
import TripHotelsForm from './components/TripHotelsForm';
import ItineraryForm from './components/ItineraryForm';

const AdminTripsPage = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('national');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTrip, setCurrentTrip] = useState<Partial<Trip>>({});

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [creationStep, setCreationStep] = useState(1);
  const [createdTripId, setCreatedTripId] = useState<string | null>(null);
  const [deletedImages, setDeletedImages] = useState<string[]>([]);
  const [newItineraries, setNewItineraries] = useState<CreateItineraryPayload[]>([{ day_date: '', activities: '' }]);

  const navigate = useNavigate();

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const data = await getTrips();
      setTrips(data);
    } catch (error: any) {
      console.error('Error fetching trips:', error);
      toast.error(error.message || 'Erreur lors du chargement des voyages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const formData = new FormData();
      formData.append('title', currentTrip.title || '');
      formData.append('description', currentTrip.description || '');
      formData.append('start_date', currentTrip.start_date || '');
      formData.append('end_date', currentTrip.end_date || '');
      formData.append('base_price', String(currentTrip.base_price || 0));
      if (currentTrip.promotion !== undefined) {
        formData.append('promotion', String(currentTrip.promotion));
      }

      const type = currentTrip.type?.toLowerCase() || 'national';
      formData.append('type', type);

      if (type === 'national') {
        formData.append('destination_wilaya', currentTrip.destination_wilaya || '');
      } else if (type === 'international') {
        formData.append('destination_country', currentTrip.destination_country || '');
      } else if (['religieuse', 'omra', 'tourisme religieux'].includes(type)) {
        formData.append('omra_category', currentTrip.omra_category || '');
        formData.append('omra_type', currentTrip.omra_type || 'classic');
      }

      if (currentTrip.equipment_list) {
        let equipment: string[] = [];
        if (typeof currentTrip.equipment_list === 'string') {
          equipment = currentTrip.equipment_list.split(',').map(s => s.trim()).filter(Boolean);
        } else if (Array.isArray(currentTrip.equipment_list)) {
          equipment = currentTrip.equipment_list;
        }

        if (equipment.length > 0) {
          formData.append('equipment_list', JSON.stringify(equipment));
        }
      }

      if (currentTrip.options) {
        formData.append('options', JSON.stringify(currentTrip.options));
      }

      imageFiles.forEach((file) => {
        formData.append('images', file);
      });

      const newTrip = await createTrip(formData);
      toast.success("Voyage créé avec succès ! Ajoutez maintenant l'itinéraire.");
      fetchTrips();
      setCreatedTripId(newTrip.id);
      setCreationStep(2);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Une erreur est survenue lors de l'enregistrement.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveExistingImage = (index: number) => {
    if (!currentTrip.images) return;
    const updatedImages = [...currentTrip.images];
    const imageToRemove = updatedImages[index];
    updatedImages.splice(index, 1);
    setCurrentTrip({ ...currentTrip, images: updatedImages });
    setDeletedImages([...deletedImages, imageToRemove]);
  };

  const handleRemoveNewImage = (index: number) => {
    const updatedFiles = [...imageFiles];
    updatedFiles.splice(index, 1);
    setImageFiles(updatedFiles);
  };

  const handleDelete = (id: string) => {
    toast(
      ({ closeToast }) => (
        <div className="p-2">
          <p className="mb-4 font-bold text-slate-900">Êtes-vous sûr de vouloir supprimer ce voyage ?</p>
          <div className="flex gap-3 justify-end">
            <Button
              variant="ghost"
              size="sm"
              className="font-black uppercase tracking-widest text-[10px]"
              onClick={closeToast}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="font-black uppercase tracking-widest text-[10px] shadow-lg shadow-red-200"
              onClick={async () => {
                try {
                  await deleteTrip(id);
                  toast.dismiss();
                  toast.success("Voyage supprimé avec succès");
                  fetchTrips();
                } catch (error: any) {
                  console.error(error);
                  toast.error(error.message || "Erreur lors de la suppression");
                }
                closeToast();
              }}
            >
              Supprimer
            </Button>
          </div>
        </div>
      ),
      {
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        draggable: false,
      }
    );
  };

  const handleSaveItineraries = async () => {
    if (!createdTripId) return;
    setIsSaving(true);
    try {
      const validItineraries = newItineraries.filter(i => i.day_date && i.activities);
      if (validItineraries.length === 0) {
        toast.warning("Veuillez ajouter au moins une étape à l'itinéraire.");
        setIsSaving(false);
        return;
      }

      await createTripItineraries(createdTripId, validItineraries);
      toast.success("Itinéraire ajouté avec succès ! Passons aux hôtels.");
      setCreationStep(3);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Erreur lors de l'ajout de l'itinéraire");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveHotels = async (hotels: any[]) => {
    if (!createdTripId) return;
    setIsSaving(true);
    try {
      await linkTripHotels(createdTripId, hotels.map(h => ({ hotel_id: h.hotel_id, description: h.description })));
      toast.success("Hôtels liés avec succès ! Voyage créé.");
      setIsModalOpen(false);
      fetchTrips();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Erreur lors de la liaison des hôtels");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddItineraryStep = () => {
    setNewItineraries([...newItineraries, { day_date: '', activities: '' }]);
  };

  const handeRemoveItineraryStep = (index: number) => {
    const updated = [...newItineraries];
    updated.splice(index, 1);
    setNewItineraries(updated);
  }

  const openCreateModal = () => {
    setCurrentTrip({
      type: 'national',
      images: [],
      equipment_list: [],
      base_price: 0
    });
    setImageFiles([]);
    setCreationStep(1);
    setCreatedTripId(null);
    setDeletedImages([]);
    setNewItineraries([{ day_date: '', activities: '' }]);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-4">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none">
            Gestion des <span className="text-primary italic">Voyages</span>
          </h2>
          <p className="text-slate-500 font-bold mt-2 uppercase tracking-widest text-[10px]">Catalogue et Programmation</p>
        </div>
        <Button onClick={openCreateModal} className="h-14 px-8 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest shadow-xl transition-all hover:scale-[1.02] flex items-center gap-3">
          <div className="p-1.5 bg-white/10 rounded-lg">
            <Plus className="w-4 h-4" />
          </div>
          Nouveau Voyage
        </Button>
      </div>

      <div className="flex items-center justify-between gap-6 mb-8">
        <div className="flex bg-slate-100/50 p-1.5 rounded-[1.5rem] border border-slate-200/50 backdrop-blur-sm">
          {[
            { label: 'National', value: 'national' },
            { label: 'International', value: 'international' },
            { label: 'Omra', value: 'religieuse' }
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilterType(tab.value)}
              className={`px-6 py-2.5 text-xs font-black uppercase tracking-widest rounded-2xl transition-all duration-300 ${filterType === tab.value
                ? 'bg-white text-primary shadow-xl shadow-primary/5 border border-slate-100'
                : 'text-slate-400 hover:text-slate-600'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="hidden md:block px-4 py-2 bg-primary/5 rounded-full border border-primary/10">
          <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] italic">
            {trips.filter(t => t.type === filterType).length} Voyages trouvés
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-20"><LoadingSpinner /></div>
      ) : (
        <div className="min-h-[200px]">
          {trips.filter((trip) => trip.type === filterType).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-[2.5rem] border border-dashed border-slate-200">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Calendar className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">Aucun voyage trouvé</h3>
              <p className="text-slate-500 font-medium text-sm max-w-md text-center">
                Il n'y a actuellement aucun voyage dans la catégorie <span className="font-bold text-primary italic">{filterType}</span>.
                Commencez par en créer un nouveau !
              </p>
              <Button onClick={openCreateModal} variant="outline" className="mt-6 border-2 font-bold hover:border-primary hover:text-primary rounded-xl h-12 px-6">
                <Plus className="w-4 h-4 mr-2" /> Créer un voyage
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trips
                .filter((trip) => trip.type === filterType)
                .map((trip) => (
                  <div
                    key={trip.id}
                    onClick={() => navigate(`/admin/voyages/${trip.id}`)}
                    className="group relative bg-white rounded-[2rem] border border-slate-100 overflow-hidden hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 cursor-pointer"
                  >
                    {/* Trip Image with Overlay */}
                    <div className="h-56 overflow-hidden relative">
                      <img
                        src={Array.isArray(trip.images) && trip.images[0] ? (trip.images[0].startsWith('http') ? trip.images[0] : `http://localhost:3000/api${trip.images[0]}`) : 'https://via.placeholder.com/400x300'}
                        alt={trip.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      {/* Floating Badges */}
                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                        <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl text-slate-900 border border-white/20">
                          {trip.type}
                        </div>
                      </div>

                      <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                        <p className="text-white text-xs font-bold flex items-center gap-2">
                          <Eye className="w-4 h-4" /> Cliquez pour modifier
                        </p>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div className="mb-4">
                        <h3 className="font-black text-xl text-slate-900 mb-2 leading-tight group-hover:text-primary transition-colors line-clamp-1">{trip.title}</h3>
                        <div className="flex flex-wrap items-center gap-y-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          <div className="flex items-center gap-1.5 mr-4">
                            <MapPin className="w-3.5 h-3.5 text-primary" />
                            <span className="truncate max-w-[120px]">{trip.destination_wilaya || trip.destination_country || trip.omra_category}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-primary" />
                            {new Date(trip.start_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-5 border-t border-slate-50">
                        <div className="flex flex-col gap-2">
                          <div>
                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mb-0.5">À partir de</p>
                            <p className="font-black text-lg text-primary tracking-tight">
                              {Number(trip.base_price || 0).toLocaleString('fr-DZ')} <span className="text-[10px]">DZD</span>
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-[10px] font-black uppercase tracking-widest border-2 hover:bg-slate-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/admin/voyages/${trip.id}/bookings`);
                            }}
                          >
                            Voir les réservations
                          </Button>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(trip.id);
                          }}
                          className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 shadow-sm border border-red-100"
                          title="Supprimer ce voyage"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Hover Glow Effect */}
                    <div className="absolute inset-0 border-2 border-primary/0 group-hover:border-primary/10 rounded-[2rem] pointer-events-none transition-colors duration-500" />
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] p-0 border-none">
          <DialogHeader className="p-8 pb-0">
            <DialogTitle className="text-3xl font-black text-slate-900">
              {creationStep === 1
                ? "Nouveau Voyage"
                : creationStep === 2
                  ? "Itinéraire"
                  : "Hébergement"
              }
              <span className="text-primary italic ml-2">({creationStep}/3)</span>
            </DialogTitle>
          </DialogHeader>

          <div className="p-8">
            {creationStep === 1 ? (
              <TripForm
                currentTrip={currentTrip}
                setCurrentTrip={setCurrentTrip}
                onSubmit={handleSave}
                isSaving={isSaving}
                isEditing={isEditing}
                imageFiles={imageFiles}
                setImageFiles={setImageFiles}
                onRemoveExistingImage={handleRemoveExistingImage}
                onRemoveNewImage={handleRemoveNewImage}
              />
            ) : creationStep === 2 ? (
              <ItineraryForm
                newItineraries={newItineraries}
                setNewItineraries={setNewItineraries}
                onSave={handleSaveItineraries}
                onAddStep={handleAddItineraryStep}
                onRemoveStep={handeRemoveItineraryStep}
                onCancel={() => setCreationStep(3)}
                isSaving={isSaving}
              />
            ) : (
              <TripHotelsForm
                tripType={currentTrip.type || 'national'}
                onSave={handleSaveHotels}
                onCancel={() => setIsModalOpen(false)}
                isSaving={isSaving}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTripsPage;