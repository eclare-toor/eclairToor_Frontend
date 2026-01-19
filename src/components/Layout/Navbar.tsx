import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, User, Bell, LogIn, Plane, Hotel, Map, Phone, LogOut, LayoutDashboard } from 'lucide-react';
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
import logo from '../../assets/logo.png';
import { useAuth } from '../../Context/AuthContext';

import { getNotifications, getUnreadNotificationsCount, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification } from '../../api';
import type { AppNotification } from '../../Types';
import { Check, CheckCheck, ShieldCheck, Calendar, Zap, Trash2, ArrowRight, Languages, Globe } from 'lucide-react';
import algeriaFlag from '../../assets/algeria.webp';
import iataLogo from '../../assets/IATA.png';
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
            // Polling for new notifications every 30 seconds
            const interval = setInterval(fetchNotificationsData, 900000); // 15 minutes
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

    const handleDeleteNotification = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await deleteNotification(id);
            toast.success(t('nav.notif_deleted'));
            fetchNotificationsData();
        } catch (error) {
            toast.error(t('nav.error_deleting'));
        }
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
        { name: t('nav.contact'), path: '/contact', icon: Phone },
    ];

    return (
        <header
            className={cn(
                'fixed left-0 right-0 z-50 px-4 md:px-8 transition-all duration-500 ease-in-out',
                isScrolled
                    ? 'top-4'
                    : 'top-6'
            )}
        >
            <div className={cn(
                "container mx-auto transition-all duration-500 ease-in-out",
                isScrolled
                    ? "bg-white/70 backdrop-blur-2xl shadow-2xl shadow-primary/10 rounded-[2.5rem] py-3 px-8 border border-white/20"
                    : "bg-white/10 backdrop-blur-md rounded-[3rem] py-5 px-10 border border-white/10 shadow-xl shadow-black/5"
            )}>
                <div className="flex items-center justify-between">
                    {/* Logo Section - Truly Grand as requested */}
                    <Link to="/" className="flex items-center gap-6 group">
                        <div className="relative flex items-center">
                            <motion.div
                                whileHover={{ scale: 1.05, rotate: 2 }}
                                whileTap={{ scale: 0.95 }}
                                className="relative z-10"
                            >
                                <img
                                    src={logo}
                                    alt="Eclair Travel Logo"
                                    className={cn(
                                        "rounded-2xl object-cover shadow-2xl border-4 border-white/20 group-hover:border-primary/50 transition-all duration-500",
                                        isScrolled ? "w-16 h-16 md:w-20 md:h-20" : "w-16 h-16 md:w-24 md:h-24"
                                    )}
                                />
                            </motion.div>
                            {/* Larger Algerian Flag Badge */}
                            <div className={cn(
                                "absolute -right-4 -bottom-2 rounded-full border-4 border-white shadow-2xl overflow-hidden z-20",
                                isScrolled ? "w-8 h-8" : "w-12 h-12"
                            )}>
                                <img src={algeriaFlag} alt="Algérie" className="w-full h-full object-cover" />
                            </div>
                            <div className="absolute inset-0 bg-primary/30 blur-3xl rounded-full scale-0 group-hover:scale-150 transition-transform duration-700 -z-0"></div>
                        </div>
                        <div className="flex flex-col">
                            <span className={cn(
                                "font-black tracking-tighter leading-none italic",
                                isScrolled ? "text-xl md:text-2xl" : "text-2xl md:text-3xl",
                                "text-slate-900"
                            )}>
                                ECLAIR<span className="text-primary">TRAVEL</span>
                            </span>
                            <span className={cn(
                                "font-black uppercase tracking-[0.4em] mt-1.5",
                                isScrolled ? "text-[8px]" : "text-[10px]",
                                "text-slate-500"
                            )}>
                                {t('nav.pride_algerian')}
                            </span>
                        </div>
                        {/* IATA Logo */}
                        <div className="flex items-center gap-4 ml-6 pl-6 border-l border-slate-200/50">
                            <img
                                src={iataLogo}
                                alt="IATA Certified"
                                className={cn(
                                    "object-contain",
                                    isScrolled ? "h-8 md:h-10" : "h-12 md:h-20"
                                )}
                            />
                        </div>
                    </Link>

                    {/* Desktop Navigation - Centered & Premium */}
                    <nav className="hidden lg:flex items-center justify-center flex-1 mx-12">
                        <div className={cn(
                            "flex items-center gap-1 p-1 rounded-full",
                            "bg-white/40 backdrop-blur-md border border-white/20"
                        )}>
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={cn(
                                        "relative px-6 py-3 text-[17px] font-black transition-all duration-300 rounded-full flex items-center gap-2 group",
                                        location.pathname === link.path
                                            ? "text-primary bg-white shadow-xl shadow-primary/5"
                                            : "text-slate-900 hover:text-primary hover:bg-white/20"
                                    )}
                                >
                                    <link.icon className={cn(
                                        "w-4 h-4 transition-transform duration-300 group-hover:scale-110",
                                        location.pathname === link.path ? "text-primary" : "opacity-70 group-hover:opacity-100"
                                    )} />
                                    <span>{link.name}</span>
                                    {location.pathname === link.path && (
                                        <motion.div
                                            layoutId="nav-active"
                                            className="absolute inset-0 bg-white rounded-full -z-10 shadow-sm"
                                            transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                                        />
                                    )}
                                </Link>
                            ))}
                        </div>
                    </nav>

                    {/* Right Section (Auth/Profile) */}
                    <div className="hidden md:flex items-center gap-4">
                        {/* Language Switcher */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className={cn(
                                    "rounded-full hover:bg-white/20 h-12 w-12 text-slate-900 border border-transparent hover:border-white/20",
                                    isScrolled ? "text-slate-900" : "text-slate-900"
                                )}>
                                    <Globe className="w-7 h-7" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[150px] rounded-xl border-slate-100 shadow-xl p-1.5 backdrop-blur-xl bg-white/90">
                                <DropdownMenuItem onClick={() => i18n.changeLanguage('ar')} className={cn("rounded-lg px-3 py-2 cursor-pointer font-bold font-arabic", i18n.language === 'ar' && "bg-primary/10 text-primary")}>
                                    🇩🇿 العربية
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => i18n.changeLanguage('fr')} className={cn("rounded-lg px-3 py-2 cursor-pointer font-bold", i18n.language === 'fr' && "bg-primary/10 text-primary")}>
                                    🇫🇷 Français
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => i18n.changeLanguage('en')} className={cn("rounded-lg px-3 py-2 cursor-pointer font-bold", i18n.language === 'en' && "bg-primary/10 text-primary")}>
                                    🇬🇧 English
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {isAuthenticated ? (
                            <>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className={cn(
                                            "relative overflow-visible h-12 w-12 rounded-full",
                                            "text-slate-900 hover:bg-white/20"
                                        )}>
                                            <Bell className="w-7 h-7" />
                                            {unreadCount > 0 && (
                                                <span className="absolute top-1 right-1 min-w-[20px] h-[20px] px-1 bg-red-600 rounded-full border-2 border-white flex items-center justify-center text-[10px] text-white font-black z-[60] shadow-sm">
                                                    {unreadCount}
                                                </span>
                                            )}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-[400px] p-0 overflow-hidden rounded-[2rem] border-slate-200/50 shadow-2xl backdrop-blur-3xl bg-white/95">
                                        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white/50">
                                            <div>
                                                <DropdownMenuLabel className="p-0 text-lg font-black text-slate-900">{t('nav.notifications')}</DropdownMenuLabel>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{t('nav.notifications_live')}</p>
                                            </div>
                                            {unreadCount > 0 && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 px-3 text-[11px] font-bold text-primary hover:text-primary hover:bg-primary/10 rounded-full border border-primary/20 gap-1.5"
                                                    onClick={handleMarkAllAsRead}
                                                >
                                                    <CheckCheck className="w-3.5 h-3.5" /> {t('nav.mark_all_read')}
                                                </Button>
                                            )}
                                        </div>
                                        <div className="max-h-80 overflow-y-auto">
                                            {notifications.length === 0 ? (
                                                <div className="p-12 text-center text-slate-400">
                                                    <Bell className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                                    <p className="text-sm font-bold">{t('nav.no_notifications')}</p>
                                                    <p className="text-[10px] uppercase tracking-tighter mt-1 opacity-60">{t('nav.check_back_later')}</p>
                                                </div>
                                            ) : (
                                                <div className="py-2">
                                                    {notifications.map((notif) => (
                                                        <div
                                                            key={notif.id}
                                                            className={cn(
                                                                "group px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors relative flex gap-3",
                                                                !notif.is_read && "bg-primary/5"
                                                            )}
                                                            onClick={() => handleNotificationClick(notif)}
                                                        >
                                                            <div className={cn(
                                                                "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110",
                                                                notif.type.includes('payment') ? "bg-emerald-100 text-emerald-600" :
                                                                    notif.type.includes('booking') ? "bg-blue-100 text-blue-600" :
                                                                        "bg-indigo-100 text-indigo-600"
                                                            )}>
                                                                {notif.type.includes('payment') ? <ShieldCheck className="w-5 h-5" /> :
                                                                    notif.type.includes('booking') ? <Calendar className="w-5 h-5" /> :
                                                                        <Zap className="w-5 h-5" />}
                                                            </div>
                                                            <div className="flex-1 min-w-0 pr-4">
                                                                <div className="flex items-center justify-between gap-2">
                                                                    <p className="text-[13px] font-black text-slate-900 truncate">{notif.title}</p>
                                                                    <p className="text-[9px] font-bold text-slate-400 whitespace-nowrap">
                                                                        {notif.created_at ? new Date(notif.created_at).toLocaleDateString(i18n.language) : t('nav.today')}
                                                                    </p>
                                                                </div>
                                                                <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 font-medium leading-relaxed">{notif.message}</p>
                                                            </div>

                                                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all z-10">
                                                                {!notif.is_read && (
                                                                    <button
                                                                        title={t('nav.mark_read')}
                                                                        className="p-1.5 bg-white border border-slate-100 shadow-sm rounded-md text-slate-400 hover:text-primary transition-all"
                                                                        onClick={(e) => handleMarkAsRead(notif.id, e)}
                                                                    >
                                                                        <Check className="w-3.5 h-3.5" />
                                                                    </button>
                                                                )}
                                                                <button
                                                                    title={t('nav.delete')}
                                                                    className="p-1.5 bg-white border border-slate-100 shadow-sm rounded-md text-slate-400 hover:text-red-500 transition-all"
                                                                    onClick={(e) => handleDeleteNotification(notif.id, e)}
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>

                                                            {!notif.is_read && (
                                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
                                                            )}
                                                            {!notif.is_read && (
                                                                <div className="absolute right-3 top-3 w-2.5 h-2.5 bg-primary rounded-full border-2 border-white shadow-sm group-hover:opacity-0 transition-opacity" />
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
                                            <Link
                                                to="/notifications"
                                                className="flex items-center justify-center gap-2 text-xs font-black text-primary hover:gap-3 transition-all"
                                            >
                                                {t('nav.view_all')} <ArrowRight className="w-3.5 h-3.5" />
                                            </Link>
                                        </div>
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className={cn(
                                            "rounded-full border-2 border-transparent hover:border-primary transition-all h-12 w-12",
                                            "text-slate-900 hover:bg-white/20"
                                        )}>
                                            <User className="w-7 h-7" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-64 overflow-hidden rounded-[1.5rem] border-slate-200/50 shadow-2xl p-2 bg-white/95 backdrop-blur-xl">
                                        <DropdownMenuLabel className="px-4 py-3 text-sm font-black text-slate-900 uppercase tracking-widest text-[10px] opacity-50">{t('nav.my_account')}</DropdownMenuLabel>
                                        <DropdownMenuSeparator className="mx-2" />
                                        <DropdownMenuItem onClick={() => navigate('/mon-compte')} className="rounded-xl px-4 py-3 focus:bg-primary/5 focus:text-primary transition-colors cursor-pointer group">
                                            <LayoutDashboard className="mr-3 h-5 w-5 text-slate-400 group-focus:text-primary transition-colors" />
                                            <span className="font-bold">{t('nav.dashboard')}</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => navigate('/profile')} className="rounded-xl px-4 py-3 focus:bg-primary/5 focus:text-primary transition-colors cursor-pointer group">
                                            <User className="mr-3 h-5 w-5 text-slate-400 group-focus:text-primary transition-colors" />
                                            <span className="font-bold">{t('nav.profile')}</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator className="mx-2" />
                                        <DropdownMenuItem onClick={handleLogout} className="text-red-600 rounded-xl px-4 py-3 focus:bg-red-50 focus:text-red-600 transition-colors cursor-pointer group">
                                            <LogOut className="mr-3 h-5 w-5 text-red-400 group-focus:text-red-600 transition-colors" />
                                            <span className="font-bold">{t('nav.logout')}</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </>
                        ) : (
                            <Link to="/connexion">
                                <Button
                                    variant={isScrolled ? "default" : "secondary"}
                                    className="font-semibold"
                                >
                                    <LogIn className="w-4 h-4 mr-2" />
                                    {t('nav.login')}
                                </Button>
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Trigger */}
                    <div className="md:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className={location.pathname === '/' && !isScrolled ? "text-white" : "text-foreground"}>
                                    <Menu className="w-6 h-6" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                                <SheetHeader>
                                    <SheetTitle className="text-left font-heading text-2xl font-bold text-primary">
                                        ECLAIR TRAVEL
                                    </SheetTitle>
                                </SheetHeader>
                                <div className="flex flex-col gap-6 mt-8">
                                    <nav className="flex flex-col gap-4">
                                        {navLinks.map((link) => (
                                            <Link
                                                key={link.path}
                                                to={link.path}
                                                className="flex items-center gap-4 text-lg font-medium text-foreground/80 hover:text-primary transition-colors p-2 rounded-md hover:bg-accent"
                                            >
                                                <link.icon className="w-5 h-5" />
                                                {link.name}
                                            </Link>
                                        ))}
                                    </nav>
                                    <div className="border-t pt-6">
                                        {isAuthenticated ? (
                                            <div className="flex flex-col gap-3">
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
        </header >
    );
};

export default Navbar;
