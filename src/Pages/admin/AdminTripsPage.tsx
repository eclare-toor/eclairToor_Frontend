import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import type { Trip } from '../../Types';
import { getTrips, createTrip, updateTrip, deleteTrip, createTripItineraries, linkTripHotels, type CreateItineraryPayload, type TripHotelLink } from '../../api';
import { Button } from '../../components/ui/button';
import { Plus, Edit, Trash2, MapPin, Calendar } from 'lucide-react';
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
  const [newItineraries, setNewItineraries] = useState<CreateItineraryPayload[]>([{ day_date: '', activities: '' }]);

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
        const formData = new FormData();
        let hasChanges = false;

        // Compare and append changed fields
        if (currentTrip.title !== originalTrip.title) {
          formData.append('title', currentTrip.title || '');
          hasChanges = true;
        }
        if (currentTrip.description !== originalTrip.description) {
          formData.append('description', currentTrip.description || '');
          hasChanges = true;
        }

        // Date handling: Ensure we compare YYYY-MM-DD format
        const originalStartDate = originalTrip.start_date ? new Date(originalTrip.start_date).toISOString().split('T')[0] : '';
        const currentStartDate = currentTrip.start_date ? new Date(currentTrip.start_date).toISOString().split('T')[0] : '';
        if (currentStartDate !== originalStartDate) {
          formData.append('start_date', currentStartDate);
          hasChanges = true;
        }

        const originalEndDate = originalTrip.end_date ? new Date(originalTrip.end_date).toISOString().split('T')[0] : '';
        const currentEndDate = currentTrip.end_date ? new Date(currentTrip.end_date).toISOString().split('T')[0] : '';
        if (currentEndDate !== originalEndDate) {
          formData.append('end_date', currentEndDate);
          hasChanges = true;
        }

        if (String(currentTrip.base_price) !== String(originalTrip.base_price)) {
          formData.append('base_price', String(currentTrip.base_price || 0));
          hasChanges = true;
        }

        // Handle Type changes
        const type = currentTrip.type?.toLowerCase() || 'national';
        if (currentTrip.type !== originalTrip.type) {
          formData.append('type', type);
          hasChanges = true;
        }

        // Handle specific type fields
        if (type === 'national' && currentTrip.destination_wilaya !== originalTrip.destination_wilaya) {
          formData.append('destination_wilaya', currentTrip.destination_wilaya || ''); hasChanges = true;
        } else if (type === 'international' && currentTrip.destination_country !== originalTrip.destination_country) {
          formData.append('destination_country', currentTrip.destination_country || ''); hasChanges = true;
        } else if (['religieuse'].includes(type) && currentTrip.omra_category !== originalTrip.omra_category) {
          formData.append('omra_category', currentTrip.omra_category || ''); hasChanges = true;
        }

        // Equipment List
        if (JSON.stringify(currentTrip.equipment_list) !== JSON.stringify(originalTrip.equipment_list)) {
          formData.append('equipment_list', JSON.stringify(currentTrip.equipment_list));
          hasChanges = true;
        }

        // Existing Images (Check if changed)
        if (JSON.stringify(currentTrip.images) !== JSON.stringify(originalTrip.images)) {
          formData.append('existing_images', JSON.stringify(currentTrip.images));
          hasChanges = true;
        }

        // New Images
        if (imageFiles.length > 0) {
          imageFiles.forEach((file) => {
            formData.append('images', file);
          });
          hasChanges = true;
        }

        if (hasChanges) {
          // Decide whether to send JSON or FormData
          if (imageFiles.length > 0) {
            await updateTrip(currentTrip.id, formData);
          } else {
            // Build a JSON object instead for cleaner update
            const updatePayload: any = {};

            if (currentTrip.title !== originalTrip.title) updatePayload.title = currentTrip.title;
            if (currentTrip.description !== originalTrip.description) updatePayload.description = currentTrip.description;

            if (currentStartDate !== originalStartDate) updatePayload.start_date = currentStartDate;
            if (currentEndDate !== originalEndDate) updatePayload.end_date = currentEndDate;

            if (String(currentTrip.base_price) !== String(originalTrip.base_price)) updatePayload.base_price = currentTrip.base_price;

            if (currentTrip.type !== originalTrip.type) updatePayload.type = type;

            if (type === 'national' && currentTrip.destination_wilaya !== originalTrip.destination_wilaya) updatePayload.destination_wilaya = currentTrip.destination_wilaya;
            else if (type === 'international' && currentTrip.destination_country !== originalTrip.destination_country) updatePayload.destination_country = currentTrip.destination_country;
            else if (['religieuse'].includes(type) && currentTrip.omra_category !== originalTrip.omra_category) updatePayload.omra_category = currentTrip.omra_category;

            if (JSON.stringify(currentTrip.equipment_list) !== JSON.stringify(originalTrip.equipment_list)) updatePayload.equipment_list = currentTrip.equipment_list;
            if (JSON.stringify(currentTrip.images) !== JSON.stringify(originalTrip.images)) updatePayload.existing_images = currentTrip.images;

            await updateTrip(currentTrip.id, updatePayload);
          }

          toast.success("Voyage modifié avec succès !");
          fetchTrips();
        } else {
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
        } else if (['religieuse'].includes(type)) {
          formData.append('omra_category', currentTrip.omra_category || '');
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
    updatedImages.splice(index, 1);
    setCurrentTrip({ ...currentTrip, images: updatedImages });
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
      setCreationStep(3); // Move to Hotels step
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
    setNewItineraries([{ day_date: '', activities: '' }]);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const openEditModal = (trip: Trip) => {
    setOriginalTrip(JSON.parse(JSON.stringify(trip))); // Deep copy for comparison
    setCurrentTrip({
      ...trip,
      start_date: trip.start_date ? new Date(trip.start_date).toISOString().split('T')[0] : '',
      end_date: trip.end_date ? new Date(trip.end_date).toISOString().split('T')[0] : '',
    });
    setImageFiles([]); // Clear previous files
    setCreationStep(1);
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
        {['national', 'international', 'omra'].map((type) => (
          <button
            key={type}
            onClick={() => { if (type === 'omra') setFilterType('religieuse'); else setFilterType(type) }}
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
          {trips
            .filter((trip) => trip.type === filterType)
            .map((trip) => (
              <div key={trip.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow group">
                <div className="h-48 overflow-hidden relative">
                  <img
                    src={trip.images[0] ? (trip.images[0].startsWith('http') ? trip.images[0] : `http://localhost:3000/api${trip.images[0]}`) : 'https://via.placeholder.com/400x300'}
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
                    <MapPin className="w-4 h-4 mr-1" /> {trip.destination_wilaya || trip.destination_country || trip.omra_category}
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
              onCancel={() => setCreationStep(3)} // Allow skipping itinerary if needed? or just close? Let's say move to next
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
    </div>
  );
};

export default AdminTripsPage;