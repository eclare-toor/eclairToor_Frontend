import React, { useEffect, useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Plus, Trash2, Edit2, Check, X } from '../../../components/icons';
import LoadingSpinner from '../../../components/Shared/LoadingSpinner';
import { getTripItinerary, updateTripItinerary, createTripItineraries, deleteAllTripItineraries, type CreateItineraryPayload } from '../../../api';
import type { TripItinerary } from '../../../Types';
import { toast } from 'react-toastify';

interface ItineraryFormProps {
    tripId?: string;
    newItineraries?: CreateItineraryPayload[];
    setNewItineraries?: (itineraries: CreateItineraryPayload[]) => void;
    onSave?: (itineraries: CreateItineraryPayload[]) => void;
    onAddStep?: () => void;
    onRemoveStep?: (index: number) => void;
    onCancel: () => void;
    isSaving?: boolean;
}

const ItineraryForm: React.FC<ItineraryFormProps> = ({
    tripId,
    newItineraries = [],
    setNewItineraries,
    onSave,
    onAddStep,
    onRemoveStep,
    onCancel,
    isSaving: isExternalSaving
}) => {
    const [existingItineraries, setExistingItineraries] = useState<TripItinerary[]>([]);
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<CreateItineraryPayload>>({});
    const [localSaving, setLocalSaving] = useState(false);

    const isEditMode = !!tripId;

    useEffect(() => {
        if (isEditMode) {
            fetchItineraries();
        }
    }, [tripId]);

    const fetchItineraries = async () => {
        if (!tripId) return;
        setLoading(true);
        try {
            const data = await getTripItinerary(tripId);
            setExistingItineraries(data);
        } catch (error) {
            toast.error("Erreur lors du chargement de l'itinéraire");
        } finally {
            setLoading(false);
        }
    };

    const handleEditStart = (item: TripItinerary) => {
        setEditingId(item.id);
        const dateStr = item.day_date ? new Date(item.day_date).toISOString().split('T')[0] : '';
        setEditForm({
            day_date: dateStr,
            activities: Array.isArray(item.activities) ? item.activities.join('\n') : item.activities
        });
    };

    const handleUpdate = async (itineraryId: string) => {
        if (!tripId) return;
        setLocalSaving(true);
        try {
            await updateTripItinerary(tripId, itineraryId, editForm);
            toast.success("Étape mise à jour !");
            setEditingId(null);
            fetchItineraries();
        } catch (error) {
            toast.error("Erreur lors de la mise à jour");
        } finally {
            setLocalSaving(false);
        }
    };


    const handleDeleteAll = () => {
        if (!tripId) return;
        toast(
            ({ closeToast }) => (
                <div className="p-1">
                    <p className="mb-3 font-medium text-sm text-slate-900">
                        Êtes-vous sûr de vouloir supprimer <span className="font-bold text-red-600">TOUT l'itinéraire</span> de ce voyage ? Cette action est irréversible.
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
                                    await deleteAllTripItineraries(tripId);
                                    toast.dismiss();
                                    toast.success("Itinéraire complet supprimé !");
                                    fetchItineraries();
                                } catch (error) {
                                    toast.error("Erreur lors de la suppression");
                                } finally {
                                    setLocalSaving(false);
                                }
                                closeToast();
                            }}
                        >
                            Confirmer la suppression
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

    const [isAddingNew, setIsAddingNew] = useState(false);
    const [newItem, setNewItem] = useState<CreateItineraryPayload>({ day_date: '', activities: '' });

    const handleAddNew = async () => {
        if (!tripId) return;
        if (!newItem.day_date || !newItem.activities) {
            toast.warning("Veuillez remplir tous les champs");
            return;
        }
        setLocalSaving(true);
        try {
            await createTripItineraries(tripId, [newItem]);
            toast.success("Étape ajoutée !");
            setIsAddingNew(false);
            setNewItem({ day_date: '', activities: '' });
            fetchItineraries();
        } catch (error) {
            toast.error("Erreur lors de l'ajout");
        } finally {
            setLocalSaving(false);
        }
    };

    if (loading) return <div className="py-10 flex justify-center"><LoadingSpinner /></div>;

    if (isEditMode) {
        return (
            <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold text-slate-800">Modifier l'itinéraire du voyage</h4>
                        {existingItineraries.length > 0 && (
                            <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50 text-xs gap-1" onClick={handleDeleteAll} disabled={localSaving}>
                                <Trash2 className="w-3 h-3" /> Tout Supprimer
                            </Button>
                        )}
                    </div>

                    <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                        {existingItineraries.map((item) => (
                            <div key={item.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm transition-all">
                                {editingId === item.id ? (
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-1 gap-3">
                                            <div>
                                                <Label className="text-xs font-bold text-slate-500 uppercase">Date</Label>
                                                <Input
                                                    type="date"
                                                    value={editForm.day_date}
                                                    onChange={e => setEditForm({ ...editForm, day_date: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-xs font-bold text-slate-500 uppercase">Activités</Label>
                                                <Textarea
                                                    value={editForm.activities}
                                                    onChange={e => setEditForm({ ...editForm, activities: e.target.value })}
                                                    className="min-h-[100px]"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex justify-end gap-2">
                                            <Button size="sm" variant="outline" onClick={() => setEditingId(null)}><X className="w-4 h-4 mr-1" /> Annuler</Button>
                                            <Button size="sm" onClick={() => handleUpdate(item.id)} disabled={localSaving}>
                                                {localSaving ? <LoadingSpinner className="w-3 h-3" /> : <Check className="w-4 h-4 mr-1" />} Enregistrer
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <p className="font-bold text-primary">{new Date(item.day_date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                                            <p className="text-sm text-slate-600 line-clamp-2">{Array.isArray(item.activities) ? item.activities.join(', ') : item.activities}</p>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500" onClick={() => handleEditStart(item)}><Edit2 className="w-4 h-4" /></Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}

                        {isAddingNew && (
                            <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200 shadow-sm animate-in fade-in slide-in-from-top-2">
                                <div className="space-y-3">
                                    <h5 className="text-sm font-bold text-emerald-800 uppercase tracking-wider">Nouvelle Étape</h5>
                                    <div>
                                        <Label className="text-xs font-bold text-emerald-600">Date</Label>
                                        <Input type="date" value={newItem.day_date} onChange={e => setNewItem({ ...newItem, day_date: e.target.value })} />
                                    </div>
                                    <div>
                                        <Label className="text-xs font-bold text-emerald-600">Activités</Label>
                                        <Textarea placeholder="Décrivez les activités..." value={newItem.activities} onChange={e => setNewItem({ ...newItem, activities: e.target.value })} />
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <Button size="sm" variant="ghost" onClick={() => setIsAddingNew(false)}>Annuler</Button>
                                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={handleAddNew} disabled={localSaving}>
                                            {localSaving ? <LoadingSpinner className="w-3 h-3" /> : <Plus className="w-4 h-4 mr-1" />} Ajouter
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {!isAddingNew && (
                        <Button variant="outline" className="w-full mt-4 border-dashed border-2" onClick={() => setIsAddingNew(true)}>
                            <Plus className="w-4 h-4 mr-2" /> Ajouter un jour à l'itinéraire
                        </Button>
                    )}
                </div>

                <Button variant="outline" className="w-full" onClick={onCancel}>Fermer</Button>
            </div>
        );
    }

    // Default Creation Mode (Keep existing logic or similar)
    return (
        <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h4 className="font-semibold mb-2 text-sm text-slate-700">Détails de l'itinéraire</h4>
                <p className="text-xs text-slate-500 mb-4">Ajoutez les activités pour chaque jour du voyage.</p>

                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                    {newItineraries.map((item, index) => (
                        <div key={index} className="flex gap-2 items-start bg-white p-3 rounded border border-slate-100 shadow-sm">
                            <div className="w-1/3 space-y-1">
                                <Label className="text-xs">Date</Label>
                                <Input
                                    type="date"
                                    value={item.day_date}
                                    onChange={(e) => {
                                        const updated = [...newItineraries];
                                        updated[index].day_date = e.target.value;
                                        setNewItineraries && setNewItineraries(updated);
                                    }}
                                />
                            </div>
                            <div className="w-2/3 space-y-1">
                                <Label className="text-xs">Activités</Label>
                                <Textarea
                                    placeholder="Visite guidée, déjeuner..."
                                    className="min-h-[80px]"
                                    value={item.activities}
                                    onChange={(e) => {
                                        const updated = [...newItineraries];
                                        updated[index].activities = e.target.value;
                                        setNewItineraries && setNewItineraries(updated);
                                    }}
                                />
                            </div>
                            {newItineraries.length > 1 && onRemoveStep && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="mt-6 text-slate-400 hover:text-red-500"
                                    onClick={() => onRemoveStep(index)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    ))}
                </div>

                <Button variant="outline" size="sm" onClick={onAddStep} className="w-full mt-2 border-dashed">
                    <Plus className="w-3 h-3 mr-2" /> Ajouter un jour
                </Button>
            </div>

            <div className="flex gap-3">
                <Button variant="outline" className="w-full" onClick={onCancel}>Passer cette étape</Button>
                <Button className="w-full" onClick={() => onSave && onSave(newItineraries)} disabled={isExternalSaving}>
                    {isExternalSaving ? <LoadingSpinner /> : "Terminer et Enregistrer"}
                </Button>
            </div>
        </div>
    );
};

export default ItineraryForm;
