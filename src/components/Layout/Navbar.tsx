import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, User, Bell, LogIn, Plane, Hotel, Map, Phone, LogOut, LayoutDashboard, Car, Check, CheckCheck, ShieldCheck, Calendar, Zap, ArrowRight, Globe } from '../../components/icons';
import { Button } from '../ui/button';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '../ui/sheet';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { cn } from '../../lib/utils';
import logo from '../../assets/logo.webp';
import { useAuth } from '../../Context/AuthContext';
import { getNotifications, getUnreadNotificationsCount, markNotificationAsRead, markAllNotificationsAsRead } from '../../api';
import type { AppNotification } from '../../Types';

import algeriaFlag from '../../assets/algeria.webp';
import iataLogo from '../../assets/IATA.webp';
import { useTranslation } from 'react-i18next';

const Navbar = () => {
    const { t, i18n } = useTranslation();
    const [isScrolled, setIsScrolled] = useState(false);
    const { isAuthenticated, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotificationsData = async () => {
        if (isAuthenticated) {
            const [notifs, count] = await Promise.all([
                getNotifications({ limit: 10 }),
                getUnreadNotificationsCount()
            ]);

            let processedNotifs = Array.isArray(notifs) ? [...notifs] : [];
            setNotifications(processedNotifs);
            setUnreadCount(count || 0);
        }
    };

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 20) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [location.pathname]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchNotificationsData();
            // Polling for new notifications every 15 minutes
            const interval = setInterval(fetchNotificationsData, 900000);
            return () => clearInterval(interval);
        }
    }, [isAuthenticated]);

    const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        await markNotificationAsRead(id);
        fetchNotificationsData();
    };

    const handleMarkAllAsRead = async () => {
        await markAllNotificationsAsRead();
        fetchNotificationsData();
    };

    const handleNotificationClick = async (notif: AppNotification) => {
        if (!notif.is_read) {
            await markNotificationAsRead(notif.id);
            fetchNotificationsData();
        }
    };

    const handleLogout = () => {
        logout();
    };

    const navLinks = [
        { name: t('nav.trips'), path: '/voyages', icon: Map },
        { name: t('nav.hotels'), path: '/request-hotel', icon: Hotel },
        { name: t('nav.flights'), path: '/request-flight', icon: Plane },
        { name: t('nav.transport'), path: '/request-transport', icon: Car },
        { name: t('nav.promotions'), path: '/promotions', icon: Zap },
    ];

    return (
        <header
            className={cn(
                'fixed left-0 right-0 z-50 px-3 md:px-6 lg:px-8 transition-all duration-500 ease-in-out',
                isScrolled ? 'top-3' : 'top-0'
            )}
        >
            <div className={cn(
                "transition-all duration-500 ease-in-out",
                isScrolled
                    ? "max-w-[1600px] mx-auto bg-white/80 backdrop-blur-xl shadow-lg shadow-primary/5 rounded-3xl py-2 px-4 md:px-6 border border-white/20"
                    : "max-w-full bg-white/10 backdrop-blur-md py-2.5 md:py-3 px-4 md:px-8 lg:px-12 border-b border-white/10 shadow-md"
            )}>
                <div className="flex items-center justify-between gap-3">
                    {/* Logo Section - IMAGES AGRANDIES */}
                    <Link to="/" className="flex items-center gap-2 md:gap-4 group shrink-0">
                        <div className="relative flex items-center">
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="relative z-10"
                            >
                                <img
                                    src={logo}
                                    alt="Eclair Travel Logo"
                                    width={112}
                                    height={112}
                                    fetchPriority="high"
                                    loading="eager"
                                    decoding="async"
                                    className={cn(
                                        "object-contain transition-all duration-500",
                                        isScrolled
                                            ? "w-14 h-14 md:w-16 md:h-16"
                                            : "w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28"
                                    )}
                                />
                            </motion.div>
                            {/* Drapeau Algérien - AGRANDI */}
                            <div className={cn(
                                "absolute -right-1 -bottom-1 md:-right-2 md:-bottom-1 rounded-full border-2 border-white shadow-lg overflow-hidden z-20 transition-all duration-500",
                                isScrolled ? "w-6 h-6 md:w-7 md:h-7" : "w-8 h-8 md:w-9 md:h-9 lg:w-10 lg:h-10"
                            )}>
                                <img
                                    src={algeriaFlag}
                                    alt="Algérie"
                                    width={40}
                                    height={40}
                                    loading="lazy"
                                    decoding="async"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-0 group-hover:scale-150 transition-transform duration-700 -z-0"></div>
                        </div>
                        <div className="flex flex-col">
                            <span className={cn(
                                "font-black tracking-tight leading-none italic transition-all duration-500",
                                isScrolled ? "text-sm md:text-lg" : "text-base md:text-xl lg:text-2xl",
                                "text-slate-900"
                            )}>
                                ECLAIR<span className="text-primary">TRAVEL</span>
                            </span>
                            <span className={cn(
                                "font-bold uppercase tracking-[0.2em] md:tracking-[0.3em] transition-all duration-500",
                                isScrolled ? "text-[5px] md:text-[6px]" : "text-[6px] md:text-[7px] lg:text-[8px]",
                                "text-slate-500"
                            )}>
                                {t('nav.pride_algerian')}
                            </span>
                        </div>
                        {/* IATA Logo - AGRANDI */}
                        <div className="hidden md:flex items-center gap-3 ml-2 lg:ml-4 pl-2 lg:pl-4 border-l border-slate-200/50">
                            <div className={cn(
                                "flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/20 shadow-md transition-all duration-500",
                                isScrolled ? "p-1 rounded-lg" : "p-1.5 lg:p-2 rounded-xl"
                            )}>
                                <img
                                    src={iataLogo}
                                    alt="IATA Certified"
                                    width={100}
                                    height={50}
                                    loading="lazy"
                                    decoding="async"
                                    className={cn(
                                        "object-contain transition-all duration-500",
                                        isScrolled ? "h-8 md:h-10" : "h-10 md:h-12 lg:h-14"
                                    )}
                                />
                            </div>
                        </div>
                    </Link>

                    {/* Desktop Navigation - ICÔNES AGRANDIES */}
                    <nav className="hidden lg:flex items-center justify-center flex-1 mx-4 xl:mx-8">
                        <div className={cn(
                            "flex items-center gap-0.5 p-0.5 rounded-full",
                            "bg-white/40 backdrop-blur-md border border-white/20"
                        )}>
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={cn(
                                        "relative px-3 xl:px-4 py-2 text-sm xl:text-base font-bold transition-all duration-300 rounded-full flex items-center gap-2 xl:gap-2.5 group",
                                        location.pathname === link.path
                                            ? "text-primary bg-white shadow-md"
                                            : "text-slate-900 hover:text-primary hover:bg-white/20"
                                    )}
                                >
                                    <link.icon className={cn(
                                        "w-5 h-5 xl:w-6 xl:h-6 transition-transform duration-300 group-hover:scale-110",
                                        location.pathname === link.path ? "text-primary" : "opacity-70 group-hover:opacity-100"
                                    )} />
                                    <span className="hidden xl:inline">{link.name}</span>
                                    {location.pathname === link.path && (
                                        <motion.div
                                            layoutId="nav-active"
                                            className="absolute inset-0 bg-white rounded-full -z-10 shadow-sm"
                                            transition={{ type: "spring", bounce: 0.25, duration: 0.3 }}
                                        />
                                    )}
                                </Link>
                            ))}
                        </div>
                    </nav>

                    {/* Right Section - ICÔNES AGRANDIES */}
                    <div className="hidden md:flex items-center gap-1.5 lg:gap-2">
                        <Link to="/contact">
                            <Button variant="ghost" className="rounded-full font-bold gap-1.5 hover:bg-white/20 text-slate-900 border border-white/10 px-3 lg:px-4 h-9 lg:h-10">
                                <Phone className="w-5 h-5 lg:w-6 lg:h-6 text-primary" />
                                <span className="text-xs lg:text-sm hidden lg:inline">{t('nav.contact')}</span>
                            </Button>
                        </Link>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" aria-label={t('nav.change_language')} className="rounded-full hover:bg-white/20 h-9 w-9 lg:h-10 lg:w-10 text-slate-900">
                                    <Globe className="w-5 h-5 lg:w-6 lg:h-6" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[160px] rounded-2xl border-slate-100 shadow-xl p-2 backdrop-blur-xl bg-white/95">
                                <DropdownMenuItem onClick={() => i18n.changeLanguage('ar')} className={cn("rounded-xl px-3 py-2 cursor-pointer font-bold font-arabic text-right text-sm", i18n.language === 'ar' && "bg-primary/10 text-primary")}>
                                    🇩🇿 العربية
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => i18n.changeLanguage('fr')} className={cn("rounded-xl px-3 py-2 cursor-pointer font-bold text-sm", i18n.language === 'fr' && "bg-primary/10 text-primary")}>
                                    🇫🇷 Français
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => i18n.changeLanguage('en')} className={cn("rounded-xl px-3 py-2 cursor-pointer font-bold text-sm", i18n.language === 'en' && "bg-primary/10 text-primary")}>
                                    🇬🇧 English
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {isAuthenticated ? (
                            <>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" aria-label={t('nav.notifications')} className="relative overflow-visible h-9 w-9 lg:h-10 lg:w-10 rounded-full text-slate-900 hover:bg-white/20">
                                            <Bell className="w-5 h-5 lg:w-6 lg:h-6" />
                                            {unreadCount > 0 && (
                                                <span className="absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1 bg-red-600 rounded-full border-2 border-white flex items-center justify-center text-[10px] text-white font-black z-[60] shadow-sm">
                                                    {unreadCount}
                                                </span>
                                            )}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-[380px] lg:w-[420px] p-0 overflow-hidden rounded-2xl border-slate-200/50 shadow-2xl backdrop-blur-3xl bg-white/95">
                                        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white/50">
                                            <div>
                                                <DropdownMenuLabel className="p-0 text-base font-black text-slate-900">{t('nav.notifications')}</DropdownMenuLabel>
                                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{t('nav.notifications_live')}</p>
                                            </div>
                                            {unreadCount > 0 && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7 px-2.5 text-[10px] font-bold text-primary hover:text-primary hover:bg-primary/10 rounded-full border border-primary/20 gap-1"
                                                    onClick={handleMarkAllAsRead}
                                                >
                                                    <CheckCheck className="w-3 h-3" /> {t('nav.mark_all_read')}
                                                </Button>
                                            )}
                                        </div>
                                        <div className="max-h-[320px] overflow-y-auto">
                                            {notifications.length === 0 ? (
                                                <div className="p-10 text-center text-slate-400">
                                                    <Bell className="w-10 h-10 mx-auto mb-2 opacity-20" />
                                                    <p className="text-sm font-bold">{t('nav.no_notifications')}</p>
                                                    <p className="text-[9px] uppercase tracking-tight mt-1 opacity-60">{t('nav.check_back_later')}</p>
                                                </div>
                                            ) : (
                                                <div className="py-1">
                                                    {notifications.map((notif) => (
                                                        <div
                                                            key={notif.id}
                                                            className={cn(
                                                                "group px-3 py-2.5 hover:bg-slate-50 cursor-pointer transition-colors relative flex gap-2.5",
                                                                !notif.is_read && "bg-primary/5"
                                                            )}
                                                            onClick={() => handleNotificationClick(notif)}
                                                        >
                                                            <div className={cn(
                                                                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110",
                                                                notif.type.includes('payment') ? "bg-emerald-100 text-emerald-600" :
                                                                    notif.type.includes('booking') ? "bg-blue-100 text-blue-600" :
                                                                        "bg-indigo-100 text-indigo-600"
                                                            )}>
                                                                {notif.type.includes('payment') ? <ShieldCheck className="w-5 h-5" /> :
                                                                    notif.type.includes('booking') ? <Calendar className="w-5 h-5" /> :
                                                                        <Zap className="w-5 h-5" />}
                                                            </div>
                                                            <div className="flex-1 min-w-0 pr-3">
                                                                <div className="flex items-center justify-between gap-2">
                                                                    <p className="text-xs font-black text-slate-900 truncate">{notif.title}</p>
                                                                    <p className="text-[8px] font-bold text-slate-400 whitespace-nowrap">
                                                                        {notif.created_at ? new Date(notif.created_at).toLocaleDateString(i18n.language) : t('nav.today')}
                                                                    </p>
                                                                </div>
                                                                <p className="text-[10px] text-slate-500 line-clamp-2 mt-0.5 font-medium leading-relaxed">{notif.message}</p>
                                                            </div>

                                                            {!notif.is_read && (
                                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all z-10">
                                                                    <button
                                                                        title={t('nav.mark_read')}
                                                                        className="p-1 bg-white border border-slate-100 shadow-sm rounded-md text-slate-400 hover:text-primary transition-all"
                                                                        onClick={(e) => handleMarkAsRead(notif.id, e)}
                                                                    >
                                                                        <Check className="w-3 h-3" />
                                                                    </button>
                                                                </div>
                                                            )}

                                                            {!notif.is_read && (
                                                                <div className="absolute right-2 top-2 w-2 h-2 bg-primary rounded-full border-2 border-white shadow-sm group-hover:opacity-0 transition-opacity" />
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-2.5 border-t border-slate-100 bg-slate-50/50">
                                            <Link
                                                to="/notifications"
                                                className="flex items-center justify-center gap-1.5 text-xs font-black text-primary hover:gap-2.5 transition-all"
                                            >
                                                {t('nav.view_all')} <ArrowRight className="w-3 h-3" />
                                            </Link>
                                        </div>
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" aria-label={t('nav.user_menu')} className="rounded-full border-2 border-transparent hover:border-primary transition-all h-9 w-9 lg:h-10 lg:w-10 text-slate-900 hover:bg-white/20">
                                            <User className="w-5 h-5 lg:w-6 lg:h-6" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56 overflow-hidden rounded-2xl border-slate-200/50 shadow-xl p-2 bg-white/95 backdrop-blur-xl">
                                        <DropdownMenuLabel className="px-3 py-2 text-[9px] font-black text-slate-900 uppercase tracking-widest opacity-50">{t('nav.my_account')}</DropdownMenuLabel>
                                        <DropdownMenuSeparator className="mx-2" />
                                        <DropdownMenuItem onClick={() => navigate('/mon-compte')} className="rounded-xl px-3 py-2.5 focus:bg-primary/5 focus:text-primary transition-colors cursor-pointer group">
                                            <LayoutDashboard className="mr-2.5 h-5 w-5 text-slate-400 group-focus:text-primary transition-colors" />
                                            <span className="font-bold text-sm">{t('nav.dashboard')}</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => navigate('/profile')} className="rounded-xl px-3 py-2.5 focus:bg-primary/5 focus:text-primary transition-colors cursor-pointer group">
                                            <User className="mr-2.5 h-5 w-5 text-slate-400 group-focus:text-primary transition-colors" />
                                            <span className="font-bold text-sm">{t('nav.profile')}</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator className="mx-2" />
                                        <DropdownMenuItem onClick={handleLogout} className="text-red-600 rounded-xl px-3 py-2.5 focus:bg-red-50 focus:text-red-600 transition-colors cursor-pointer group">
                                            <LogOut className="mr-2.5 h-5 w-5 text-red-400 group-focus:text-red-600 transition-colors" />
                                            <span className="font-bold text-sm">{t('nav.logout')}</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </>
                        ) : (
                            <Link to="/connexion">
                                <Button
                                    variant={isScrolled ? "default" : "secondary"}
                                    className="font-semibold h-9 lg:h-10 px-3 lg:px-4 text-xs lg:text-sm"
                                >
                                    <LogIn className="w-3.5 h-3.5 lg:w-4 lg:h-4 mr-1.5" />
                                    {t('nav.login')}
                                </Button>
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Trigger */}
                    <div className="md:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" aria-label={t('nav.mobile_menu')} className={cn(
                                    "h-9 w-9",
                                    location.pathname === '/' && !isScrolled ? "text-white" : "text-foreground"
                                )}>
                                    <Menu className="w-5 h-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                                <SheetHeader>
                                    <SheetTitle className="text-left font-heading text-xl font-bold text-primary">
                                        ECLAIR TRAVEL
                                    </SheetTitle>
                                </SheetHeader>
                                <div className="flex flex-col gap-6 mt-8">
                                    <nav className="flex flex-col gap-3">
                                        {navLinks.map((link) => (
                                            <Link
                                                key={link.path}
                                                to={link.path}
                                                className="flex items-center gap-3 text-base font-medium text-foreground/80 hover:text-primary transition-colors p-2 rounded-lg hover:bg-accent"
                                            >
                                                <link.icon className="w-5 h-5" />
                                                {link.name}
                                            </Link>
                                        ))}
                                    </nav>
                                    <div className="border-t pt-6">
                                        {isAuthenticated ? (
                                            <div className="flex flex-col gap-2.5">
                                                <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/mon-compte')}>
                                                    <LayoutDashboard className="w-4 h-4 mr-2" />
                                                    {t('nav.dashboard')}
                                                </Button>
                                                <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/profile')}>
                                                    <User className="w-4 h-4 mr-2" />
                                                    {t('nav.profile')}
                                                </Button>
                                                <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleLogout}>
                                                    <LogOut className="w-4 h-4 mr-2" />
                                                    {t('nav.logout')}
                                                </Button>
                                            </div>
                                        ) : (
                                            <Link to="/login">
                                                <Button className="w-full">
                                                    <LogIn className="w-4 h-4 mr-2" />
                                                    {t('nav.login')}
                                                </Button>
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;