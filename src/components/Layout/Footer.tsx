import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-slate-900 text-slate-200 pt-16 pb-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                    {/* Brand Column */}
                    <div className="space-y-4">
                        <h3 className="text-2xl font-heading font-bold text-white">ECLAIR TRAVEL</h3>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            Votre partenaire de confiance pour des voyages inoubliables. Découvrez le monde avec confort et sérénité.
                        </p>
                        <div className="flex gap-4 pt-2">
                            <a href="#" className="hover:text-primary transition-colors"><Facebook className="w-5 h-5" /></a>
                            <a href="#" className="hover:text-primary transition-colors"><Instagram className="w-5 h-5" /></a>
                            <a href="#" className="hover:text-primary transition-colors"><Twitter className="w-5 h-5" /></a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-lg font-semibold text-white mb-6">Navigation</h4>
                        <ul className="space-y-3 text-sm">
                            <li><Link to="/voyages" className="hover:text-primary transition-colors">Voyages Organisés</Link></li>
                            <li><Link to="/request-hotel" className="hover:text-primary transition-colors">Hôtels</Link></li>
                            <li><Link to="/request-flight" className="hover:text-primary transition-colors">Vols</Link></li>
                            <li><Link to="/Promos-trips" className="hover:text-primary transition-colors">Promos</Link></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="text-lg font-semibold text-white mb-6">Informations</h4>
                        <ul className="space-y-3 text-sm">
                            <li><Link to="/about" className="hover:text-primary transition-colors">À propos</Link></li>
                            <li><Link to="/terms" className="hover:text-primary transition-colors">Conditions Générales</Link></li>
                            <li><Link to="/privacy" className="hover:text-primary transition-colors">Politique de Confidentialité</Link></li>
                            <li><Link to="/contact" className="hover:text-primary transition-colors">Contactez-nous</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="text-lg font-semibold text-white mb-6">Contact</h4>
                        <ul className="space-y-4 text-sm">
                            <li className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-primary shrink-0" />
                                <span>123 Avenue de la République,<br />Tunis, Tunisie</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-primary shrink-0" />
                                <span>+216 71 123 456</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-primary shrink-0" />
                                <span>contact@eclairtravel.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-800 pt-8 text-center text-sm text-slate-500">
                    <p>&copy; {new Date().getFullYear()} Eclair Travel. Tous droits réservés.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
