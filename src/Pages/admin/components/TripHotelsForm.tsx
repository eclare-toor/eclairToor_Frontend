import React, { useEffect, useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Plus, Trash2, Hotel as HotelIcon, Check } from 'lucide-react';
import LoadingSpinner from '../../../components/Shared/LoadingSpinner';
import { getHotels, getTripHotels, deleteTripHotel, linkTripHotels } from '../../../api';
import type { Hotel, TripHotel } from '../../../Types';
import { toast } from 'react-toastify';

interface TripHotelLink {
    hotel_id: string;
    description?: string;
}

interface TripHotelsFormProps {
    tripId?: string;
    tripType: string;
    onSave?: (hotels: TripHotelLink[]) => void;
    onCancel: () => void;
    isSaving?: boolean;
}

const TripHotelsForm: React.FC<TripHotelsFormProps> = ({
    tripId,
    tripType,
    onSave,
    onCancel,
    isSaving: isExternalSaving
}) => {
    const [allHotels, setAllHotels] = useState<Hotel[]>([]);
    const [loadingHotels, setLoadingHotels] = useState(true);
    const [selectedHotels, setSelectedHotels] = useState<TripHotelLink[]>([]);

    // For Edit Mode
    const [existingHotels, setExistingHotels] = useState<TripHotel[]>([]);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [newHotelLink, setNewHotelLink] = useState<TripHotelLink>({ hotel_id: '', description: '' });
    const [localSaving, setLocalSaving] = useState(false);

    const isEditMode = !!tripId;
    const isReligieuse = ['religieuse', 'omra', 'tourisme religieux'].includes(tripType?.toLowerCase() || '');

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [hotelsData, tripHotelsData] = await Promise.all([
                    getHotels(),
                    tripId ? getTripHotels(tripId) : Promise.resolve([])
                ]);
                setAllHotels(hotelsData);
                if (tripId) {
                    setExistingHotels(tripHotelsData);
                }
            } catch (error) {
                console.error("Failed to load hotels", error);
                toast.error("Impossible de charger la liste des hôtels");
            } finally {
                setLoadingHotels(false);
            }
        };
        fetchAll();
    }, [tripId]);

    const handleRemoveHotelLink = (hotelId: string) => {
        if (!tripId) return;
        toast(
            ({ closeToast }) => (
                <div className="p-1">
                    <p className="mb-3 font-medium text-sm text-slate-900">
                        Voulez-vous supprimer ce lien avec l'hôtel ?
                    </p>
                    <div className="flex gap-2 justify-end">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-3 text-xs"
                            onClick={closeToast}
                        >
                            Annuler
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            className="h-8 px-3 text-xs"
                            onClick={async () => {
                                setLocalSaving(true);
                                try {
                                    await deleteTripHotel(tripId, hotelId);
                                    toast.dismiss();
                                    toast.success("Lien supprimé !");
                                    const updated = await getTripHotels(tripId);
                                    setExistingHotels(updated);
                                } catch (error) {
                                    toast.error("Erreur lors de la suppression du lien");
                                } finally {
                                    setLocalSaving(false);
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

    const handleAddHotelLink = async () => {
        if (!tripId) return;
        if (!newHotelLink.hotel_id) {
            toast.warning("Veuillez sélectionner un hôtel");
            return;
        }
        setLocalSaving(true);
        try {
            await linkTripHotels(tripId, [newHotelLink]);
            toast.success("Hôtel lié avec succès !");
            setIsAddingNew(false);
            setNewHotelLink({ hotel_id: '', description: '' });
            const updated = await getTripHotels(tripId);
            setExistingHotels(updated);
        } catch (error) {
            toast.error("Erreur lors de la liaison de l'hôtel");
        } finally {
            setLocalSaving(false);
        }
    };

    // Creation mode logic
    const handleAddHotelSlot = () => {
        setSelectedHotels([...selectedHotels, { hotel_id: '', description: '' }]);
    };

    const handleRemoveHotelSlot = (index: number) => {
        const updated = [...selectedHotels];
        updated.splice(index, 1);
        setSelectedHotels(updated);
    };

    const handleHotelChange = (index: number, hotelId: string) => {
        const updated = [...selectedHotels];
        const hotel = allHotels.find(h => h.id === hotelId);
        updated[index] = {
            ...updated[index],
            hotel_id: hotelId,
            description: updated[index].description || (hotel ? hotel.name : '')
        };
        setSelectedHotels(updated);
    };

    useEffect(() => {
        if (!isEditMode && isReligieuse && selectedHotels.length === 0 && !loadingHotels) {
            setSelectedHotels([
                { hotel_id: '', description: 'Hôtel Makkah' },
                { hotel_id: '', description: 'Hôtel Madinah' }
            ]);
        }
    }, [isReligieuse, loadingHotels, isEditMode]);

    if (loadingHotels) return <div className="py-10 flex justify-center"><LoadingSpinner /></div>;

    if (isEditMode) {
        return (
            <div className="space-y-6">
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                    <h4 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                        <HotelIcon className="w-5 h-5 text-primary" />
                        Gérer les Hôtels liés au voyage
                    </h4>

                    <div className="space-y-3">
                        {existingHotels.length > 0 ? (
                            existingHotels.map((hotel) => {
                                const hotelId = hotel.hotel_id;
                                return (
                                    <div key={hotelId} className="flex justify-between items-center bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                                                <HotelIcon className="w-5 h-5 text-slate-400" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900">{hotel.name}</p>
                                                <p className="text-xs text-slate-500 uppercase tracking-tight">{hotel.city} • {hotel.stars} Étoiles</p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50" onClick={() => handleRemoveHotelLink(hotelId)} disabled={localSaving}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-slate-500 text-sm italic py-4">Aucun hôtel n'est actuellement lié à ce voyage.</p>
                        )}

                        {isAddingNew && (
                            <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200 shadow-sm animate-in fade-in slide-in-from-top-2 space-y-4">
                                <h5 className="text-xs font-bold text-emerald-800 uppercase tracking-widest">Lier un nouvel hôtel</h5>
                                <div>
                                    <Label className="text-xs text-emerald-600 font-bold">Sélectionner un hôtel</Label>
                                    <Select
                                        value={newHotelLink.hotel_id}
                                        onValueChange={(val) => {
                                            const h = allHotels.find(x => x.id === val);
                                            setNewHotelLink({ ...newHotelLink, hotel_id: val, description: h?.name || '' });
                                        }}
                                    >
                                        <SelectTrigger className="bg-white">
                                            <SelectValue placeholder="Choisir un hôtel" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {allHotels.filter(h => !existingHotels.some(ex => ex.hotel_id === h.id)).map(hotel => (
                                                <SelectItem key={hotel.id} value={hotel.id}>{hotel.name} ({hotel.city})</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button size="sm" variant="ghost" onClick={() => setIsAddingNew(false)}>Annuler</Button>
                                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={handleAddHotelLink} disabled={localSaving}>
                                        {localSaving ? <LoadingSpinner className="w-3 h-3" /> : <Check className="w-4 h-4 mr-1" />} Lier l'hôtel
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {!isAddingNew && (
                        <Button variant="outline" className="w-full mt-4 border-dashed border-2" onClick={() => setIsAddingNew(true)}>
                            <Plus className="w-4 h-4 mr-2" /> Lier un autre hôtel
                        </Button>
                    )}
                </div>
                <Button variant="outline" className="w-full" onClick={onCancel}>Fermer</Button>
            </div>
        );
    }

    // Default Creation Mode
    return (
        <div className="space-y-6">
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                <h4 className="font-bold text-lg text-slate-900 mb-2 flex items-center gap-2">
                    <HotelIcon className="w-5 h-5 text-primary" />
                    Sélection des Hôtels
                </h4>
                <p className="text-sm text-slate-500 mb-6">
                    {isReligieuse
                        ? "Veuillez sélectionner les hôtels pour Makkah et Madinah."
                        : "Ajoutez les hôtels inclus dans ce voyage."}
                </p>

                <div className="space-y-4">
                    {selectedHotels.map((selection, index) => (
                        <div key={index} className="flex gap-4 items-start bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
                            <div className="flex-1 space-y-2">
                                <Label className="text-xs font-semibold text-slate-500 uppercase">
                                    {isReligieuse && index === 0 ? "Hôtel Makkah" :
                                        isReligieuse && index === 1 ? "Hôtel Madinah" :
                                            `Hôtel #${index + 1}`}
                                </Label>
                                <Select
                                    value={selection.hotel_id}
                                    onValueChange={(val) => handleHotelChange(index, val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choisir un hôtel" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {allHotels.map((hotel) => (
                                            <SelectItem key={hotel.id} value={hotel.id}>
                                                {hotel.name} <span className="text-slate-400 ml-2">({hotel.city})</span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {(!isReligieuse || selectedHotels.length > 2) && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="mt-8 text-slate-400 hover:text-red-500"
                                    onClick={() => handleRemoveHotelSlot(index)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    ))}
                </div>

                {!isReligieuse && (
                    <Button variant="outline" size="sm" onClick={handleAddHotelSlot} className="w-full mt-4 border-dashed">
                        <Plus className="w-3 h-3 mr-2" /> Ajouter un hôtel
                    </Button>
                )}
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-100">
                <Button variant="outline" className="w-full" onClick={onCancel}>Passer cette étape</Button>
                <Button className="w-full" onClick={() => onSave && onSave(selectedHotels)} disabled={isExternalSaving}>
                    {isExternalSaving ? <LoadingSpinner /> : "Terminer et Enregistrer"}
                </Button>
            </div>
        </div>
    );
};

export default TripHotelsForm;
