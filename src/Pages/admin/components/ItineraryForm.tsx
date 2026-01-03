import React from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';
import LoadingSpinner from '../../../components/Shared/LoadingSpinner';
import type { CreateItineraryPayload } from '../../../api';

interface ItineraryFormProps {
    newItineraries: CreateItineraryPayload[];
    setNewItineraries: (itineraries: CreateItineraryPayload[]) => void;
    onSave: () => void;
    onAddStep: () => void;
    onRemoveStep: (index: number) => void;
    onCancel: () => void;
    isSaving: boolean;
}

const ItineraryForm: React.FC<ItineraryFormProps> = ({
    newItineraries,
    setNewItineraries,
    onSave,
    onAddStep,
    onRemoveStep,
    onCancel,
    isSaving
}) => {
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
                                        setNewItineraries(updated);
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
                                        setNewItineraries(updated);
                                    }}
                                />
                            </div>
                            {newItineraries.length > 1 && (
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
                <Button className="w-full" onClick={onSave} disabled={isSaving}>
                    {isSaving ? <LoadingSpinner /> : "Terminer et Enregistrer"}
                </Button>
            </div>
        </div>
    );
};

export default ItineraryForm;
