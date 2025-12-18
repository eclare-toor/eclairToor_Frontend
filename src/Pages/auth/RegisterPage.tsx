import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register as apiRegister } from '../../api';
import { useAuth } from '../../Context/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Loader2, Mail, Lock, User, Facebook, AlertCircle, Phone, Globe } from 'lucide-react';
import logo from '../../assets/logo.png';
import { z } from 'zod';
import { toast } from 'react-toastify';

// Define validation schema inline for simplicity as per user request for simple code
const registerSchema = z.object({
  nom: z.string().min(2, "Le nom est requis"),
  prenom: z.string().min(2, "Le prénom est requis"),
  email: z.string().email("Adresse email invalide"),
  linkFacebook: z.string().url("Lien Facebook invalide").optional().or(z.literal('')),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  phone: z.string().min(10, "Le numéro de téléphone est requis"),
  nationalite: z.string().min(2, "La nationalité est requise"),
});

type RegisterFormData = z.infer<typeof registerSchema>;

const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof RegisterFormData, string>>>({});

  const [formData, setFormData] = useState<RegisterFormData>({
    nom: '',
    prenom: '',
    email: '',
    linkFacebook: '',
    password: '',
    phone: '',
    nationalite: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error for this field when user types
    if (fieldErrors[e.target.name as keyof RegisterFormData]) {
      setFieldErrors({
        ...fieldErrors,
        [e.target.name]: undefined
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setFieldErrors({});

    // Validate form
    const result = registerSchema.safeParse(formData);
    if (!result.success) {
      const errors: Partial<Record<keyof RegisterFormData, string>> = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path[0] as keyof RegisterFormData;
        errors[path] = issue.message;
      });
      setFieldErrors(errors);
      return;
    }

    setLoading(true);

    try {
      // 1. Call API
      const payload = { ...formData, role: 'user', linkFacebook: formData.linkFacebook || '' };
      console.log('📤 Sending registration payload:', payload);

      const { message, user, token } = await apiRegister(payload);
      console.log('✅ Registration successful:', { message, user });

      // 2. Show success toast
      toast.success(message || 'Inscription réussie !');

      // 3. Login via Context 
      login(token, user);

      // 4. Redirect
      navigate('/');
    } catch (err) {
      console.error('❌ Registration error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue lors de l\'inscription.';
      console.error('Error message:', errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full bg-secondary/5 blur-[100px]" />
      </div>

      <div className="max-w-md w-full space-y-8 bg-card p-8 rounded-3xl border shadow-xl">
        <div className="text-center">
          <Link to="/" className="inline-block mb-4">
            <img src={logo} alt="Eclair Travel" className="h-20 w-20 rounded-2xl object-cover mx-auto" />
          </Link>
          <h2 className="mt-2 text-3xl font-heading font-bold text-foreground">
            Créer un compte
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Rejoignez Eclair Travel et commencez votre aventure
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">

            {/* Nom */}
            <div className="space-y-2">
              <Label htmlFor="nom">Nom *</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="nom"
                  name="nom"
                  type="text"
                  className={`pl-10 ${fieldErrors.nom ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  placeholder="Doe"
                  value={formData.nom}
                  onChange={handleChange}
                />
              </div>
              {fieldErrors.nom && (
                <p className="text-xs text-destructive flex items-center mt-1">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {fieldErrors.nom}
                </p>
              )}
            </div>

            {/* Prenom */}
            <div className="space-y-2">
              <Label htmlFor="prenom">Prénom *</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="prenom"
                  name="prenom"
                  type="text"
                  className={`pl-10 ${fieldErrors.prenom ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  placeholder="John"
                  value={formData.prenom}
                  onChange={handleChange}
                />
              </div>
              {fieldErrors.prenom && (
                <p className="text-xs text-destructive flex items-center mt-1">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {fieldErrors.prenom}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  className={`pl-10 ${fieldErrors.email ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  placeholder="exemple@email.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              {fieldErrors.email && (
                <p className="text-xs text-destructive flex items-center mt-1">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Numéro de téléphone *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  className={`pl-10 ${fieldErrors.phone ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  placeholder="0612345678"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              {fieldErrors.phone && (
                <p className="text-xs text-destructive flex items-center mt-1">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {fieldErrors.phone}
                </p>
              )}
            </div>

            {/* Nationality */}
            <div className="space-y-2">
              <Label htmlFor="nationalite">Nationalité *</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="nationalite"
                  name="nationalite"
                  type="text"
                  className={`pl-10 ${fieldErrors.nationalite ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  placeholder="France"
                  value={formData.nationalite}
                  onChange={handleChange}
                />
              </div>
              {fieldErrors.nationalite && (
                <p className="text-xs text-destructive flex items-center mt-1">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {fieldErrors.nationalite}
                </p>
              )}
            </div>

            {/* Facebook Link */}
            <div className="space-y-2">
              <Label htmlFor="linkFacebook">Lien Facebook (Optionnel)</Label>
              <div className="relative">
                <Facebook className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="linkFacebook"
                  name="linkFacebook"
                  type="url"
                  className={`pl-10 ${fieldErrors.linkFacebook ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  placeholder="https://facebook.com/..."
                  value={formData.linkFacebook}
                  onChange={handleChange}
                />
              </div>
              {fieldErrors.linkFacebook && (
                <p className="text-xs text-destructive flex items-center mt-1">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {fieldErrors.linkFacebook}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  className={`pl-10 ${fieldErrors.password ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              {fieldErrors.password && (
                <p className="text-xs text-destructive flex items-center mt-1">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {fieldErrors.password}
                </p>
              )}
            </div>

          </div>

          <Button type="submit" className="w-full py-6 text-lg font-bold shadow-lg shadow-primary/20" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Inscription en cours...
              </>
            ) : (
              "S'inscrire"
            )}
          </Button>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">Déjà un compte ? </span>
            <Link to="/connexion" className="font-medium text-primary hover:text-primary/80 underline-offset-4 hover:underline">
              Se connecter
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;