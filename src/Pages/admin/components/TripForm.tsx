import React from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Image as ImageIcon, X } from 'lucide-react';
import LoadingSpinner from '../../../components/Shared/LoadingSpinner';
import { toast } from 'react-toastify';
import type { Trip, TripType } from '../../../Types';

interface TripFormProps {
    currentTrip: Partial<Trip>;
    setCurrentTrip: (trip: Partial<Trip>) => void;
    onSubmit: (e: React.FormEvent) => void;
    isSaving: boolean;
    isEditing: boolean;
    imageFiles: File[];
    setImageFiles: (files: File[]) => void;
    onRemoveExistingImage: (index: number) => void;
    onRemoveNewImage: (index: number) => void;
}

const TripForm: React.FC<TripFormProps> = ({
    currentTrip,
    setCurrentTrip,
    onSubmit,
    isSaving,
    isEditing,
    imageFiles,
    setImageFiles,
    onRemoveExistingImage,
    onRemoveNewImage
}) => {
    return (
        <form onSubmit={onSubmit} className="space-y-4">
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
                        value={currentTrip.type?.toLowerCase() || 'national'}
                        onValueChange={(val) => setCurrentTrip({ ...currentTrip, type: val as TripType })}
                    >
                        <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="national">National</SelectItem>
                            <SelectItem value="international">International</SelectItem>
                            <SelectItem value="religieuse">Omra</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <Label>{['religieuse', 'omra'].includes(currentTrip.type?.toLowerCase() || '') ? 'Catégorie Omra' : 'Destination'}</Label>
                    {(() => {
                        const type = currentTrip.type?.toLowerCase() || 'national';

                        if (type === 'international') {
                            return (
                                <Input
                                    required
                                    placeholder="Pays"
                                    value={currentTrip.destination_country || ''}
                                    onChange={(e) => setCurrentTrip({ ...currentTrip, destination_country: e.target.value })}
                                />
                            );
                        } else if (['religieuse', 'omra'].includes(type)) {
                            return (
                                <Select
                                    value={currentTrip.omra_type || 'classic'}
                                    onValueChange={(val: 'classic' | 'vip') => setCurrentTrip({ ...currentTrip, omra_type: val, omra_category: val })}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Choisir la catégorie" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="classic">Omra Classic</SelectItem>
                                        <SelectItem value="vip">Omra VIP</SelectItem>
                                    </SelectContent>
                                </Select>
                            );
                        } else {
                            // Default to national
                            return (
                                <Input
                                    required
                                    placeholder="Wilaya"
                                    value={currentTrip.destination_wilaya || ''}
                                    onChange={(e) => setCurrentTrip({ ...currentTrip, destination_wilaya: e.target.value })}
                                />
                            );
                        }
                    })()}
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

                <div className="col-span-2">
                    <Label>Liste d'équipements (Optionnel, séparés par virgule)</Label>
                    <Input
                        placeholder="Sac à dos, Chaussures de marche..."
                        value={Array.isArray(currentTrip.equipment_list) ? currentTrip.equipment_list.join(', ') : ''}
                        onChange={(e) => setCurrentTrip({ ...currentTrip, equipment_list: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
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

            {/* Image Management Section */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
                <Label className="text-base font-semibold">Gestion des Images</Label>

                {/* Existing Images */}
                {currentTrip.images && currentTrip.images.length > 0 && (
                    <div className="space-y-2">
                        <Label className="text-xs text-slate-500">Images actuelles</Label>
                        <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                            {Array.isArray(currentTrip.images) && currentTrip.images.map((img, index) => (
                                <div key={index} className="relative group rounded-lg overflow-hidden border border-slate-200 aspect-square">
                                    <img
                                        src={img.startsWith('http') ? img : `http://localhost:3000/api${img}`}
                                        alt={`Image ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => onRemoveExistingImage(index)}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* New Images Upload */}
                <div className="space-y-2">
                    <Label className="text-xs text-slate-500">Ajouter de nouvelles images</Label>
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer relative">
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={(e) => {
                                if (e.target.files) {
                                    const newFiles = Array.from(e.target.files);
                                    const currentCount = (currentTrip.images?.length || 0) + imageFiles.length;

                                    if (currentCount + newFiles.length > 8) {
                                        toast.warning("Un voyage ne peut pas avoir plus de 8 images.");
                                        const allowed = 8 - currentCount;
                                        if (allowed > 0) {
                                            setImageFiles([...imageFiles, ...newFiles.slice(0, allowed)]);
                                        }
                                        return;
                                    }
                                    setImageFiles([...imageFiles, ...newFiles]);
                                }
                            }}
                        />
                        <div className="flex flex-col items-center gap-2 text-slate-400">
                            <ImageIcon className="w-8 h-8" />
                            <span className="text-sm">Cliquez ou glissez des images ici</span>
                        </div>
                    </div>

                    {/* New Images Previews */}
                    {imageFiles.length > 0 && (
                        <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 mt-3">
                            {imageFiles.map((file, index) => (
                                <div key={index} className="relative group rounded-lg overflow-hidden border border-slate-200 aspect-square">
                                    <img
                                        src={URL.createObjectURL(file)}
                                        alt={`New upload ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => onRemoveNewImage(index)}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-100 shadow-sm"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <Button type="submit" className="w-full" disabled={isSaving}>
                {isSaving ? (
                    <>
                        <LoadingSpinner className="w-4 h-4 mr-2" />
                        Traitement...
                    </>
                ) : (
                    isEditing ? "Enregistrer les modifications" : "Créer le voyage (Suivant)"
                )}
            </Button>
        </form>
    );
};

export default TripForm;
