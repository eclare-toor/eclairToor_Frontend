import { useEffect, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Button } from '../../components/ui/button';
import { ArrowRight, Star, Quote, Award, Globe, Users } from 'lucide-react';
import heroBg from '../../assets/hero-bg.avif';
import { Link } from 'react-router-dom';
import { MOCK_REVIEWS } from '../../mock_data';

// Simple functional component for features
const StatItem = ({ label, value, delay, icon: Icon }: { label: string, value: string, delay: number, icon: any }) => {
  const [count, setCount] = useState(0);
  const numericValue = parseInt(value.replace(/[^0-9]/g, ''));
  const suffix = value.replace(/[0-9]/g, '');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      onViewportEnter={() => {
        let start = 0;
        const duration = 2000;
        const increment = numericValue / (duration / 16);
        const timer = setInterval(() => {
          start += increment;
          if (start >= numericValue) {
            setCount(numericValue);
            clearInterval(timer);
          } else {
            setCount(Math.floor(start));
          }
        }, 16);
      }}
      transition={{ duration: 0.5, delay }}
      className="flex flex-col items-center"
    >
      <div className="w-14 h-14 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center text-primary mb-6 shadow-xl group-hover:bg-primary group-hover:text-white transition-all duration-500">
        <Icon className="w-7 h-7" />
      </div>
      <div className="text-5xl md:text-6xl font-black text-white mb-3 tracking-tighter">
        {count}{suffix}
      </div>
      <div className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">{label}</div>
    </motion.div>
  );
};


const HomePage = () => {
  const [typewriterIndex, setTypewriterIndex] = useState(0);
  const phrases = ["SANS LIMITES", "VOS RÊVES", "L'AVENTURE", "LE MONDE"];

  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTypewriterIndex((prev) => (prev + 1) % phrases.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Hero Section - Optimized */}
      <section className="relative h-screen min-h-[800px] flex items-center justify-center overflow-hidden">
        {/* Parallax Background with Premium Overlay */}
        <motion.div
          style={{ y: y1 }}
          className="absolute inset-0 z-0"
        >
          <div
            className="absolute inset-0 bg-cover bg-center scale-110"
            style={{ backgroundImage: `url(${heroBg})` }}
          />
          <div className="absolute inset-0 bg-slate-900/40" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-transparent to-white/30" />
        </motion.div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-6 text-center text-white pt-20">
          <motion.div
            style={{ opacity }}
            className="max-w-6xl mx-auto"
          >
            <motion.h1
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              className="text-6xl md:text-[8rem] font-black leading-[0.85] tracking-tighter mb-10 drop-shadow-2xl"
            >
              EXPLOREZ <br />
              <div className="h-[1.2em] overflow-hidden flex justify-center">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={typewriterIndex}
                    initial={{ y: 80, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -80, opacity: 0 }}
                    transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
                    className="text-transparent bg-clip-text bg-gradient-to-r from-white via-primary-300 to-primary italic block uppercase"
                  >
                    {phrases[typewriterIndex]}
                  </motion.span>
                </AnimatePresence>
              </div>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-16 leading-relaxed font-medium drop-shadow-lg"
            >
              Plus qu'une agence, votre partenaire voyage en Algérie.
              Circuits uniques, hôtels de prestige et expertise locale.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-6"
            >
              <Link to="/voyages">
                <Button size="lg" className="h-20 text-xl px-12 rounded-full shadow-2xl shadow-primary/40 hover:scale-105 transition-all duration-500 bg-primary hover:bg-white hover:text-primary font-black uppercase tracking-widest border-none">
                  Réserver un voyage
                  <ArrowRight className="ml-3 w-6 h-6" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="h-20 text-xl px-12 rounded-full bg-white/10 backdrop-blur-md border-white/30 text-white hover:bg-white hover:text-slate-900 transition-all duration-500 font-bold uppercase tracking-widest leading-none">
                  Besoin d'aide ?
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Reassurance Bar - Statistics with Icons & Increment */}
      <section className="py-24 bg-slate-900 relative">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
            <StatItem label="Voyageurs Heureux" value="12k+" delay={0.1} icon={Users} />
            <StatItem label="Destinations" value="45+" delay={0.2} icon={Globe} />
            <StatItem label="Années d'Expertise" value="08+" delay={0.3} icon={Award} />
            <StatItem label="Note Clients" value="5/5" delay={0.4} icon={Star} />
          </div>
        </div>
      </section>

      {/* Gallery Section - WOW Effect */}
      <section className="py-32 bg-white overflow-hidden">
        <div className="container mx-auto px-6 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl"
          >
            <span className="text-primary font-black uppercase tracking-[0.4em] text-[10px] mb-4 block">Notre Galerie Exclusive</span>
            <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-tight mb-8">
              Instants <span className="text-primary italic">Inoubliables</span>
            </h2>
          </motion.div>
        </div>

        <div className="flex gap-8 overflow-x-auto pb-20 scrollbar-hide px-6 snap-x">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
            <motion.div
              key={num}
              whileHover={{ scale: 1.02, y: -10 }}
              className="min-w-[320px] md:min-w-[500px] h-[600px] rounded-[4rem] overflow-hidden relative group snap-center shadow-2xl"
            >
              <img
                src={`/src/assets/galerie${num}.webp`}
                alt={`Voyage ${num}`}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                onError={(e: any) => {
                  e.target.src = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 flex items-end p-12">
                <div>
                  <p className="text-white font-black uppercase tracking-[0.3em] text-xs mb-2">Eclair Travel Galerie</p>
                  <p className="text-primary text-xl font-bold italic">Expérience #{num}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Call to Action - Moved to Middle */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="p-16 md:p-24 rounded-[4rem] bg-slate-900 overflow-hidden relative"
          >
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-30 mix-blend-overlay bg-[url('https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&q=80')] bg-cover bg-center" />
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/40 via-transparent to-blue-500/40" />

            <div className="relative z-10">
              <h2 className="text-5xl md:text-7xl font-black text-white mb-10 tracking-tighter leading-none uppercase">
                VOTRE PROCHAINE <br /> <span className="text-primary italic">DESTINATION</span>
              </h2>
              <p className="text-slate-300 text-xl md:text-2xl max-w-3xl mx-auto mb-14 leading-relaxed tracking-tight">
                Le monde est vaste, votre temps est précieux. Confiez-nous vos rêves, nous en ferons des réalités.
              </p>
              <Link to="/voyages">
                <Button size="lg" className="px-16 py-10 text-2xl rounded-full font-black shadow-[0_20px_50px_rgba(13,138,188,0.3)] hover:scale-110 transition-all duration-500 uppercase tracking-widest bg-primary hover:bg-white hover:text-primary border-none">
                  Commencer l'aventure
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Reviews Section - Ultra Trendy */}
      <section className="py-32 bg-slate-900 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-white to-transparent" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto mb-24 text-center">
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-8"
            >
              La voix de nos <br /><span className="text-primary">Voyageurs</span>
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {MOCK_REVIEWS.map((review, idx) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="bg-white/5 backdrop-blur-xl p-10 rounded-[3rem] border border-white/10 relative group hover:bg-white/10 transition-colors duration-500"
              >
                <Quote className="w-12 h-12 text-primary/30 absolute top-8 right-8 group-hover:text-primary transition-colors" />
                <div className="flex gap-1.5 mb-8">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < review.rating ? 'text-primary fill-primary' : 'text-white/20'}`}
                    />
                  ))}
                </div>
                <p className="text-slate-300 mb-10 text-xl italic font-light leading-relaxed group-hover:text-white transition-colors capitalize transition-transform">"{review.comment}"</p>
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary to-blue-500 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg transform group-hover:rotate-12 transition-transform duration-500">
                    {review.user_name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-black text-white text-lg tracking-tight">{review.user_name}</h4>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">{new Date(review.date).toLocaleDateString()}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;
