import React, { useEffect, useState } from 'react';
import type { Hotel } from '../../Types';
import { getHotels, createHotel, deleteHotel, updateHotel } from '../../api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Plus, Trash2, MapPin, Star, Building, Edit } from 'lucide-react';
import LoadingSpinner from '../../components/Shared/LoadingSpinner';
import { toast } from 'react-toastify';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { addHotelImages, deleteHotelImages } from '../../api';
import { X, Image as ImageIcon, Upload } from 'lucide-react';

const AdminOmraHotelsPage = () => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentHotel, setCurrentHotel] = useState<Partial<Hotel>>({});
  const [creationStep, setCreationStep] = useState(1);
  const [createdHotelId, setCreatedHotelId] = useState<string | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [deletedImages, setDeletedImages] = useState<string[]>([]);

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const data = await getHotels();
      setHotels(data);
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors du chargement des hôtels");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (isEditing && currentHotel.id) {
        // 1. Update Hotel Info
        await updateHotel(currentHotel.id, currentHotel);

        // 2. Add New Images if any
        if (imageFiles.length > 0) {
          const imgFormData = new FormData();
          imageFiles.forEach(file => imgFormData.append('images', file));
          await addHotelImages(currentHotel.id, imgFormData);
        }

        // 3. Delete Removed Images if any
        if (deletedImages.length > 0) {
          const namesToDelete = deletedImages.map(path => {
            const parts = path.split('/');
            return parts[parts.length - 1];
          });
          await deleteHotelImages(currentHotel.id, namesToDelete);
        }

        toast.success("Hôtel mis à jour avec succès !");
        setIsModalOpen(false);
        fetchHotels();
      } else {
        const newHotel = await createHotel(currentHotel);
        setCreatedHotelId(newHotel.id);
        toast.success("Infos enregistrées ! Passons aux photos.");
        setCreationStep(2);
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Erreur lors de l'enregistrement");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveImages = async () => {
    if (!createdHotelId) return;
    setIsSaving(true);
    try {
      if (imageFiles.length > 0) {
        const imgFormData = new FormData();
        imageFiles.forEach(file => imgFormData.append('images', file));
        await addHotelImages(createdHotelId, imgFormData);
      }
      toast.success("Hôtel créé avec succès !");
      setIsModalOpen(false);
      fetchHotels();
    } catch (error: any) {
      console.error(error);
      toast.error("Erreur lors de l'ajout des images");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    toast(
      ({ closeToast }) => (
        <div>
          <p className="mb-2 font-medium text-sm">Supprimer cet hôtel ?</p>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" className="h-8 px-2 text-xs" onClick={closeToast}>Annuler</Button>
            <Button variant="destructive" size="sm" className="h-8 px-2 text-xs" onClick={async () => {
              try {
                await deleteHotel(id);
                toast.dismiss();
                toast.success("Hôtel supprimé !");
                fetchHotels();
              } catch (e) {
                toast.error("Erreur lors de la suppression");
              }
              closeToast();
            }}>Supprimer</Button>
          </div>
        </div>
      ),
      { position: "top-center", autoClose: false, closeOnClick: false, draggable: false }
    );
  };

  const openCreateModal = () => {
    setCurrentHotel({
      stars: 3,
      city: 'Makkah',
      type: 'makka'
    });
    setImageFiles([]);
    setDeletedImages([]);
    setCreationStep(1);
    setCreatedHotelId(null);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const openEditModal = (hotel: Hotel) => {
    setCurrentHotel({ ...hotel });
    setImageFiles([]);
    setDeletedImages([]);
    setCreationStep(1);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const currentCount = (currentHotel.images?.length || 0) + imageFiles.length;

      if (currentCount + newFiles.length > 1) {
        toast.warning("Un hôtel ne peut avoir qu'une seule image.");
        // Only add if we have space (count < 1)
        if (currentCount === 0) {
          setImageFiles([newFiles[0]]);
        }
        return;
      }
      setImageFiles([...imageFiles, ...newFiles]);
    }
  };

  const removeNewImage = (index: number) => {
    setImageFiles(imageFiles.filter((_, i) => i !== index));
  };

  const removeExistingImage = (path: string) => {
    setDeletedImages([...deletedImages, path]);
    if (currentHotel.images) {
      setCurrentHotel({
        ...currentHotel,
        images: currentHotel.images.filter(img => img !== path)
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Hôtels (Omra & Autres)</h2>
        <Button onClick={openCreateModal} className="gap-2">
          <Plus className="w-4 h-4" /> Ajouter Un Hôtel
        </Button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="p-4 font-semibold text-slate-600">Nom</th>
                <th className="p-4 font-semibold text-slate-600">Ville</th>
                <th className="p-4 font-semibold text-slate-600">Etoiles</th>
                <th className="p-4 font-semibold text-slate-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {hotels.map((hotel) => (
                <tr key={hotel.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-medium text-slate-900 flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                      <Building className="w-5 h-5" />
                    </div>
                    {hotel.name}
                  </td>
                  <td className="p-4 text-slate-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {hotel.city}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < hotel.stars ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'}`} />
                      ))}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <Button variant="ghost" size="icon" className="text-blue-400 hover:text-blue-500 hover:bg-blue-50" onClick={() => openEditModal(hotel)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-500 hover:bg-red-50" onClick={() => handleDelete(hotel.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing
                ? "Modifier l'hôtel"
                : creationStep === 1
                  ? "Ajouter un hôtel (1/2)"
                  : "Ajouter des images (2/2)"}
            </DialogTitle>
          </DialogHeader>

          {creationStep === 1 ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Nom de l'hôtel</Label>
                  <Input
                    required
                    value={currentHotel.name || ''}
                    onChange={(e) => setCurrentHotel({ ...currentHotel, name: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Type / Catégorie</Label>
                  <Select
                    value={currentHotel.type}
                    onValueChange={(val) => setCurrentHotel({ ...currentHotel, type: val })}
                  >
                    <SelectTrigger><SelectValue placeholder="Selectionner" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="makka">Makkah</SelectItem>
                      <SelectItem value="madina">Madinah</SelectItem>
                      <SelectItem value="tourisme">Tourisme</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Ville</Label>
                  <Input
                    required
                    value={currentHotel.city || ''}
                    onChange={(e) => setCurrentHotel({ ...currentHotel, city: e.target.value })}
                  />
                </div>

                <div className="col-span-2">
                  <Label>Adresse</Label>
                  <Input
                    value={currentHotel.address || ''}
                    onChange={(e) => setCurrentHotel({ ...currentHotel, address: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Nombre d'étoiles (1-5)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="5"
                    required
                    value={currentHotel.stars || 3}
                    onChange={(e) => setCurrentHotel({ ...currentHotel, stars: parseInt(e.target.value) })}
                  />
                </div>

                <div>
                  <Label>Lien Google Maps</Label>
                  <Input
                    type="url"
                    value={currentHotel.maps_url || ''}
                    onChange={(e) => setCurrentHotel({ ...currentHotel, maps_url: e.target.value })}
                  />
                </div>
              </div>

              {isEditing && (
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <Label className="font-bold flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" /> Gestion des Images
                  </Label>

                  {/* Current Images */}
                  {currentHotel.images && currentHotel.images.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {currentHotel.images.map((path, idx) => (
                        <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group">
                          <img
                            src={path.startsWith('http') ? path : `http://localhost:3000/api${path}`}
                            className="w-full h-full object-cover"
                            alt=""
                          />
                          <button
                            type="button"
                            onClick={() => removeExistingImage(path)}
                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* New Images to add while editing */}
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-500">Ajouter de nouvelles photos</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {imageFiles.map((_, idx) => (
                        <div key={idx} className="relative aspect-square rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200">
                          <ImageIcon className="w-6 h-6 text-slate-300" />
                          <button
                            type="button"
                            onClick={() => removeNewImage(idx)}
                            className="absolute -top-1 -right-1 bg-slate-800 text-white p-0.5 rounded-full"
                          >
                            <X className="w-2 h-2" />
                          </button>
                        </div>
                      ))}
                      <label className="aspect-square rounded-lg border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-slate-50 transition-all">
                        <Upload className="w-4 h-4 text-slate-400" />
                        <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                      </label>
                    </div>
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isSaving}>
                {isSaving ? <LoadingSpinner className="w-4 h-4" /> : isEditing ? "Enregistrer les modifications" : "Continuer"}
              </Button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col items-center justify-center py-8 px-4 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                <Upload className="w-12 h-12 text-slate-300 mb-4" />
                <p className="text-sm text-slate-600 font-medium mb-1">Téléverser les photos de l'hôtel</p>
                <p className="text-xs text-slate-400 mb-4 text-center">Sélectionnez une photo pour illustrer l'établissement</p>
                <Button variant="outline" size="sm" asChild>
                  <label className="cursor-pointer">
                    Choisir des fichiers
                    <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                  </label>
                </Button>
              </div>

              {imageFiles.length > 0 && (
                <div className="grid grid-cols-4 gap-3">
                  {imageFiles.map((file, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg bg-white shadow-sm border border-slate-200 overflow-hidden">
                      <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt="" />
                      <button
                        onClick={() => removeNewImage(idx)}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full shadow-lg"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>Plus tard</Button>
                <Button className="flex-1" onClick={handleSaveImages} disabled={isSaving}>
                  {isSaving ? <LoadingSpinner className="w-4 h-4" /> : "Enregistrer l'hôtel"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOmraHotelsPage;