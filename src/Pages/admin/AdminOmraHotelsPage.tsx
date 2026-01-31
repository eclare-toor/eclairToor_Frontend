import React, { useEffect, useState } from 'react';
import type { Hotel } from '../../Types';
import { getHotels, createHotel, deleteHotel, updateHotel } from '../../api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Plus, Trash2, MapPin, Star, Building } from '../../components/icons';
import LoadingSpinner from '../../components/Shared/LoadingSpinner';
import { toast } from 'react-toastify';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { addHotelImages, deleteHotelImages } from '../../api';
import { X, ImageIcon, Upload } from '../../components/icons';
import { API_URL } from '../../config/api';
import { useNavigate } from 'react-router-dom';

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
  const [activeTab, setActiveTab] = useState<'makka' | 'madina' | 'tourisme'>('makka');

  const navigate = useNavigate();

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
        <div className="p-2">
          <p className="mb-4 font-bold text-slate-900">Supprimer cet hôtel ?</p>
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" size="sm" className="font-black uppercase tracking-widest text-[10px]" onClick={closeToast}>Annuler</Button>
            <Button variant="destructive" size="sm" className="font-black uppercase tracking-widest text-[10px] shadow-lg shadow-red-200" onClick={async () => {
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
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-4">
        <div className="flex-1">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none">
            Gestion des <span className="text-primary italic">Hôtels</span>
          </h2>
          <p className="text-slate-500 font-bold mt-2 uppercase tracking-widest text-[10px]">Hébergements et Services</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="px-6 py-3 bg-gradient-to-br from-slate-900 to-slate-700 rounded-2xl shadow-lg shadow-slate-200">
            <p className="text-[9px] font-black uppercase 0.2em] text-white/70 mb-1">Total Hôtels</p>
            <p className="text-3xl font-black text-white">{hotels.length}</p>
          </div>

          <Button onClick={openCreateModal} className="h-14 px-8 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest shadow-xl transition-all hover:scale-[1.02] flex items-center gap-3">
            <div className="p-1.5 bg-white/10 rounded-lg">
              <Plus className="w-4 h-4" />
            </div>
            Ajouter Un Hôtel
          </Button>
        </div>
      </div>

      {/* Tabs for Hotel Types */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setActiveTab('makka')}
          className={`px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-sm transition-all ${activeTab === 'makka'
            ? 'bg-primary text-white shadow-lg shadow-primary/20'
            : 'bg-white text-slate-400 hover:text-slate-900 border border-slate-100'
            }`}
        >
          Makkah ({hotels.filter(h => h.type === 'makka').length})
        </button>
        <button
          onClick={() => setActiveTab('madina')}
          className={`px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-sm transition-all ${activeTab === 'madina'
            ? 'bg-primary text-white shadow-lg shadow-primary/20'
            : 'bg-white text-slate-400 hover:text-slate-900 border border-slate-100'
            }`}
        >
          Madinah ({hotels.filter(h => h.type === 'madina').length})
        </button>
        <button
          onClick={() => setActiveTab('tourisme')}
          className={`px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-sm transition-all ${activeTab === 'tourisme'
            ? 'bg-primary text-white shadow-lg shadow-primary/20'
            : 'bg-white text-slate-400 hover:text-slate-900 border border-slate-100'
            }`}
        >
          Tourisme ({hotels.filter(h => h.type === 'tourisme').length})
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-20"><LoadingSpinner /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hotels.filter(hotel => hotel.type === activeTab).map((hotel) => (
            <div
              key={hotel.id}
              onClick={() => navigate(`/admin/hotels/${hotel.id}`)}
              className="group relative bg-white rounded-[2.5rem] border border-slate-100 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 cursor-pointer overflow-hidden"
            >
              {/* Image Preview / Header */}
              <div className="h-48 overflow-hidden relative">
                {hotel.images && hotel.images.length > 0 ? (
                  <img
                    src={hotel.images[0].startsWith('http') ? `${API_URL}/api${hotel.images[0]}` : `http://localhost:3000/api${hotel.images[0]}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    alt={hotel.name}
                  />
                ) : (
                  <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-200">
                    <Building className="w-12 h-12" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="absolute top-4 right-4 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(hotel.id);
                    }}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/20 backdrop-blur-md text-white hover:bg-red-500 transition-all duration-300 shadow-xl border border-white/20"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="absolute bottom-4 left-4 flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-3 h-3 ${i < hotel.stars ? 'text-yellow-400 fill-yellow-400' : 'text-white/30'}`} />
                  ))}
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-1">
                  <h3 className="font-black text-xl text-slate-900 group-hover:text-primary transition-colors leading-tight line-clamp-1">
                    {hotel.name}
                  </h3>
                  <div className="flex items-center gap-2 text-slate-400 font-bold uppercase 0.15em] text-[10px]">
                    <MapPin className="w-3 h-3 text-primary" />
                    {hotel.city} <span className="text-slate-200">|</span> {hotel.type}
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
                  <div className="px-3 py-1 bg-slate-50 rounded-lg text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    Quick Info
                  </div>
                  <div className="text-[10px] font-black text-primary uppercase tracking-widest italic opacity-0 group-hover:opacity-100 transition-opacity">
                    Voir détails →
                  </div>
                </div>
              </div>

              {/* Hover Effect Line */}
              <div className="absolute bottom-0 left-0 h-1.5 w-0 bg-primary transition-all duration-500 group-hover:w-full" />
            </div>
          ))}
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
                            src={path.startsWith('http') ? `${API_URL}/api${path}` : `http://localhost:3000/api${path}`}
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