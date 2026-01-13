import { Link } from 'react-router-dom';
import { Facebook, Instagram, Mail, Phone, MapPin } from 'lucide-react';

import { useTranslation } from 'react-i18next';

const Footer = () => {
    const { t } = useTranslation();
    return (
        <footer className="bg-slate-900 text-slate-200 pt-16 pb-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                    {/* Brand Column */}
                    <div className="space-y-4">
                        <h3 className="text-2xl font-heading font-bold text-white">ECLAIR TRAVEL</h3>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            {t('footer.desc')}
                        </p>
                        <div className="flex gap-4 pt-2">
                            <a href="https://www.facebook.com/eclairtravel/?locale=fr_FR" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors"><Facebook className="w-5 h-5" /></a>
                            <a href="https://www.instagram.com/eclairtravelhydra/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors"><Instagram className="w-5 h-5" /></a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-lg font-semibold text-white mb-6">{t('footer.nav_title')}</h4>
                        <ul className="space-y-3 text-sm">
                            <li><Link to="/voyages" className="hover:text-primary transition-colors">{t('trips.categories.national')}</Link></li>
                            <li><Link to="/voyages" className="hover:text-primary transition-colors">{t('trips.categories.international')}</Link></li>
                            <li><Link to="/voyages" className="hover:text-primary transition-colors">{t('trips.categories.omra')}</Link></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="text-lg font-semibold text-white mb-6">{t('footer.info_title')}</h4>
                        <ul className="space-y-3 text-sm">
                            <li><Link to="/contact" className="hover:text-primary transition-colors">{t('footer.about')}</Link></li>
                            <li><Link to="/contact" className="hover:text-primary transition-colors">{t('footer.contact_us')}</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="text-lg font-semibold text-white mb-6">{t('footer.contact_title')}</h4>
                        <ul className="space-y-4 text-sm">
                            <li className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-primary shrink-0" />
                                <span>Hydra, Algiers, Algeria</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-primary shrink-0" />
                                <span>044011889</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-primary shrink-0" />
                                <span>eclairtravel@gmail.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-800 pt-8 text-center text-sm text-slate-500">
                    <p>{t('footer.copyright', { year: new Date().getFullYear() })}</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
