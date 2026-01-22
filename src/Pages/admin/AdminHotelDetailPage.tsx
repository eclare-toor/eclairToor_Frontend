import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getHotel, updateHotel, deleteHotel, addHotelImages, deleteHotelImages } from '../../api';
import type { Hotel } from '../../Types';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { ChevronLeft, Star, MapPin, Building, Calendar, Edit, Loader2, Save, X, Trash2, ImageIcon, Upload } from 'lucide-react';
import LoadingSpinner from '../../components/Shared/LoadingSpinner';
import { toast } from 'react-toastify';

const AdminHotelDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [hotel, setHotel] = useState<Hotel | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState<Partial<Hotel>>({});
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [deletedImages, setDeletedImages] = useState<string[]>([]);

    // Check if there are unsaved changes
    const isDirty = (() => {
        if (!hotel) return false;

        // Compare form data with original hotel data
        const fields: (keyof Hotel)[] = ['name', 'city', 'type', 'stars', 'address', 'maps_url'];
        const hasFieldChanges = fields.some(f => formData[f] !== hotel[f]);

        return hasFieldChanges || imageFiles.length > 0 || deletedImages.length > 0;
    })();

    // Handle browser refresh/close
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty]);

    useEffect(() => {
        const fetchHotel = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const data = await getHotel(id);
                setHotel(data);
                setFormData(data);
            } catch (error) {
                console.error(error);
                toast.error("Erreur lors du chargement de l'hôtel");
                navigate('/admin/hotels');
            } finally {
                setLoading(false);
            }
        };

        fetchHotel();
    }, [id, navigate]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!hotel || !id) return;
        setIsSaving(true);

        try {
            // 1. Update Hotel Info
            await updateHotel(id, formData);

            // 2. Add New Images if any
            if (imageFiles.length > 0) {
                const imgFormData = new FormData();
                imageFiles.forEach(file => imgFormData.append('images', file));
                await addHotelImages(id, imgFormData);
            }

            // 3. Delete Removed Images if any
            if (deletedImages.length > 0) {
                const namesToDelete = deletedImages.map(path => {
                    const parts = path.split('/');
                    return parts[parts.length - 1];
                });
                await deleteHotelImages(id, namesToDelete);
            }

            toast.success("Hôtel mis à jour !");
            setIsEditing(false);
            // Re-fetch or update local state
            const freshData = await getHotel(id);
            setHotel(freshData);
            setFormData(freshData);
            setImageFiles([]);
            setDeletedImages([]);
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Erreur lors de la sauvegarde");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!hotel || !id) return;
        if (!window.confirm("Voulez-vous vraiment supprimer cet hôtel ?")) return;

        try {
            await deleteHotel(id);
            toast.success("Hôtel supprimé !");
            navigate('/admin/hotels');
        } catch (error) {
            console.error(error);
            toast.error("Erreur lors de la suppression");
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            const currentCount = (formData.images?.length || 0) + imageFiles.length;

            if (currentCount + newFiles.length > 5) {
                toast.warning("Limite de 5 images par hôtel.");
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
        if (formData.images) {
            setFormData({
                ...formData,
                images: formData.images.filter(img => img !== path)
            });
        }
    };

    if (loading) return <div className="h-96 flex items-center justify-center"><LoadingSpinner /></div>;
    if (!hotel) return <div className="p-8 text-center bg-red-50 text-red-600 rounded-xl">Hôtel non trouvé.</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => navigate('/admin/hotels')} className="gap-2 text-slate-500 hover:text-slate-900">
                    <ChevronLeft className="w-4 h-4" /> Retour
                </Button>
                <div className="flex gap-3">
                    {!isEditing ? (
                        <>
                            <Button variant="outline" onClick={() => setIsEditing(true)} className="gap-2 border-primary/20 hover:border-primary text-primary">
                                <Edit className="w-4 h-4" /> Modifier
                            </Button>
                            <Button variant="destructive" onClick={handleDelete} className="gap-2">
                                <Trash2 className="w-4 h-4" /> Supprimer
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="ghost" onClick={() => {
                                setIsEditing(false);
                                setFormData(hotel);
                                setImageFiles([]);
                                setDeletedImages([]);
                            }} className="text-slate-500">
                                <X className="w-4 h-4 mr-2" /> Annuler
                            </Button>
                            <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Enregistrer
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column: Info Card */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-4 bg-primary/5 rounded-2xl text-primary">
                                    <Building className="w-8 h-8" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                                        {isEditing ? (
                                            <Input
                                                className="text-2xl font-black h-auto py-1 px-2 border-none focus-visible:ring-1 focus-visible:ring-primary/20 bg-slate-50"
                                                value={formData.name || ''}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        ) : hotel.name}
                                    </h1>
                                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1 flex items-center gap-2">
                                        <MapPin className="w-3 h-3" />
                                        {hotel.city} • {hotel.type}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Ville</Label>
                                    {isEditing ? (
                                        <Input
                                            value={formData.city || ''}
                                            onChange={e => setFormData({ ...formData, city: e.target.value })}
                                            className="bg-slate-50 border-none rounded-xl"
                                        />
                                    ) : (
                                        <p className="font-bold text-slate-700">{hotel.city}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Type / Catégorie</Label>
                                    {isEditing ? (
                                        <Select
                                            value={formData.type}
                                            onValueChange={(val) => setFormData({ ...formData, type: val as any })}
                                        >
                                            <SelectTrigger className="bg-slate-50 border-none rounded-xl">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="makka">Makkah</SelectItem>
                                                <SelectItem value="madina">Madinah</SelectItem>
                                                <SelectItem value="tourisme">Tourisme</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <p className="font-bold text-slate-700 uppercase">{hotel.type || 'Non spécifié'}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Etoiles</Label>
                                    {isEditing ? (
                                        <Input
                                            type="number"
                                            min="1"
                                            max="5"
                                            value={formData.stars || 3}
                                            onChange={e => setFormData({ ...formData, stars: parseInt(e.target.value) })}
                                            className="bg-slate-50 border-none rounded-xl"
                                        />
                                    ) : (
                                        <div className="flex gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`w-4 h-4 ${i < (hotel.stars || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'}`} />
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Adresse</Label>
                                    {isEditing ? (
                                        <Input
                                            value={formData.address || ''}
                                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                                            className="bg-slate-50 border-none rounded-xl"
                                        />
                                    ) : (
                                        <p className="font-bold text-slate-700">{hotel.address || 'Aucune adresse'}</p>
                                    )}
                                </div>

                                <div className="md:col-span-2 space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Google Maps</Label>
                                    {isEditing ? (
                                        <Input
                                            type="url"
                                            value={formData.maps_url || ''}
                                            onChange={e => setFormData({ ...formData, maps_url: e.target.value })}
                                            placeholder="https://goo.gl/maps/..."
                                            className="bg-slate-50 border-none rounded-xl"
                                        />
                                    ) : (
                                        hotel.maps_url ? (
                                            <a href={hotel.maps_url} target="_blank" rel="noreferrer" className="text-primary hover:underline font-bold text-sm block truncate">
                                                {hotel.maps_url}
                                            </a>
                                        ) : (
                                            <p className="text-slate-400 text-sm">Non renseigné</p>
                                        )
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Images */}
                <div className="space-y-6">
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 block">Images</Label>

                        <div className="grid grid-cols-1 gap-4">
                            {/* Existing Images */}
                            {formData.images?.map((path, idx) => (
                                <div key={idx} className="relative aspect-video rounded-3xl overflow-hidden group shadow-lg">
                                    <img
                                        src={path.startsWith('http') ? path : `http://localhost:3000/api${path}`}
                                        className="w-full h-full object-cover"
                                        alt=""
                                    />
                                    {isEditing && (
                                        <button
                                            type="button"
                                            onClick={() => removeExistingImage(path)}
                                            className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-2xl shadow-xl hover:scale-110 transition-transform"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}

                            {/* New Images */}
                            {imageFiles.map((file, idx) => (
                                <div key={idx} className="relative aspect-video rounded-3xl overflow-hidden group shadow-lg border-2 border-primary/20">
                                    <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt="" />
                                    <button
                                        type="button"
                                        onClick={() => removeNewImage(idx)}
                                        className="absolute top-3 right-3 bg-slate-900/80 text-white p-2 rounded-2xl backdrop-blur-md shadow-xl hover:scale-110 transition-transform"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}

                            {/* Upload Placeholder */}
                            {isEditing && (
                                <label className="aspect-video rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-slate-50 transition-all group">
                                    <div className="p-3 bg-primary/5 rounded-2xl text-primary group-hover:scale-110 transition-transform">
                                        <Upload className="w-6 h-6" />
                                    </div>
                                    <span className="text-xs font-black text-slate-400 mt-3 uppercase tracking-widest">Ajouter une photo</span>
                                    <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                                </label>
                            )}

                            {(!hotel.images || hotel.images.length === 0) && !isEditing && (
                                <div className="aspect-video rounded-3xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center text-slate-300">
                                    <ImageIcon className="w-12 h-12 mb-2 opacity-20" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">Aucune image</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white">
                        <div className="flex items-center gap-3 mb-4">
                            <Calendar className="w-5 h-5 text-primary" />
                            <h3 className="font-black text-xs uppercase tracking-widest">Historique</h3>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Créé le</p>
                                <p className="text-sm font-bold">{hotel.created_at ? new Date(hotel.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) : 'N/A'}</p>
                            </div>
                            {hotel.updated_at && (
                                <div>
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Dernière modification</p>
                                    <p className="text-sm font-bold">{new Date(hotel.updated_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminHotelDetailPage;
