import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    getTrip,
    updateTrip,
    addTripImages,
    deleteTripImages
} from '../../api';
import type { Trip } from '../../Types';
import { Button } from '../../components/ui/button';
import { ChevronLeft, Info, ListChecks, Hotel as HotelIcon, MapPin } from 'lucide-react';
import LoadingSpinner from '../../components/Shared/LoadingSpinner';
import TripForm from './components/TripForm';
import ItineraryForm from './components/ItineraryForm';
import TripHotelsForm from './components/TripHotelsForm';

const AdminTripDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const [trip, setTrip] = useState<Trip | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const initialTab = (location.state as any)?.activeTab || 'info';
    const [activeTab, setActiveTab] = useState<'info' | 'itinerary' | 'hotels'>(initialTab);

    // Form states (reusing the logic from AdminTripsPage but adapted)
    const [editTrip, setEditTrip] = useState<Partial<Trip>>({});
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [deletedImages, setDeletedImages] = useState<string[]>([]);

    const fetchTripDetails = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const tripData = await getTrip(id);
            if (!tripData) throw new Error("Voyage non trouvé");
            setTrip(tripData);
            // Initialize edit state
            const safeDate = (dateStr: string | undefined) => {
                if (!dateStr) return '';
                const d = new Date(dateStr);
                return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
            };
            setEditTrip({
                ...tripData,
                start_date: safeDate(tripData.start_date),
                end_date: safeDate(tripData.end_date),
            });
        } catch (error) {
            console.error('Error fetching trip:', error);
            toast.error('Erreur lors du chargement du voyage');
            navigate('/admin/voyages');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTripDetails();
    }, [id]);

    const handleUpdateTrip = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id || !trip) return;
        setIsSaving(true);
        try {
            const updatePayload: any = {};
            let hasInfoChanges = false;

            // Compare simple fields
            const fields: (keyof Trip)[] = ['title', 'description', 'base_price', 'type', 'destination_wilaya', 'destination_country', 'omra_category', 'omra_type'];
            fields.forEach(f => {
                if ((editTrip as any)[f] !== (trip as any)[f]) {
                    updatePayload[f] = (editTrip as any)[f];
                    hasInfoChanges = true;
                }
            });

            // Dates
            const currentStart = editTrip.start_date;
            const originalStart = trip.start_date ? new Date(trip.start_date).toISOString().split('T')[0] : '';
            if (currentStart !== originalStart) {
                updatePayload.start_date = currentStart;
                hasInfoChanges = true;
            }

            const currentEnd = editTrip.end_date;
            const originalEnd = trip.end_date ? new Date(trip.end_date).toISOString().split('T')[0] : '';
            if (currentEnd !== originalEnd) {
                updatePayload.end_date = currentEnd;
                hasInfoChanges = true;
            }

            // Complex fields
            const processEquipment = (list: string[] | string | undefined) => {
                if (!list) return [];
                if (typeof list === 'string') {
                    return list.split(',').map(s => s.trim()).filter(Boolean);
                }
                return list;
            };

            const newEquipment = processEquipment(editTrip.equipment_list);
            const oldEquipment = processEquipment(trip.equipment_list);

            if (JSON.stringify(newEquipment) !== JSON.stringify(oldEquipment)) {
                updatePayload.equipment_list = newEquipment;
                hasInfoChanges = true;
            }

            if (JSON.stringify(editTrip.options) !== JSON.stringify(trip.options)) {
                updatePayload.options = editTrip.options;
                hasInfoChanges = true;
            }

            if (hasInfoChanges) {
                await updateTrip(id, updatePayload);
            }

            if (imageFiles.length > 0) {
                const imgFormData = new FormData();
                imageFiles.forEach(file => imgFormData.append('images', file));
                await addTripImages(id, imgFormData);
            }

            if (deletedImages.length > 0) {
                const namesToDelete = deletedImages.map(path => {
                    const parts = path.split('/');
                    return parts[parts.length - 1];
                });
                await deleteTripImages(id, namesToDelete);
            }

            if (hasInfoChanges || imageFiles.length > 0 || deletedImages.length > 0) {
                toast.success("Voyage mis à jour avec succès");
                fetchTripDetails();
                setImageFiles([]);
                setDeletedImages([]);
            } else {
                toast.info("Aucune modification détectée");
            }
        } catch (error: any) {
            toast.error(error.message || "vs lors de la mise à jour");
        } finally {
            setIsSaving(false);
        }
    };

    const onRemoveExistingImage = (index: number) => {
        if (!editTrip.images) return;
        const updatedImages = [...editTrip.images];
        const imageToRemove = updatedImages[index];
        updatedImages.splice(index, 1);
        setEditTrip({ ...editTrip, images: updatedImages });
        setDeletedImages([...deletedImages, imageToRemove]);
    };

    if (loading) return <div className="flex justify-center items-center h-screen"><LoadingSpinner /></div>;
    if (!trip) return null;

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" className="rounded-full h-12 w-12 shrink-0 shadow-sm border-slate-200" onClick={() => navigate('/admin/voyages')}>
                        <ChevronLeft className="w-6 h-6" />
                    </Button>
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">{trip.title}</h2>
                        <div className="flex items-center gap-3 text-slate-500 font-medium mt-1">
                            <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {trip.destination_wilaya || trip.destination_country || trip.omra_category}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1.5 text-primary bg-primary/5 px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider">{trip.type}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex bg-slate-100 p-1 rounded-2xl w-fit mb-8">
                {(['info', 'itinerary', 'hotels'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex items-center rounded-xl px-6 py-2.5 font-bold transition-all ${activeTab === tab
                            ? "bg-white text-slate-900 shadow-sm"
                            : "text-slate-500 hover:text-slate-900"
                            }`}
                    >
                        {tab === 'info' && <Info className="w-4 h-4 mr-2" />}
                        {tab === 'itinerary' && <ListChecks className="w-4 h-4 mr-2" />}
                        {tab === 'hotels' && <HotelIcon className="w-4 h-4 mr-2" />}
                        {tab.charAt(0).toUpperCase() + tab.slice(1) === 'Info' ? 'Informations' :
                            tab.charAt(0).toUpperCase() + tab.slice(1) === 'Itinerary' ? 'Itinéraire' : 'Hébergement'}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                {activeTab === 'info' && (
                    <div className="p-8">
                        <TripForm
                            currentTrip={editTrip}
                            setCurrentTrip={setEditTrip}
                            onSubmit={handleUpdateTrip}
                            isSaving={isSaving}
                            isEditing={true}
                            imageFiles={imageFiles}
                            setImageFiles={setImageFiles}
                            onRemoveExistingImage={onRemoveExistingImage}
                            onRemoveNewImage={(idx) => {
                                const updated = [...imageFiles];
                                updated.splice(idx, 1);
                                setImageFiles(updated);
                            }}
                        />
                    </div>
                )}

                {activeTab === 'itinerary' && (
                    <div className="p-8">
                        <div className="space-y-6">
                            <h3 className="text-xl font-black text-slate-900">Plan de voyage</h3>
                            <ItineraryForm
                                tripId={trip.id}
                                onCancel={() => navigate('/admin/voyages')}
                            />
                        </div>
                    </div>
                )}

                {activeTab === 'hotels' && (
                    <div className="p-8">
                        <div className="space-y-6">
                            <h3 className="text-xl font-black text-slate-900">Liste des hôtels</h3>
                            <TripHotelsForm
                                tripId={trip.id}
                                tripType={trip.type}
                                onCancel={() => navigate('/admin/voyages')}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminTripDetailPage;
