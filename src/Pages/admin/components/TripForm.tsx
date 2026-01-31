import React from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { ImageIcon, X } from '../../../components/icons';
import LoadingSpinner from '../../../components/Shared/LoadingSpinner';
import { toast } from 'react-toastify';
import type { Trip, TripType } from '../../../Types';
import { API_URL } from '../../../config/api';

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
        <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-1 md:col-span-2 space-y-2">
                    <Label className="uppercase text-xs font-black tracking-widest text-slate-500 ml-1">Titre du voyage</Label>
                    <Input
                        required
                        className="h-14 text-lg font-bold rounded-2xl border-slate-200 focus:border-primary focus:ring-primary/20 bg-slate-50/50"
                        placeholder="Ex: Escapade à Tikjda..."
                        value={currentTrip.title || ''}
                        onChange={(e) => setCurrentTrip({ ...currentTrip, title: e.target.value })}
                    />
                </div>

                <div className="space-y-2">
                    <Label className="uppercase text-xs font-black tracking-widest text-slate-500 ml-1">Type de voyage</Label>
                    <Select
                        value={currentTrip.type?.toLowerCase() || 'national'}
                        onValueChange={(val) => {
                            const newType = val as TripType;
                            const updates: Partial<Trip> = { type: newType };

                            if (['religieuse', 'omra', 'tourisme religieux'].includes(newType.toLowerCase())) {
                                updates.omra_type = currentTrip.omra_type || 'classic';
                                updates.omra_category = currentTrip.omra_category || 'classic';
                                updates.destination_country = 'Arabie Saoudite';
                            } else if (newType.toLowerCase() === 'national') {
                                updates.destination_country = 'Algérie';
                            }

                            setCurrentTrip({ ...currentTrip, ...updates });
                        }}
                    >
                        <SelectTrigger className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 text-base font-medium">
                            <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                            <SelectItem value="national" className="py-3 font-medium">National</SelectItem>
                            <SelectItem value="international" className="py-3 font-medium">International</SelectItem>
                            <SelectItem value="religieuse" className="py-3 font-medium">Omra</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label className="uppercase text-xs font-black tracking-widest text-slate-500 ml-1">
                        {['religieuse', 'omra', 'tourisme religieux'].includes(currentTrip.type?.toLowerCase() || '') ? 'Catégorie Omra' : 'Destination'}
                    </Label>
                    {(() => {
                        const type = currentTrip.type?.toLowerCase() || 'national';

                        if (type === 'international') {
                            return (
                                <Input
                                    required
                                    className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 text-base font-medium"
                                    placeholder="Ex: Turquie, Maldives..."
                                    value={currentTrip.destination_country || ''}
                                    onChange={(e) => setCurrentTrip({ ...currentTrip, destination_country: e.target.value })}
                                />
                            );
                        } else if (['religieuse', 'omra', 'tourisme religieux'].includes(type as string)) {
                            return (
                                <Select
                                    value={currentTrip.omra_type || 'classic'}
                                    onValueChange={(val: 'classic' | 'vip') => setCurrentTrip({ ...currentTrip, omra_type: val, omra_category: val })}
                                >
                                    <SelectTrigger className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 text-base font-medium w-full">
                                        <SelectValue placeholder="Choisir la catégorie" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                        <SelectItem value="classic" className="py-3 font-medium">Omra Classic</SelectItem>
                                        <SelectItem value="vip" className="py-3 font-medium">Omra VIP</SelectItem>
                                    </SelectContent>
                                </Select>
                            );
                        } else {
                            // Default to national
                            return (
                                <Input
                                    required
                                    className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 text-base font-medium"
                                    placeholder="Ex: Bejaia, Oran..."
                                    value={currentTrip.destination_wilaya || ''}
                                    onChange={(e) => setCurrentTrip({ ...currentTrip, destination_wilaya: e.target.value })}
                                />
                            );
                        }
                    })()}
                </div>

                <div className="space-y-2">
                    <Label className="uppercase text-xs font-black tracking-widest text-slate-500 ml-1">Date de début</Label>
                    <Input
                        type="date"
                        required
                        className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 text-base font-medium cursor-pointer"
                        value={currentTrip.start_date || ''}
                        onChange={(e) => setCurrentTrip({ ...currentTrip, start_date: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <Label className="uppercase text-xs font-black tracking-widest text-slate-500 ml-1">Date de fin</Label>
                    <Input
                        type="date"
                        required
                        className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 text-base font-medium cursor-pointer"
                        value={currentTrip.end_date || ''}
                        onChange={(e) => setCurrentTrip({ ...currentTrip, end_date: e.target.value })}
                    />
                </div>

                <div className="space-y-2">
                    <Label className="uppercase text-xs font-black tracking-widest text-slate-500 ml-1">Prix de base (DA)</Label>
                    <Input
                        type="number"
                        required
                        className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 text-lg font-bold text-primary"
                        placeholder="0"
                        // Handle '0' as empty string for better UX
                        value={currentTrip.base_price === 0 ? '' : currentTrip.base_price}
                        onChange={(e) => {
                            const val = e.target.value;
                            setCurrentTrip({ ...currentTrip, base_price: val === '' ? 0 : parseInt(val) });
                        }}
                    />
                </div>

                <div className="space-y-4 col-span-1 md:col-span-2 p-6 bg-emerald-50/50 rounded-[1.5rem] border border-emerald-100/50">
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="has_promotion"
                            className="w-5 h-5 rounded-lg border-emerald-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                            checked={(currentTrip.promotion || 0) > 0}
                            onChange={(e) => {
                                if (!e.target.checked) {
                                    setCurrentTrip({ ...currentTrip, promotion: 0 });
                                } else {
                                    setCurrentTrip({ ...currentTrip, promotion: 5 }); // Default to 5% if checked
                                }
                            }}
                        />
                        <Label htmlFor="has_promotion" className="uppercase text-xs font-black tracking-widest text-emerald-700 cursor-pointer">
                            Activer une promotion
                        </Label>
                    </div>

                    {(currentTrip.promotion || 0) > 0 && (
                        <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                            <Label className="uppercase text-[10px] font-black tracking-widest text-emerald-600 ml-1">Pourcentage de remise (%)</Label>
                            <Input
                                type="number"
                                className="h-14 rounded-2xl border-emerald-200 bg-white text-lg font-bold text-emerald-600 focus:border-emerald-500 focus:ring-emerald-500/20"
                                placeholder="0"
                                value={currentTrip.promotion || ''}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setCurrentTrip({ ...currentTrip, promotion: val === '' ? 0 : Math.min(100, Math.max(0, parseInt(val))) });
                                }}
                                max={100}
                                min={0}
                            />
                        </div>
                    )}
                </div>

                <div className="col-span-1 md:col-span-2 space-y-2">
                    <Label className="uppercase text-xs font-black tracking-widest text-slate-500 ml-1">Liste d'équipements</Label>
                    <Input
                        className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 text-base font-medium"
                        placeholder="Ex: Sac à dos, Chaussures de marche... (séparés par virgule)"
                        value={
                            typeof currentTrip.equipment_list === 'string'
                                ? currentTrip.equipment_list
                                : Array.isArray(currentTrip.equipment_list)
                                    ? currentTrip.equipment_list.join(', ')
                                    : ''
                        }
                        onChange={(e) => setCurrentTrip({ ...currentTrip, equipment_list: e.target.value })}
                    />
                </div>

                {/* Omra Room Options */}
                {['religieuse', 'omra', 'tourisme religieux'].includes(currentTrip.type?.toLowerCase() || '') && (
                    <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-slate-50/80 rounded-[1.5rem] border border-slate-200/50">
                        <div className="md:col-span-3">
                            <Label className="text-primary font-black uppercase tracking-widest text-xs">Options de chambre Omra (DA)</Label>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Chambre Double</Label>
                            <Input
                                type="number"
                                placeholder="Prix"
                                value={currentTrip.options?.prix_2_chmpre || ''}
                                onChange={(e) => setCurrentTrip({
                                    ...currentTrip,
                                    options: { ...currentTrip.options, prix_2_chmpre: parseInt(e.target.value) || 0 }
                                })}
                                className="h-12 bg-white rounded-xl font-bold"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Chambre Triple</Label>
                            <Input
                                type="number"
                                placeholder="Prix"
                                value={currentTrip.options?.prix_3_chmpre || ''}
                                onChange={(e) => setCurrentTrip({
                                    ...currentTrip,
                                    options: { ...currentTrip.options, prix_3_chmpre: parseInt(e.target.value) || 0 }
                                })}
                                className="h-12 bg-white rounded-xl font-bold"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Chambre Quadruple</Label>
                            <Input
                                type="number"
                                placeholder="Prix"
                                value={currentTrip.options?.prix_4_chmpre || ''}
                                onChange={(e) => setCurrentTrip({
                                    ...currentTrip,
                                    options: { ...currentTrip.options, prix_4_chmpre: parseInt(e.target.value) || 0 }
                                })}
                                className="h-12 bg-white rounded-xl font-bold"
                            />
                        </div>
                    </div>
                )}
            </div>

            <div className="space-y-2 pt-2">
                <Label className="uppercase text-xs font-black tracking-widest text-slate-500 ml-1">Description</Label>
                <Textarea
                    required
                    className="min-h-[160px] rounded-2xl border-slate-200 bg-slate-50/50 text-base p-4 resize-none leading-relaxed"
                    placeholder="Décrivez le voyage en détail ici..."
                    value={currentTrip.description || ''}
                    onChange={(e) => setCurrentTrip({ ...currentTrip, description: e.target.value })}
                />
            </div>

            {/* Image Management Section */}
            <div className="space-y-4 pt-6 border-t border-slate-100">
                <Label className="uppercase text-xs font-black tracking-widest text-slate-500 ml-1">Galerie Photos</Label>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {/* Add Button */}
                    <div className="aspect-square relative group">
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
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
                        <div className="w-full h-full rounded-2xl border-2 border-dashed border-slate-300 hover:border-primary/50 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-2 text-slate-400 group-hover:text-primary">
                            <div className="p-3 bg-slate-50 rounded-full group-hover:bg-white transition-colors">
                                <ImageIcon className="w-6 h-6" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest">Ajouter</span>
                        </div>
                    </div>

                    {/* Existing Images */}
                    {Array.isArray(currentTrip.images) && currentTrip.images.map((img, index) => (
                        <div key={`existing-${index}`} className="group relative aspect-square rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
                            <img
                                src={`${API_URL}/api${img}`}
                                alt={`Image ${index + 1}`}
                                className="w-full h-full object-cover transition-transform group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button
                                    type="button"
                                    onClick={() => onRemoveExistingImage(index)}
                                    className="bg-red-500 text-white rounded-xl p-2 hover:bg-red-600 transition-colors transform hover:scale-110 shadow-lg"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* New Images */}
                    {imageFiles.map((file, index) => (
                        <div key={`new-${index}`} className="group relative aspect-square rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
                            <img
                                src={URL.createObjectURL(file)}
                                alt={`New upload ${index + 1}`}
                                className="w-full h-full object-cover transition-transform group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button
                                    type="button"
                                    onClick={() => onRemoveNewImage(index)}
                                    className="bg-red-500 text-white rounded-xl p-2 hover:bg-red-600 transition-colors transform hover:scale-110 shadow-lg"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="absolute top-2 left-2 bg-primary text-white text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg shadow-sm">
                                Nouveau
                            </div>
                        </div>
                    ))}
                </div>
                <p className="text-[10px] text-slate-400 font-medium italic text-right">Glissez-déposez ou cliquez sur "Ajouter" pour uploader des images. Max 8 images.</p>
            </div>

            <Button type="submit" className="w-full h-16 rounded-2xl text-lg font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.01] transition-all" disabled={isSaving}>
                {isSaving ? (
                    <>
                        <LoadingSpinner className="w-5 h-5 mr-3" />
                        Traitement en cours...
                    </>
                ) : (
                    isEditing ? "Enregistrer les modifications" : "Créer le voyage (Suivant)"
                )}
            </Button>
        </form>
    );
};

export default TripForm;
