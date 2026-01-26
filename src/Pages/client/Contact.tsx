import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Mail, Phone, MapPin, Send, CheckCircle, Clock, Sparkles } from '../../components/icons';
import { useTranslation } from 'react-i18next';
import { sendContactMessage } from '../../api';
import BackgroundAura from '../../components/Shared/BackgroundAura';
import { motion } from 'framer-motion';

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
    <div className="min-h-screen bg-transparent relative overflow-hidden pb-24">
      <BackgroundAura />

      {/* Hero Section */}
      <div className="relative h-[60vh] min-h-[500px] w-full flex items-center justify-center overflow-hidden mb-[-100px] ">

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 backdrop-blur-md border border-white/20 rounded-full text-white text-[10px] font-black uppercase tracking-[0.3em] mb-6">
              <Sparkles className="w-4 h-4" />
              {t('contact.subtitle')}
            </span>
            <h1 className="text-6xl md:text-8xl font-black text-white italic tracking-tighter drop-shadow-2xl mb-4 leading-tight uppercase">
              {t('contact.title')}
            </h1>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">

          {/* Left: Contact Info Cards */}
          <div className="lg:col-span-5 space-y-6">
            <motion.div
              initial={{ x: -30, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              className="bg-white/80 backdrop-blur-2xl p-10 rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-white/60 space-y-10"
            >
              <div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter italic mb-2 uppercase">{t('contact.coords_title')}</h3>
                <p className="text-slate-500 font-medium">{t('contact.form_subtitle')}</p>
              </div>

              <div className="space-y-8">
                <div className="flex items-start gap-6 group">
                  <div className="w-14 h-14 bg-slate-50 flex items-center justify-center rounded-2xl group-hover:bg-primary group-hover:text-white transition-all duration-500 shrink-0 shadow-sm border border-slate-100">
                    <MapPin className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('contact.agency_label')}</p>
                    <p className="text-lg font-bold text-slate-900 leading-tight">
                      {t('contact.agency_address')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-6 group">
                  <div className="w-14 h-14 bg-slate-50 flex items-center justify-center rounded-2xl group-hover:bg-primary group-hover:text-white transition-all duration-500 shrink-0 shadow-sm border border-slate-100">
                    <Phone className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('contact.phone_label')}</p>
                    <div className="space-y-1">
                      <p className="text-lg font-bold text-slate-900 hover:text-primary transition-colors cursor-pointer">+213 560 043 393</p>
                      <p className="text-lg font-bold text-slate-900 hover:text-primary transition-colors cursor-pointer">+213 667 441 129</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-6 group">
                  <div className="w-14 h-14 bg-slate-50 flex items-center justify-center rounded-2xl group-hover:bg-primary group-hover:text-white transition-all duration-500 shrink-0 shadow-sm border border-slate-100">
                    <Mail className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('contact.email_label')}</p>
                    <p className="text-lg font-bold text-slate-900 hover:text-primary transition-colors cursor-pointer">
                      eclairtravel@gmail.com
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-6 group">
                  <div className="w-14 h-14 bg-slate-50 flex items-center justify-center rounded-2xl group-hover:bg-primary group-hover:text-white transition-all duration-500 shrink-0 shadow-sm border border-slate-100">
                    <Clock className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('contact.hours_label')}</p>
                    <p className="text-lg font-bold text-slate-900 whitespace-pre-line">
                      {t('contact.hours_val')}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Google Maps Integration - Visual WoW */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              className="h-64 rounded-[3rem] overflow-hidden shadow-2xl relative group border-4 border-white"
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3197.0972517630626!2d3.0325490768887824!3d36.74423667226312!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x128fb20a8938e9fb%3A0x84abde430d7fc0bc!2sEclair%20Travel!5e0!3m2!1sen!2sdz!4v1767611800947!5m2!1sen!2sdz"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="grayscale group-hover:grayscale-0 transition-all duration-1000 scale-105"
              ></iframe>
              <div className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-md rounded-full shadow-lg pointer-events-none">
                <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Notre Siege Social</span>
              </div>
            </motion.div>
          </div>

          {/* Right: Contact Form */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ x: 30, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              className="bg-white p-10 md:p-16 rounded-[4rem] shadow-2xl shadow-blue-900/10 border border-slate-100 relative overflow-hidden"
            >
              {/* Decorative element */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl -z-0" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full -ml-32 -mb-32 blur-3xl -z-0" />

              <div className="relative z-10">
                <div className="mb-12">
                  <div className="w-20 h-2 bg-primary mb-8 rounded-full" />
                  <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter italic uppercase leading-none">{t('contact.form_title')}</h2>
                  <p className="text-slate-500 mt-4 text-xl font-medium">{t('contact.form_subtitle')}</p>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-8 p-6 bg-red-50 border border-red-100 text-red-600 rounded-3xl text-sm font-bold flex items-center gap-4"
                  >
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0">
                      ⚠️
                    </div>
                    {error}
                  </motion.div>
                )}

                {success ? (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="py-20 text-center"
                  >
                    <div className="w-32 h-32 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-10 shadow-inner">
                      <CheckCircle className="w-16 h-16 text-emerald-500 shadow-sm" />
                    </div>
                    <h3 className="text-4xl font-black text-slate-900 mb-4 tracking-tight uppercase italic">{t('contact.success_title')}</h3>
                    <p className="text-slate-500 text-xl mb-12 max-w-sm mx-auto font-medium">{t('contact.success_desc')}</p>
                    <Button
                      onClick={() => setSuccess(false)}
                      className="px-12 h-16 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest hover:bg-primary transition-all shadow-xl"
                    >
                      {t('contact.new_message_btn')}
                    </Button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <Label htmlFor="full_name" className="text-sm font-black text-slate-900 uppercase tracking-widest ml-2">{t('contact.full_name_label')}</Label>
                        <Input
                          id="full_name"
                          name="full_name"
                          required
                          placeholder="Ex: Mohamed Amine"
                          className="h-16 px-6 bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 rounded-2xl font-bold text-lg transition-all"
                          value={formData.full_name}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="phone" className="text-sm font-black text-slate-900 uppercase tracking-widest ml-2">{t('contact.phone_label')}</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          placeholder="05 50 12 34 56"
                          className="h-16 px-6 bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 rounded-2xl font-bold text-lg transition-all"
                          value={formData.phone}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="email" className="text-sm font-black text-slate-900 uppercase tracking-widest ml-2">{t('auth.email_label')}</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        placeholder="amine@eclair-travel.com"
                        className="h-16 px-6 bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 rounded-2xl font-bold text-lg transition-all"
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="message" className="text-sm font-black text-slate-900 uppercase tracking-widest ml-2">{t('contact.message_label')}</Label>
                      <Textarea
                        id="message"
                        name="message"
                        required
                        placeholder="Comment pouvons-nous vous aider ?"
                        className="p-6 bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 rounded-3xl min-h-[220px] resize-none font-bold text-lg transition-all"
                        value={formData.message}
                        onChange={handleChange}
                      />
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full text-xl h-20 rounded-[2rem] font-black uppercase tracking-[0.2em] gap-4 shadow-2xl shadow-primary/30 transition-all hover:scale-[1.02]"
                      disabled={loading}
                    >
                      {loading ? (
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                          {t('contact.sending')}
                        </div>
                      ) : (
                        <>
                          {t('contact.send_btn')} <Send className="w-6 h-6 italic" />
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
