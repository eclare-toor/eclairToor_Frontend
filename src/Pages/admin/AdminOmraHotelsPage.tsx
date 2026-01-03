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

const AdminOmraHotelsPage = () => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentHotel, setCurrentHotel] = useState<Partial<Hotel>>({});

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

    try {
      if (isEditing && currentHotel.id) {
        await updateHotel(currentHotel.id, currentHotel);
        toast.success("Hôtel modifié avec succès !");
      } else {
        await createHotel(currentHotel);
        toast.success("Hôtel créé avec succès !");
      }
      setIsModalOpen(false);
      fetchHotels();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Erreur lors de l'enregistrement de l'hôtel");
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
      type: 'Makah'
    });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const openEditModal = (hotel: Hotel) => {
    setCurrentHotel({ ...hotel });
    setIsEditing(true);
    setIsModalOpen(true);
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Modifier l'hôtel" : "Ajouter un nouvel hôtel"}</DialogTitle>
          </DialogHeader>
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
                    <SelectItem value="tourisme">tourisme</SelectItem>
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
            <Button type="submit" className="w-full">Enregistrer</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOmraHotelsPage;