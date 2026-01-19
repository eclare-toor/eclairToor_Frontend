import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Mail, Phone, MapPin, Send, CheckCircle, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { sendContactMessage } from '../../api';

const Contact = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await sendContactMessage(formData);
      setSuccess(true);
      setFormData({ full_name: '', email: '', phone: '', message: '' });
    } catch (err: any) {
      console.error("Contact Form Error:", err);
      setError(err.message || t('auth.errors.generic'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent pt-52  pb-20">
      <div className="container mx-auto px-4">

        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-slate-900">
            {t('contact.title')}
          </h1>
          <p className="text-lg text-slate-600">
            {t('contact.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 max-w-6xl mx-auto">

          {/* Contact Info */}
          <div className="space-y-10">
            <div className="bg-white/70 backdrop-blur-2xl p-8 rounded-[2.5rem] shadow-2xl shadow-blue-900/5 border border-white/40 space-y-6">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">{t('contact.coords_title')}</h3>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-xl text-primary">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 mb-1">{t('contact.agency_label')}</p>
                  <p className="text-slate-600 whitespace-pre-line">
                    {t('contact.agency_address')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-xl text-primary">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 mb-1">{t('contact.phone_label')}</p>
                  <p className="text-slate-600 hover:text-primary transition-colors cursor-pointer">
                    +213 550 12 34 56
                  </p>
                  <p className="text-slate-600 hover:text-primary transition-colors cursor-pointer">
                    +213 21 00 00 00
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-xl text-primary">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 mb-1">{t('contact.email_label')}</p>
                  <p className="text-slate-600 hover:text-primary transition-colors cursor-pointer">
                    contact@eclair-travel.com
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-xl text-primary">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 mb-1">{t('contact.hours_label')}</p>
                  <p className="text-slate-600 whitespace-pre-line">
                    {t('contact.hours_val')}
                  </p>
                </div>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="h-64 bg-slate-200 rounded-3xl overflow-hidden relative">
              <div className="absolute inset-0 flex items-center justify-center text-slate-400 font-bold bg-slate-100/50">
                <MapPin className="w-8 h-8 mr-2" />
                Google Maps Integration
              </div>
              <img
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1474&q=80"
                className="w-full h-full object-cover opacity-50 grayscale"
                alt="Map"
              />
            </div>
          </div>

          {/* Form */}
          <div className="bg-white/70 backdrop-blur-2xl p-8 md:p-10 rounded-[2.5rem] shadow-2xl shadow-blue-900/10 border border-white/50">

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900">{t('contact.form_title')}</h2>
              <p className="text-slate-500 mt-2">{t('contact.form_subtitle')}</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm animate-fade-in">
                {error}
              </div>
            )}

            {success ? (
              <div className="py-20 text-center animate-fade-in-up">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">{t('contact.success_title')}</h3>
                <p className="text-slate-600 mb-8">{t('contact.success_desc')}</p>
                <Button onClick={() => setSuccess(false)} variant="outline">{t('contact.new_message_btn')}</Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">{t('contact.full_name_label')}</Label>
                    <Input
                      id="full_name"
                      name="full_name"
                      required
                      placeholder="Votre nom"
                      className="bg-slate-50 border-slate-200 h-11"
                      value={formData.full_name}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t('contact.phone_label')}</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="055..."
                      className="bg-slate-50 border-slate-200 h-11"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">{t('auth.email_label')}</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="email@exemple.com"
                    className="bg-slate-50 border-slate-200 h-11"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">{t('contact.message_label')}</Label>
                  <Textarea
                    id="message"
                    name="message"
                    required
                    placeholder="Votre message..."
                    className="bg-slate-50 border-slate-200 min-h-[150px] resize-none"
                    value={formData.message}
                    onChange={handleChange}
                  />
                </div>

                <Button type="submit" size="lg" className="w-full text-lg h-12 font-bold gap-2" disabled={loading}>
                  {loading ? t('contact.sending') : (
                    <>
                      {t('contact.send_btn')} <Send className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Contact;