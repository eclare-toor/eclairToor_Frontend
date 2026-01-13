import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import type { Trip } from '../../Types';
import { getTrips, createTrip, updateTrip, deleteTrip, createTripItineraries, linkTripHotels, addTripImages, deleteTripImages, type CreateItineraryPayload } from '../../api';
import { Button } from '../../components/ui/button';
import { Plus, Edit, Trash2, MapPin, Calendar, ListChecks, Hotel as HotelIcon } from 'lucide-react';
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
  const [originalTrip, setOriginalTrip] = useState<Trip | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [creationStep, setCreationStep] = useState(1);
  const [createdTripId, setCreatedTripId] = useState<string | null>(null);
  const [deletedImages, setDeletedImages] = useState<string[]>([]);
  const [newItineraries, setNewItineraries] = useState<CreateItineraryPayload[]>([{ day_date: '', activities: '' }]);

  // Specific editing states
  const [editingItineraryTrip, setEditingItineraryTrip] = useState<string | null>(null);
  const [editingHotelsTrip, setEditingHotelsTrip] = useState<{ id: string, type: string } | null>(null);

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const data = await getTrips();
      setTrips(data);
    } catch (error) {
      console.error('Error fetching trips:', error);
      toast.error('Erreur lors du chargement des voyages');
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
      if (isEditing && currentTrip.id && originalTrip) {
        let hasInfoChanges = false;
        const updatePayload: any = {};

        // Compare and append changed fields
        if (currentTrip.title !== originalTrip.title) {
          updatePayload.title = currentTrip.title;
          hasInfoChanges = true;
        }
        if (currentTrip.description !== originalTrip.description) {
          updatePayload.description = currentTrip.description;
          hasInfoChanges = true;
        }

        const originalStartDate = originalTrip.start_date ? new Date(originalTrip.start_date).toISOString().split('T')[0] : '';
        const currentStartDate = currentTrip.start_date ? new Date(currentTrip.start_date).toISOString().split('T')[0] : '';
        if (currentStartDate !== originalStartDate) {
          updatePayload.start_date = currentStartDate;
          hasInfoChanges = true;
        }

        const originalEndDate = originalTrip.end_date ? new Date(originalTrip.end_date).toISOString().split('T')[0] : '';
        const currentEndDate = currentTrip.end_date ? new Date(currentTrip.end_date).toISOString().split('T')[0] : '';
        if (currentEndDate !== originalEndDate) {
          updatePayload.end_date = currentEndDate;
          hasInfoChanges = true;
        }

        if (String(currentTrip.base_price) !== String(originalTrip.base_price)) {
          updatePayload.base_price = Number(currentTrip.base_price || 0);
          hasInfoChanges = true;
        }

        const type = currentTrip.type?.toLowerCase() || 'national';
        if (currentTrip.type !== originalTrip.type) {
          updatePayload.type = type;
          hasInfoChanges = true;
        }

        if (type === 'national' && currentTrip.destination_wilaya !== originalTrip.destination_wilaya) {
          updatePayload.destination_wilaya = currentTrip.destination_wilaya; hasInfoChanges = true;
        } else if (type === 'international' && currentTrip.destination_country !== originalTrip.destination_country) {
          updatePayload.destination_country = currentTrip.destination_country; hasInfoChanges = true;
        } else if (['religieuse', 'omra', 'tourisme religieux'].includes(type)) {
          if (currentTrip.omra_category !== originalTrip.omra_category) {
            updatePayload.omra_category = currentTrip.omra_category; hasInfoChanges = true;
          }
          if (currentTrip.omra_type !== originalTrip.omra_type) {
            updatePayload.omra_type = currentTrip.omra_type; hasInfoChanges = true;
          }
        }

        if (JSON.stringify(currentTrip.equipment_list) !== JSON.stringify(originalTrip.equipment_list)) {
          updatePayload.equipment_list = currentTrip.equipment_list;
          hasInfoChanges = true;
        }

        // 1. Update Trip Info if changed
        if (hasInfoChanges) {
          await updateTrip(currentTrip.id, updatePayload);
        }

        // 2. Add New Images if any
        if (imageFiles.length > 0) {
          const imgFormData = new FormData();
          imageFiles.forEach(file => imgFormData.append('images', file));
          await addTripImages(currentTrip.id, imgFormData);
        }

        // 3. Delete Removed Images if any
        if (deletedImages.length > 0) {
          const namesToDelete = deletedImages.map(path => {
            const parts = path.split('/');
            return parts[parts.length - 1];
          });
          await deleteTripImages(currentTrip.id, namesToDelete);
        }

        if (hasInfoChanges || imageFiles.length > 0 || deletedImages.length > 0) {
          toast.success("Voyage modifié avec succès !");
          fetchTrips();
        } else if (hasInfoChanges === false && imageFiles.length === 0 && deletedImages.length === 0) {
          toast.info("Aucune modification détectée.");
        }
      } else {
        const formData = new FormData();
        formData.append('title', currentTrip.title || '');
        formData.append('description', currentTrip.description || '');
        formData.append('start_date', currentTrip.start_date || '');
        formData.append('end_date', currentTrip.end_date || '');
        formData.append('base_price', String(currentTrip.base_price || 0));

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

        if (currentTrip.equipment_list && currentTrip.equipment_list.length > 0) {
          formData.append('equipment_list', JSON.stringify(currentTrip.equipment_list));
        }

        imageFiles.forEach((file) => {
          formData.append('images', file);
        });

        const newTrip = await createTrip(formData);
        toast.success("Voyage créé avec succès ! Ajoutez maintenant l'itinéraire.");
        fetchTrips();
        setCreatedTripId(newTrip.id);
        setCreationStep(2);
      }
      if (isEditing) {
        setIsModalOpen(false);
        fetchTrips();
      }
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
        <div>
          <p className="mb-2 font-medium text-sm">Êtes-vous sûr de vouloir supprimer ce voyage ?</p>
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2 text-xs"
              onClick={closeToast}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="h-8 px-2 text-xs"
              onClick={async () => {
                try {
                  await deleteTrip(id);
                  toast.dismiss();
                  toast.success("Voyage supprimé avec succès");
                  fetchTrips();
                } catch (error) {
                  console.error(error);
                  toast.error("Erreur lors de la suppression");
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

  const openEditModal = (trip: Trip) => {
    setOriginalTrip(JSON.parse(JSON.stringify(trip)));
    const safeDate = (dateStr: string | undefined) => {
      if (!dateStr) return '';
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
    };

    setCurrentTrip({
      ...trip,
      start_date: safeDate(trip.start_date),
      end_date: safeDate(trip.end_date),
    });
    setImageFiles([]);
    setCreationStep(1);
    setIsEditing(true);
    setDeletedImages([]);
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

      <div className="flex bg-white p-1 rounded-xl w-fit border border-slate-200">
        {[
          { label: 'Tourisme National', value: 'national' },
          { label: 'Tourisme International', value: 'international' },
          { label: 'Tourisme Religieux', value: 'religieuse' }
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilterType(tab.value)}
            className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${filterType === tab.value
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips
            .filter((trip) => trip.type === filterType)
            .map((trip) => (
              <div key={trip.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow group">
                <div className="h-48 overflow-hidden relative">
                  <img
                    src={Array.isArray(trip.images) && trip.images[0] ? (trip.images[0].startsWith('http') ? trip.images[0] : `http://localhost:3000/api${trip.images[0]}`) : 'https://via.placeholder.com/400x300'}
                    alt={trip.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 right-2 flex flex-col gap-2">
                    <div className="bg-white/90 backdrop-blur px-2 py-1 rounded-md text-xs font-bold shadow-sm self-end">
                      {trip.type}
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-lg text-slate-900 mb-1">{trip.title}</h3>
                  <div className="flex items-center text-sm text-slate-500 mb-4">
                    <MapPin className="w-4 h-4 mr-1" /> {trip.destination_wilaya || trip.destination_country || trip.omra_category}
                    <span className="mx-2">•</span>
                    <Calendar className="w-4 h-4 mr-1" /> {new Date(trip.start_date).toLocaleDateString()}
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                    <span className="font-bold text-primary">{Number(trip.base_price || 0).toLocaleString()} DA</span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" title="Modifier l'itinéraire" className="h-8 w-8 text-blue-600 border-blue-100 hover:bg-blue-50" onClick={() => setEditingItineraryTrip(trip.id)}>
                        <ListChecks className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="icon" title="Gérer les hôtels" className="h-8 w-8 text-emerald-600 border-emerald-100 hover:bg-emerald-50" onClick={() => setEditingHotelsTrip({ id: trip.id, type: trip.type })}>
                        <HotelIcon className="w-4 h-4" />
                      </Button>
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

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {creationStep === 1
                ? (isEditing ? "Modifier le voyage" : "Créer un nouveau voyage (1/3)")
                : creationStep === 2
                  ? "Ajouter l'itinéraire (2/3)"
                  : "Sélectionner les hôtels (3/3)"
              }
            </DialogTitle>
          </DialogHeader>

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
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingItineraryTrip} onOpenChange={(open) => !open && setEditingItineraryTrip(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gestion de l'itinéraire</DialogTitle>
          </DialogHeader>
          <ItineraryForm
            tripId={editingItineraryTrip || undefined}
            onCancel={() => setEditingItineraryTrip(null)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingHotelsTrip} onOpenChange={(open) => !open && setEditingHotelsTrip(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gestion des Hôtels</DialogTitle>
          </DialogHeader>
          {editingHotelsTrip && (
            <TripHotelsForm
              tripId={editingHotelsTrip.id}
              tripType={editingHotelsTrip.type}
              onCancel={() => setEditingHotelsTrip(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTripsPage;