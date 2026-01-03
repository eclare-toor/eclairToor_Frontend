import React, { useEffect, useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Plus, Trash2, Hotel as HotelIcon } from 'lucide-react';
import LoadingSpinner from '../../../components/Shared/LoadingSpinner';
import { getHotels } from '../../../api';
import type { Hotel } from '../../../Types';
import { toast } from 'react-toastify';

interface TripHotelLink {
    hotel_id: string;
    description?: string;
}

interface TripHotelsFormProps {
    tripType: string;
    onSave: (hotels: TripHotelLink[]) => void;
    onCancel: () => void;
    isSaving: boolean;
}

const TripHotelsForm: React.FC<TripHotelsFormProps> = ({
    tripType,
    onSave,
    onCancel,
    isSaving
}) => {
    const [allHotels, setAllHotels] = useState<Hotel[]>([]);
    const [loadingHotels, setLoadingHotels] = useState(true);
    const [selectedHotels, setSelectedHotels] = useState<TripHotelLink[]>([]);

    useEffect(() => {
        const fetchHotels = async () => {
            try {
                const data = await getHotels();
                setAllHotels(data);
            } catch (error) {
                console.error("Failed to load hotels", error);
                toast.error("Impossible de charger la liste des hôtels");
            } finally {
                setLoadingHotels(false);
            }
        };
        fetchHotels();
    }, []);

    const handleAddHotel = () => {
        setSelectedHotels([...selectedHotels, { hotel_id: '', description: '' }]);
    };

    const handleRemoveHotel = (index: number) => {
        const updated = [...selectedHotels];
        updated.splice(index, 1);
        setSelectedHotels(updated);
    };

    const handleHotelChange = (index: number, hotelId: string) => {
        const updated = [...selectedHotels];
        // Auto-fill description with hotel name if empty?
        const hotel = allHotels.find(h => h.id === hotelId);
        updated[index] = {
            ...updated[index],
            hotel_id: hotelId,
            description: updated[index].description || (hotel ? hotel.name : '')
        };
        setSelectedHotels(updated);
    };

    const handleSubmit = () => {
        // Validation
        if (selectedHotels.some(h => !h.hotel_id)) {
            toast.warning("Veuillez sélectionner un hôtel pour chaque entrée.");
            return;
        }

        if (isReligieuse && selectedHotels.length < 2) {
            toast.warning("Pour un voyage Omra, veuillez sélectionner au moins deux hôtels (Makkah et Madinah).");
            return;
        }

        onSave(selectedHotels);
    };

    const isReligieuse = ['religieuse', 'omra'].includes(tripType?.toLowerCase() || '');

    // Initialize with 2 slots for Omra if empty
    useEffect(() => {
        if (isReligieuse && selectedHotels.length === 0 && !loadingHotels) {
            setSelectedHotels([
                { hotel_id: '', description: 'Hôtel Makkah' },
                { hotel_id: '', description: 'Hôtel Madinah' }
            ]);
        }
    }, [isReligieuse, loadingHotels]);

    if (loadingHotels) return <LoadingSpinner />;

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

                            {/* Allow removing checks only if not the mandatory Omra ones (optional enhancement, but keeping simple for now) */}
                            {(!isReligieuse || selectedHotels.length > 2) && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="mt-8 text-slate-400 hover:text-red-500"
                                    onClick={() => handleRemoveHotel(index)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    ))}
                </div>

                {!isReligieuse && (
                    <Button variant="outline" size="sm" onClick={handleAddHotel} className="w-full mt-4 border-dashed">
                        <Plus className="w-3 h-3 mr-2" /> Ajouter un hôtel
                    </Button>
                )}
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-100">
                <Button variant="outline" className="w-full" onClick={onCancel}>Passer cette étape</Button>
                <Button className="w-full" onClick={handleSubmit} disabled={isSaving}>
                    {isSaving ? <LoadingSpinner /> : "Terminer et Enregistrer"}
                </Button>
            </div>
        </div>
    );
};

export default TripHotelsForm;
