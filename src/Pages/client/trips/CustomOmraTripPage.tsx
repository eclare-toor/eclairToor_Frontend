import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCustomTripRequest, getHotelsByType } from '../../../api';
import type { CustomOmraRequestPayload } from '../../../api';
import type { Hotel } from '../../../Types';
import { toast } from 'react-toastify';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Calendar, Clock, MapPin, Coffee, Bus, ArrowRight, Moon, Star, Info, CheckCircle2 } from '../../../components/icons';
import LoadingSpinner from '../../../components/Shared/LoadingSpinner';
import { useTranslation } from 'react-i18next';
import { API_URL } from '../../../config/api';
const CustomOmraTripPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [loadingHotels, setLoadingHotels] = useState(true);
    const [makkaHotels, setMakkaHotels] = useState<Hotel[]>([]);
    const [madinaHotels, setMadinaHotels] = useState<Hotel[]>([]);

    const [formData, setFormData] = useState({
        duree: 15,
        date_debut: '',
        hebergement_makka: '',
        hebergement_madina: '',
        options: {
            restauration: 'demi-pension',
            transport: 'bus confort'
        }
    });

    useEffect(() => {
        const fetchHotels = async () => {
            try {
                const [makka, madina] = await Promise.all([
                    getHotelsByType('makka'),
                    getHotelsByType('madina')
                ]);
                setMakkaHotels(makka);
                setMadinaHotels(madina);
            } catch (error) {
                console.error("Failed to load hotels", error);
                toast.error(t('custom_omra.error_hotels'));
            } finally {
                setLoadingHotels(false);
            }
        };
        fetchHotels();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.hebergement_makka || !formData.hebergement_madina) {
            toast.warning(t('custom_omra.error_select_hotels'));
            return;
        }

        setLoading(true);

        try {
            const payload: CustomOmraRequestPayload = {
                category: 'omra',
                details: {
                    duree: Number(formData.duree),
                    date_debut: formData.date_debut,
                    hebergement_makka: formData.hebergement_makka,
                    hebergement_madina: formData.hebergement_madina,
                    options: {
                        restauration: formData.options.restauration,
                        transport: formData.options.transport
                    }
                }
            };

            await createCustomTripRequest(payload);
            toast.success(t('custom_omra.success'));
            navigate('/mon-compte', { state: { activeTab: 'requests' } });

        } catch (error: any) {
            console.error(error);
            toast.error(error.message || t('common.error'));
        } finally {
            setLoading(false);
        }
    };

    const HotelCard = ({ hotel, selected, onSelect }: { hotel: Hotel, selected: boolean, onSelect: () => void }) => (
        <div
            onClick={onSelect}
            className={`cursor-pointer group relative rounded-2xl border transition-all duration-300 overflow-hidden ${selected ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500 ring-offset-2' : 'border-slate-200 bg-white hover:border-emerald-300 hover:shadow-lg'}`}
        >
            <div className="aspect-video bg-slate-100 relative overflow-hidden">
                {hotel.images && hotel.images.length > 0 ? (
                    <img src={`${API_URL}/api${hotel.images[0]}`} alt={hotel.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100">
                        <Moon className="w-10 h-10 opacity-20" />
                    </div>
                )}
                {selected && (
                    <div className="absolute top-2 right-2 bg-emerald-500 text-white p-1.5 rounded-full shadow-lg">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                )}
            </div>
            <div className="p-4 space-y-2">
                <div className="flex justify-between items-start">
                    <h3 className="font-bold text-slate-900 line-clamp-1">{hotel.name}</h3>
                    <div className="flex items-center gap-0.5 text-amber-400 text-xs font-bold bg-amber-50 px-1.5 py-0.5 rounded-md">
                        <span>{hotel.stars}</span>
                        <Star className="w-3 h-3 fill-current" />
                    </div>
                </div>
                {hotel.address && (
                    <p className="text-xs text-slate-500 flex items-center gap-1 line-clamp-1">
                        <MapPin className="w-3 h-3" /> {hotel.address}
                    </p>
                )}
                {hotel.maps_url && (
                    <a
                        href={hotel.maps_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-1"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Info className="w-3 h-3" /> {t('custom_omra.view_on_map')}
                    </a>
                )}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-transparent pt-40 pb-12 px-4">
            <div className="container mx-auto max-w-4xl">

                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mb-4">
                        <Moon className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-heading font-bold text-slate-900 mb-4">
                        {t('custom_omra.title')}
                    </h1>
                    <p className="text-slate-600 max-w-2xl mx-auto">
                        {t('custom_omra.subtitle')}
                    </p>
                </div>

                <div className="bg-white/70 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl shadow-blue-900/10 border border-white/50 overflow-hidden">
                    <div className="h-2 bg-gradient-to-r from-emerald-500 to-emerald-700"></div>

                    <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-8">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl">
                            {/* Date Début */}
                            <div className="space-y-2">
                                <Label htmlFor="date_debut" className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-emerald-600" /> {t('custom_omra.date_debut')}
                                </Label>
                                <Input
                                    id="date_debut"
                                    type="date"
                                    value={formData.date_debut}
                                    onChange={(e) => setFormData({ ...formData, date_debut: e.target.value })}
                                    required
                                    className="h-12 border-slate-200 focus:border-emerald-500 block w-full bg-white"
                                />
                            </div>

                            {/* Durée */}
                            <div className="space-y-2">
                                <Label htmlFor="duree" className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-emerald-600" /> {t('custom_omra.duree')}
                                </Label>
                                <Input
                                    id="duree"
                                    type="number"
                                    min="7"
                                    max="30"
                                    value={formData.duree}
                                    onChange={(e) => setFormData({ ...formData, duree: parseInt(e.target.value) || 0 })}
                                    required
                                    className="h-12 border-slate-200 focus:border-emerald-500 bg-white"
                                />
                            </div>
                        </div>

                        {/* Hotel Selection Section */}
                        {loadingHotels ? (
                            <div className="py-12 flex justify-center flex-col items-center gap-4">
                                <LoadingSpinner />
                                <p className="text-slate-500 animate-pulse">{t('custom_omra.loading_hotels')}</p>
                            </div>
                        ) : (
                            <div className="space-y-10">
                                {/* Makkah Hotels */}
                                <div className="space-y-4">
                                    <Label className="flex items-center gap-2 text-lg font-bold text-slate-800 border-b pb-2">
                                        <MapPin className="w-5 h-5 text-emerald-600" /> {t('custom_omra.makka_hotels')}
                                    </Label>

                                    {makkaHotels.length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {makkaHotels.map(hotel => (
                                                <HotelCard
                                                    key={hotel.id}
                                                    hotel={hotel}
                                                    selected={formData.hebergement_makka === hotel.name}
                                                    onSelect={() => setFormData({ ...formData, hebergement_makka: hotel.name })}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-slate-500 italic">{t('custom_omra.no_makka_hotels')}</p>
                                    )}
                                </div>

                                {/* Madina Hotels */}
                                <div className="space-y-4">
                                    <Label className="flex items-center gap-2 text-lg font-bold text-slate-800 border-b pb-2">
                                        <MapPin className="w-5 h-5 text-emerald-600" /> {t('custom_omra.madina_hotels')}
                                    </Label>

                                    {madinaHotels.length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {madinaHotels.map(hotel => (
                                                <HotelCard
                                                    key={hotel.id}
                                                    hotel={hotel}
                                                    selected={formData.hebergement_madina === hotel.name}
                                                    onSelect={() => setFormData({ ...formData, hebergement_madina: hotel.name })}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-slate-500 italic">{t('custom_omra.no_madina_hotels')}</p>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl">
                            {/* Restauration Option */}
                            <div className="space-y-2">
                                <Label htmlFor="restauration" className="flex items-center gap-2">
                                    <Coffee className="w-4 h-4 text-emerald-600" /> {t('custom_omra.restauration')}
                                </Label>
                                <Select
                                    value={formData.options.restauration}
                                    onValueChange={(val) => setFormData({ ...formData, options: { ...formData.options, restauration: val } })}
                                >
                                    <SelectTrigger className="h-12 border-slate-200 focus:ring-emerald-500 bg-white">
                                        <SelectValue placeholder={t('custom_omra.restauration_placeholder')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="petit déjeuner">{t('custom_omra.restauration_options.breakfast')}</SelectItem>
                                        <SelectItem value="demi-pension">{t('custom_omra.restauration_options.half_board')}</SelectItem>
                                        <SelectItem value="pension complète">{t('custom_omra.restauration_options.full_board')}</SelectItem>
                                        <SelectItem value="sans repas">{t('custom_omra.restauration_options.no_meals')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Transport Option */}
                            <div className="space-y-2">
                                <Label htmlFor="transport" className="flex items-center gap-2">
                                    <Bus className="w-4 h-4 text-emerald-600" /> {t('custom_omra.transport')}
                                </Label>
                                <Select
                                    value={formData.options.transport}
                                    onValueChange={(val) => setFormData({ ...formData, options: { ...formData.options, transport: val } })}
                                >
                                    <SelectTrigger className="h-12 border-slate-200 focus:ring-emerald-500 bg-white">
                                        <SelectValue placeholder={t('custom_omra.transport_placeholder')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="bus standard">{t('custom_omra.transport_options.standard_bus')}</SelectItem>
                                        <SelectItem value="bus confort">{t('custom_omra.transport_options.comfort_bus')}</SelectItem>
                                        <SelectItem value="voiture privée">{t('custom_omra.transport_options.private_car')}</SelectItem>
                                        <SelectItem value="tgv">{t('custom_omra.transport_options.train')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="pt-6">
                            <Button type="submit" className="w-full h-14 text-lg font-bold bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/25 hover:scale-[1.01] transition-transform text-white" disabled={loading}>
                                {loading ? <LoadingSpinner /> : (
                                    <span className="flex items-center gap-2">
                                        {t('custom_omra.submit')} <ArrowRight className="w-5 h-5" />
                                    </span>
                                )}
                            </Button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
};

export default CustomOmraTripPage;