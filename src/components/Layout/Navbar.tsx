import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    Menu, User, Bell, LogIn, Plane, Hotel, Map, Phone,
    LogOut, LayoutDashboard, Car, Check, CheckCheck,
    ShieldCheck, Calendar, Zap, ArrowRight, Globe, FileText, X
} from '../../components/icons';
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
import {
    getNotifications,
    getUnreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead
} from '../../api';
import type { AppNotification } from '../../Types';

import algeriaFlag from '../../assets/algeria.webp';
import iataLogo from '../../assets/IATA.webp';
import { useTranslation } from 'react-i18next';


const Navbar = () => {
    const { t, i18n } = useTranslation();
    const { isAuthenticated, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // ── Sheet open/close state ──────────────────────────────────
    const [sheetOpen, setSheetOpen] = useState(false);
    const sheetRef = useRef<HTMLDivElement>(null);

    // ── Notifications ───────────────────────────────────────────
    const fetchNotificationsData = useCallback(async () => {
        if (!isAuthenticated) return;
        const [notifs, count] = await Promise.all([
            getNotifications({ limit: 10 }),
            getUnreadNotificationsCount()
        ]);
        setNotifications(Array.isArray(notifs) ? [...notifs] : []);
        setUnreadCount(count || 0);
    }, [isAuthenticated]);

    React.useEffect(() => {
        if (isAuthenticated) {
            fetchNotificationsData();
            const interval = setInterval(fetchNotificationsData, 900000);
            return () => clearInterval(interval);
        }
    }, [isAuthenticated, fetchNotificationsData]);

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

    const handleLogout = () => logout();

    // ── Nav links ───────────────────────────────────────────────
    const navLinks = [
        { name: t('nav.trips'), path: '/voyages', icon: Map },
        { name: t('nav.hotels'), path: '/request-hotel', icon: Hotel },
        { name: t('nav.flights'), path: '/request-flight', icon: Plane },
        { name: t('nav.transport'), path: '/request-transport', icon: Car },
        { name: t('nav.visa'), path: '/request-visa', icon: FileText },
        { name: t('nav.promotions'), path: '/promotions', icon: Zap },
    ];

    // ── RENDER ──────────────────────────────────────────────────
    return (
        <header className="fixed top-0 left-0 right-0 z-50 px-2 sm:px-3 md:px-5 lg:px-6 xl:px-8">
            {/* ── Outer shell ─────────────────────────────────────────── */}
            <div className="max-w-full bg-white/10 backdrop-blur-md py-2 md:py-2.5 px-3 sm:px-4 md:px-5 lg:px-6 xl:px-8 border-b border-white/10 shadow-md">

                {/* ── Inner row ───────────────────────────────────────── */}
                <div className="flex items-center justify-between gap-2 sm:gap-3">

                    {/* ════════════════════════════════════════════════════
                        LOGO SECTION
                        ════════════════════════════════════════════════════ */}
                    <Link to="/" className="flex items-center gap-2 md:gap-3 lg:gap-4 xl:gap-5 group shrink-0">
                        {/* Logo image */}
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="relative">
                            <img
                                src={logo}
                                alt="Eclair Travel Logo"
                                width={112}
                                height={112}
                                fetchPriority="high"
                                loading="eager"
                                decoding="async"
                                className="object-contain rounded-2xl w-14 h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 xl:w-24 xl:h-24 2xl:w-28 2xl:h-28 transition-all duration-300"
                            />
                        </motion.div>

                        {/* Algerian flag */}
                        <div className="rounded-full border-2 border-white shadow-lg overflow-hidden w-7 h-7 md:w-8 md:h-8 lg:w-10 lg:h-10 xl:w-12 xl:h-12 2xl:w-14 2xl:h-14 shrink-0">
                            <img
                                src={algeriaFlag}
                                alt="Algérie"
                                width={56}
                                height={56}
                                loading="lazy"
                                decoding="async"
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Brand text */}
                        <div className="flex flex-col">
                            <span className={cn(
                                "font-black tracking-tight leading-none italic text-secondary text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl transition-all duration-300",
                                i18n.language === 'ar' ? "font-arabic tracking-normal not-italic" : "uppercase"
                            )}>
                                Eclair<span className="text-primary">Travel</span>
                            </span>
                            <span className={cn(
                                "font-bold uppercase text-slate-500 text-[5px] md:text-[6px] lg:text-[7px] xl:text-[8px] transition-all duration-300",
                                i18n.language === 'ar' ? "font-arabic tracking-normal text-[7px] md:text-[8px]" : "0.15em] md:0.2em] lg:0.25em]"
                            )}>
                                {t('nav.pride_algerian')}
                            </span>
                        </div>

                        {/* IATA logo — hidden on small screens, show from lg */}
                        <div className="hidden 2xl:flex flex-col items-center">
                            <img
                                src={iataLogo}
                                alt="IATA Certified"
                                width={100}
                                height={50}
                                loading="lazy"
                                decoding="async"
                                className="object-contain rounded-2xl h-8 lg:h-10 xl:h-12 2xl:h-14 transition-all duration-300"
                            />
                            <span className="font-black bg-white text-[#1E618C] tracking-tight leading-none block text-center text-[8px] lg:text-[9px] xl:text-[10px] 2xl:text-xs mt-0.5">
                                03216555
                            </span>
                        </div>
                    </Link>

                    {/* ════════════════════════════════════════════════════
                        DESKTOP NAV LINKS
                        Visible from md (768px) up.
                        • md–lg (768–1023px):  icons only, no labels
                        • lg–xl (1024–1279px): icons + short labels
                        • xl+  (1280px+):      icons + full labels
                        ════════════════════════════════════════════════════ */}
                    <nav className="hidden md:flex items-center justify-center flex-1 mx-1 lg:mx-3 xl:mx-5 min-w-0">
                        <div className="flex items-center gap-0.5 p-0.5 rounded-full bg-white/40 backdrop-blur-md border border-white/20">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={cn(
                                        "relative px-2 md:px-2.5 lg:px-3 xl:px-1 2xl:px-6 py-1.5 md:py-2 font-bold rounded-full flex items-center gap-1.5 xl:gap-2 group transition-all duration-300 whitespace-nowrap",
                                        location.pathname === link.path
                                            ? "text-primary bg-white shadow-md"
                                            : "text-slate-900 hover:text-primary hover:bg-white/20"
                                    )}
                                >
                                    <link.icon className={cn(
                                        "shrink-0 transition-transform duration-300 group-hover:scale-110",
                                        "w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5 xl:w-7 xl:h-7",
                                        location.pathname === link.path ? "text-primary" : "opacity-70 group-hover:opacity-100"
                                    )} />
                                    {/* Label: hidden md (icons only), show from lg */}
                                    <span className={cn(
                                        "hidden xl:inline text-xs xl:text-[16px]",
                                        i18n.language === 'ar' && "font-arabic text-sm"
                                    )}>
                                        {link.name}
                                    </span>

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

                    {/* ════════════════════════════════════════════════════
                        RIGHT ACTIONS (desktop — visible from md up)
                        • Contact button: icon only on md–lg, icon+text from xl
                        • Language dropdown
                        • Notification bell (if authenticated)
                        • User menu / Login button
                        ════════════════════════════════════════════════════ */}
                    <div className="hidden md:flex items-center gap-1 lg:gap-1.5 shrink-0">

                        {/* Contact */}
                        <Link to="/contact" className="shrink-0">
                            <Button
                                variant="ghost"
                                className="rounded-full font-bold gap-1.5 hover:bg-white/20 text-slate-900 border border-white/10 h-8 md:h-9 lg:h-10 px-2 lg:px-3 xl:px-4"
                            >
                                <Phone className="w-4 h-4 lg:w-5 lg:h-5 text-primary shrink-0" />
                                <span className="hidden">{t('nav.contact')}</span>
                            </Button>
                        </Link>

                        {/* Language switcher */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    aria-label={t('nav.change_language')}
                                    className="rounded-full hover:bg-white/20 h-8 w-8 md:h-9 md:w-9 lg:h-10 lg:w-10 text-slate-900 shrink-0"
                                >
                                    <Globe className="w-4 h-4 lg:w-5 lg:h-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[150px] rounded-2xl border-slate-100 shadow-xl p-2 backdrop-blur-xl bg-white/95">
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

                        {/* ── Authenticated actions ─── */}
                        {isAuthenticated ? (
                            <>
                                {/* Notifications bell */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            aria-label={t('nav.notifications')}
                                            className="relative overflow-visible h-8 w-8 md:h-9 md:w-9 lg:h-10 lg:w-10 rounded-full text-slate-900 hover:bg-white/20 shrink-0"
                                        >
                                            <Bell className="w-4 h-4 lg:w-5 lg:h-5" />
                                            {unreadCount > 0 && (
                                                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-600 rounded-full border-2 border-white flex items-center justify-center text-[9px] text-white font-black z-[60] shadow-sm">
                                                    {unreadCount > 99 ? '99+' : unreadCount}
                                                </span>
                                            )}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-[320px] md:w-[360px] lg:w-[400px] p-0 overflow-hidden rounded-2xl border-slate-200/50 shadow-2xl backdrop-blur-3xl bg-white/95">
                                        {/* Header */}
                                        <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-white/50">
                                            <div>
                                                <DropdownMenuLabel className="p-0 text-sm font-black text-slate-900">{t('nav.notifications')}</DropdownMenuLabel>
                                                <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{t('nav.notifications_live')}</p>
                                            </div>
                                            {unreadCount > 0 && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 px-2 text-[9px] font-bold text-primary hover:text-primary hover:bg-primary/10 rounded-full border border-primary/20 gap-1 shrink-0"
                                                    onClick={handleMarkAllAsRead}
                                                >
                                                    <CheckCheck className="w-3 h-3" /> {t('nav.mark_all_read')}
                                                </Button>
                                            )}
                                        </div>
                                        {/* List */}
                                        <div className="max-h-[300px] overflow-y-auto">
                                            {notifications.length === 0 ? (
                                                <div className="p-8 text-center text-slate-400">
                                                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                                    <p className="text-sm font-bold">{t('nav.no_notifications')}</p>
                                                    <p className="text-[8px] uppercase tracking-tight mt-1 opacity-60">{t('nav.check_back_later')}</p>
                                                </div>
                                            ) : (
                                                <div className="py-1">
                                                    {notifications.map((notif) => (
                                                        <div
                                                            key={notif.id}
                                                            className={cn(
                                                                "group px-3 py-2 hover:bg-slate-50 cursor-pointer transition-colors relative flex gap-2",
                                                                !notif.is_read && "bg-primary/5"
                                                            )}
                                                            onClick={() => handleNotificationClick(notif)}
                                                        >
                                                            <div className={cn(
                                                                "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110",
                                                                notif.type.includes('payment') ? "bg-emerald-100 text-emerald-600" :
                                                                    notif.type.includes('booking') ? "bg-blue-100 text-blue-600" :
                                                                        "bg-indigo-100 text-indigo-600"
                                                            )}>
                                                                {notif.type.includes('payment') ? <ShieldCheck className="w-4 h-4" /> :
                                                                    notif.type.includes('booking') ? <Calendar className="w-4 h-4" /> :
                                                                        <Zap className="w-4 h-4" />}
                                                            </div>
                                                            <div className="flex-1 min-w-0 pr-2">
                                                                <div className="flex items-center justify-between gap-1.5">
                                                                    <p className="text-xs font-black text-slate-900 truncate">{notif.title}</p>
                                                                    <p className="text-[7px] font-bold text-slate-400 whitespace-nowrap shrink-0">
                                                                        {notif.created_at ? new Date(notif.created_at).toLocaleDateString(i18n.language) : t('nav.today')}
                                                                    </p>
                                                                </div>
                                                                <p className="text-[9px] text-slate-500 line-clamp-2 mt-0.5 font-medium leading-relaxed">{notif.message}</p>
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
                                        {/* Footer */}
                                        <div className="p-2 border-t border-slate-100 bg-slate-50/50">
                                            <Link to="/notifications" className="flex items-center justify-center gap-1.5 text-xs font-black text-primary hover:gap-2.5 transition-all">
                                                {t('nav.view_all')} <ArrowRight className="w-3 h-3" />
                                            </Link>
                                        </div>
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                {/* User menu */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            aria-label={t('nav.user_menu')}
                                            className="rounded-full border-2 border-transparent hover:border-primary transition-all h-8 w-8 md:h-9 md:w-9 lg:h-10 lg:w-10 text-slate-900 hover:bg-white/20 shrink-0"
                                        >
                                            <User className="w-4 h-4 lg:w-5 lg:h-5" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-52 overflow-hidden rounded-2xl border-slate-200/50 shadow-xl p-2 bg-white/95 backdrop-blur-xl">
                                        <DropdownMenuLabel className="px-3 py-1.5 text-[8px] font-black text-slate-900 uppercase tracking-widest opacity-50">{t('nav.my_account')}</DropdownMenuLabel>
                                        <DropdownMenuSeparator className="mx-2" />
                                        <DropdownMenuItem onClick={() => navigate('/mon-compte')} className="rounded-xl px-3 py-2 focus:bg-primary/5 focus:text-primary transition-colors cursor-pointer group">
                                            <LayoutDashboard className="mr-2 h-4 w-4 text-slate-400 group-focus:text-primary transition-colors" />
                                            <span className="font-bold text-sm">{t('nav.dashboard')}</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => navigate('/profile')} className="rounded-xl px-3 py-2 focus:bg-primary/5 focus:text-primary transition-colors cursor-pointer group">
                                            <User className="mr-2 h-4 w-4 text-slate-400 group-focus:text-primary transition-colors" />
                                            <span className="font-bold text-sm">{t('nav.profile')}</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator className="mx-2" />
                                        <DropdownMenuItem onClick={handleLogout} className="text-red-600 rounded-xl px-3 py-2 focus:bg-red-50 focus:text-red-600 transition-colors cursor-pointer group">
                                            <LogOut className="mr-2 h-4 w-4 text-red-400 group-focus:text-red-600 transition-colors" />
                                            <span className="font-bold text-sm">{t('nav.logout')}</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </>
                        ) : (
                            /* Login button — shrink-0 prevents crush */
                            <Link to="/connexion" className="shrink-0">
                                <Button variant="default" className="font-semibold h-8 md:h-9 lg:h-10 px-3 lg:px-4 text-xs lg:text-sm whitespace-nowrap">
                                    <LogIn className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                                    {t('nav.login')}
                                </Button>
                            </Link>
                        )}
                    </div>

                    {/* ════════════════════════════════════════════════════
                        MOBILE HAMBURGER & NOTIFICATIONS (visible below md = <768px)
                        ════════════════════════════════════════════════════ */}
                    {/* ════════════════════════════════════════════════════
                        MOBILE HAMBURGER & NOTIFICATIONS (visible below md = <768px)
                        ════════════════════════════════════════════════════ */}
                    <div className="md:hidden shrink-0 flex items-center gap-1">

                        {/* Mobile Language Switcher */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    aria-label={t('nav.change_language')}
                                    className="h-10 w-10 text-slate-700 hover:bg-slate-100 rounded-full"
                                >
                                    <Globe className="w-6 h-6" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[150px] rounded-2xl border-slate-100 shadow-xl p-2 bg-white/95 backdrop-blur-xl">
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

                        {/* Mobile Notifications (only if authenticated) */}
                        {isAuthenticated && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        aria-label={t('nav.notifications')}
                                        className="h-10 w-10 text-foreground relative hover:bg-slate-100 rounded-full"
                                    >
                                        <Bell className="w-6 h-6" />
                                        {unreadCount > 0 && (
                                            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center ring-2 ring-background">
                                                {unreadCount > 9 ? '9+' : unreadCount}
                                            </span>
                                        )}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-80 max-h-[500px] overflow-y-auto rounded-2xl border-slate-200/50 shadow-xl p-0 bg-white/95 backdrop-blur-xl">
                                    <div className="sticky top-0 bg-white/95 backdrop-blur-xl p-4 border-b border-slate-100 z-10">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <DropdownMenuLabel className="p-0 text-sm font-black text-slate-900">{t('nav.notifications')}</DropdownMenuLabel>
                                                <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{t('nav.notifications_live')}</p>
                                            </div>
                                            {unreadCount > 0 && (
                                                <button
                                                    onClick={handleMarkAllAsRead}
                                                    className="text-[10px] font-black text-primary hover:text-primary/80 uppercase tracking-wider transition-colors"
                                                >
                                                    {t('nav.mark_all_read')}
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-2">
                                        {notifications.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                                <Bell className="w-12 h-12 text-slate-200 mb-3" />
                                                <p className="text-sm font-bold">{t('nav.no_notifications')}</p>
                                                <p className="text-xs text-slate-400 mt-1">{t('nav.no_notifications_desc')}</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-1">
                                                {notifications.map((notif) => (
                                                    <div
                                                        key={notif.id}
                                                        className={cn(
                                                            "p-3 rounded-xl cursor-pointer transition-all hover:bg-slate-50 border border-transparent hover:border-slate-100",
                                                            !notif.is_read && "bg-primary/5 border-primary/10"
                                                        )}
                                                        onClick={() => handleNotificationClick(notif)}
                                                    >
                                                        <div className="flex gap-3">
                                                            <div className={cn(
                                                                "w-2 h-2 rounded-full mt-1.5 shrink-0",
                                                                !notif.is_read ? "bg-primary" : "bg-slate-200"
                                                            )} />
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-bold text-slate-900 leading-tight mb-1">{notif.title}</p>
                                                                <p className="text-xs text-slate-600 line-clamp-2 mb-2">{notif.message}</p>
                                                                <p className="text-[10px] text-slate-400 font-medium">
                                                                    {notif.created_at ? new Date(notif.created_at).toLocaleDateString('fr-FR', {
                                                                        day: 'numeric',
                                                                        month: 'short',
                                                                        hour: '2-digit',
                                                                        minute: '2-digit'
                                                                    }) : ''}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="sticky bottom-0 bg-white/95 backdrop-blur-xl p-3 border-t border-slate-100">
                                        <Link to="/notifications" className="flex items-center justify-center gap-1.5 text-xs font-black text-primary hover:gap-2.5 transition-all">
                                            {t('nav.see_all')}
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </Link>
                                    </div>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}

                        {/* Mobile Menu */}
                        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                            <SheetTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    aria-label={t('nav.mobile_menu')}
                                    className="h-10 w-10 text-foreground hover:bg-slate-100 rounded-full"
                                >
                                    <Menu className="w-6 h-6" />
                                </Button>
                            </SheetTrigger>

                            <SheetContent side="right" className="w-[280px] sm:w-[320px]" ref={sheetRef}>
                                {/* Custom close button at top-right */}
                                <button
                                    onClick={() => setSheetOpen(false)}
                                    className="absolute top-3 right-3 p-1 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
                                    aria-label="Close menu"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                <SheetHeader>
                                    <SheetTitle className="rtl:text-right text-left font-heading text-xl font-bold text-primary">
                                        ECLAIR TRAVEL
                                    </SheetTitle>
                                </SheetHeader>

                                <div className="flex flex-col gap-5 mt-6">

                                    {/* ── Nav links (each click closes sheet) ── */}
                                    <nav className="flex flex-col gap-1">
                                        {navLinks.map((link) => (
                                            <Link
                                                key={link.path}
                                                to={link.path}
                                                onClick={() => setSheetOpen(false)}
                                                className={cn(
                                                    "flex items-center gap-3 text-base font-medium transition-colors p-2.5 rounded-xl",
                                                    location.pathname === link.path
                                                        ? "bg-primary/10 text-primary"
                                                        : "text-foreground/80 hover:text-primary hover:bg-slate-50",
                                                    i18n.language === 'ar' && "font-arabic flex-row-reverse text-right"
                                                )}
                                            >
                                                <link.icon className="w-5 h-5 shrink-0" />
                                                {link.name}
                                            </Link>
                                        ))}
                                    </nav>

                                    {/* ── Contact + Language row ── */}
                                    <div className="border-t pt-4 flex items-center gap-2">
                                        {/* Contact */}
                                        <Link
                                            to="/contact"
                                            onClick={() => setSheetOpen(false)}
                                            className="flex-1"
                                        >
                                            <Button variant="outline" className="w-full gap-2 font-bold text-sm">
                                                <Phone className="w-4 h-4 text-primary shrink-0" />
                                                {t('nav.contact')}
                                            </Button>
                                        </Link>
                                    </div>

                                    {/* ── Auth section ── */}
                                    <div className="border-t pt-4">
                                        {isAuthenticated ? (
                                            <div className="flex flex-col gap-2">
                                                <Button variant="outline" className="w-full justify-start" onClick={() => { navigate('/mon-compte'); setSheetOpen(false); }}>
                                                    <LayoutDashboard className="w-4 h-4 mr-2 shrink-0" />
                                                    {t('nav.dashboard')}
                                                </Button>
                                                <Button variant="outline" className="w-full justify-start" onClick={() => { navigate('/profile'); setSheetOpen(false); }}>
                                                    <User className="w-4 h-4 mr-2 shrink-0" />
                                                    {t('nav.profile')}
                                                </Button>
                                                <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => { handleLogout(); setSheetOpen(false); }}>
                                                    <LogOut className="w-4 h-4 mr-2 shrink-0" />
                                                    {t('nav.logout')}
                                                </Button>
                                            </div>
                                        ) : (
                                            <Link to="/connexion" onClick={() => setSheetOpen(false)}>
                                                <Button className="w-full">
                                                    <LogIn className="w-4 h-4 mr-2 shrink-0" />
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