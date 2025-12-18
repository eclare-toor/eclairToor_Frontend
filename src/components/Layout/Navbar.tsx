import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, User, Bell, LogIn, Plane, Hotel, Map, Phone, Tag, LogOut, LayoutDashboard } from 'lucide-react';
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

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const { isAuthenticated, logout } = useAuth(); // Use AuthContext
    const location = useLocation();
    const navigate = useNavigate();

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

    const handleLogout = () => {
        logout();
    };

    const navLinks = [
        { name: 'Voyages Organisés', path: '/voyages', icon: Map },
        { name: 'Hôtels', path: '/request-hotel', icon: Hotel },
        { name: 'Vols', path: '/request-flight', icon: Plane },
        { name: 'Promos', path: '/Promos-trips', icon: Tag },
        { name: 'Contact', path: '/contact', icon: Phone },
    ];

    return (
        <header
            className={cn(
                'fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out',
                isScrolled
                    ? 'bg-background/95 backdrop-blur-md shadow-md py-2'
                    : 'bg-transparent py-4'
            )}
        >
            <div className="container mx-auto px-8 flex items-center justify-between">
                {/* Logo Section */}
                <Link to="/" className="flex items-center gap-2">
                    <img src={logo} alt="Eclair Travel Logo" className="w-16 h-16 rounded-2xl object-cover" />
                    <span className={cn(
                        "font-heading font-bold text-xl tracking-wide transition-colors",
                        isScrolled ? "text-foreground" : "text-white"
                    )}>
                        ECLAIR TRAVEL
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-6">
                    {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={cn(
                                "text-sm font-medium transition-colors hover:text-primary",
                                location.pathname === '/'
                                    ? (isScrolled ? "text-black" : "text-white")
                                    : ("text-black")
                            )}
                        >
                            {link.name}
                        </Link>
                    ))}
                </nav>

                {/* Right Section (Auth/Profile) */}
                <div className="hidden md:flex items-center gap-4">
                    {isAuthenticated ? (
                        <>
                            <Button variant="ghost" size="icon" className={cn(
                                "relative",
                                location.pathname === '/' && !isScrolled ? "text-white hover:text-white/80 hover:bg-white/10" : "text-foreground"
                            )}>
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                            </Button>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className={cn(
                                        "rounded-full border-2 border-transparent hover:border-primary transition-all",
                                        location.pathname === '/' && !isScrolled ? "text-white hover:text-white/80 hover:bg-white/10" : "text-foreground"
                                    )}>
                                        <User className="w-5 h-5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuLabel>Mon Compte</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                                        <LayoutDashboard className="mr-2 h-4 w-4" />
                                        <span>Tableau de bord</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                                        <User className="mr-2 h-4 w-4" />
                                        <span>Profil</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleLogout} className="">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Se déconnecter</span>
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
                                Connexion
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
                                            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/dashboard')}>
                                                <LayoutDashboard className="w-4 h-4 mr-2" />
                                                Tableau de bord
                                            </Button>
                                            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/profile')}>
                                                <User className="w-4 h-4 mr-2" />
                                                Mon Profil
                                            </Button>
                                            <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleLogout}>
                                                <LogOut className="w-4 h-4 mr-2" />
                                                Se déconnecter
                                            </Button>
                                        </div>
                                    ) : (
                                        <Link to="/login">
                                            <Button className="w-full">
                                                <LogIn className="w-4 h-4 mr-2" />
                                                Connexion
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
