import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login as apiLogin } from '../../api';
import { useAuth } from '../../Context/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Loader2, Mail, Lock } from 'lucide-react';
import logo from '../../assets/logo.png';
import { toast } from 'react-toastify';

import { useTranslation } from 'react-i18next';

const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);


  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    try {
      // 1. Call API
      console.log('📤 Sending login request for:', formData.email);

      const { message, user, token } = await apiLogin(formData.email, formData.password);
      console.log('✅ Login successful:', { message, user });

      // 2. Show success toast
      toast.success(message || t('auth.login_success'));

      // 3. Login Context
      login(token, user);

      // 4. Redirect
      if (user?.role === 'admin') {
        console.log('user.role', user.role);
        navigate('/admin');

      } else {
        navigate('/');
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      const errorMessage = err instanceof Error ? err.message : t('auth.errors.generic');
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
        <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute top-[40%] -left-[10%] w-[40%] h-[40%] rounded-full bg-secondary/5 blur-[100px]" />
      </div>

      <div className="max-w-md w-full space-y-8 bg-card p-8 rounded-3xl border shadow-xl">
        <div className="text-center">
          <Link to="/" className="inline-block mb-4">
            <img src={logo} alt="Eclair Travel" className="h-20 w-20 rounded-2xl object-cover mx-auto" />
          </Link>
          <h2 className="mt-2 text-3xl font-heading font-bold text-foreground">
            {t('auth.welcome_back')}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t('auth.subtitle_login')}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.email_label')}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="pl-10"
                  placeholder={t('auth.email_placeholder')}
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t('auth.password_label')}</Label>
                <Link to="#" className="text-xs text-primary hover:underline">
                  {t('auth.forgot_password')}
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="pl-10"
                  placeholder={t('auth.password_placeholder')}
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>

          </div>

          <Button type="submit" className="w-full py-6 text-lg font-bold shadow-lg shadow-primary/20" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('auth.login_loading')}
              </>
            ) : (
              t('auth.login_btn')
            )}
          </Button>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">{t('auth.no_account')} </span>
            <Link to="/inscription" className="font-medium text-primary hover:text-primary/80 underline-offset-4 hover:underline">
              {t('auth.register_link')}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;