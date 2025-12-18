import React from 'react';
import { Button } from '../../components/ui/button';
import { ArrowRight, MapPin, Star, ShieldCheck, Heart, Users, Quote } from 'lucide-react';
import heroBg from '../../assets/hero-bg.avif'
import { Link } from 'react-router-dom';
import { MOCK_REVIEWS } from '../../mock_data';
import TripCard from '../../components/Shared/TripCard'; // Assuming we might want to show featured trips later, but for now just structure.
import { getTripsByType } from '../../api';

// Simple functional component for features
const FeatureCard = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4">
      <Icon className="w-6 h-6" />
    </div>
    <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
    <p className="text-slate-600">{description}</p>
  </div>
);

const HomePage = () => {
  // We could fetch featured trips here if needed.

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${heroBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-black/40" /> {/* Dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" /> {/* Bottom fade */}
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 text-center text-white space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-medium animate-fade-in-up hover:bg-white/20 transition-colors cursor-default">
            <MapPin className="w-4 h-4 text-primary-400" />
            <span>Découvrez des destinations inoubliables</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-heading font-bold leading-tight tracking-tight animate-fade-in-up delay-100 drop-shadow-lg">
            Voyagez au-delà <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-200">
              de vos rêves
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-200 max-w-2xl mx-auto animate-fade-in-up delay-200 leading-relaxed font-light">
            Eclair Travel vous accompagne pour créer des souvenirs uniques.
            Voyages organisés, hôtels de luxe et vols aux meilleurs prix, conçus pour vous.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-fade-in-up delay-300">
            <Link to="/voyages">
              <Button size="lg" className="text-lg px-8 py-6 rounded-full shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:scale-105 transition-all duration-300 bg-primary hover:bg-primary/90">
                Explorer les voyages
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 rounded-full bg-white/5 backdrop-blur-md border-white/20 text-white hover:bg-white/10 hover:text-white hover:border-white/40 transition-all duration-300">
                Nous contacter
              </Button>
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-white/50">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center p-1">
            <div className="w-1 h-2 bg-white rounded-full" />
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-slate-900 mb-4">
              Pourquoi choisir Eclair Travel ?
            </h2>
            <p className="text-slate-600">
              Nous nous engageons à vous offrir excellence, confort et sérénité pour chaque voyage.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={ShieldCheck}
              title="Confiance & Sécurité"
              description="Voyagez l'esprit tranquille. Nous garantissons des paiements sécurisés et une assistance 24/7."
            />
            <FeatureCard
              icon={Heart}
              title="Expériences Sur Mesure"
              description="Nos experts conçoivent des itinéraires personnalisés pour répondre à toutes vos envies."
            />
            <FeatureCard
              icon={Users}
              title="Accompagnement Dédié"
              description="De la réservation à votre retour, notre équipe vous guide à chaque étape."
            />
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-slate-900 mb-4">
              Ce que disent nos voyageurs
            </h2>
            <p className="text-slate-600">
              Découvrez les retours de nos clients satisfaits.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {MOCK_REVIEWS.map((review) => (
              <div key={review.id} className="bg-slate-50 p-8 rounded-3xl relative">
                <Quote className="w-10 h-10 text-primary/20 absolute top-6 right-6" />
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}`}
                    />
                  ))}
                </div>
                <p className="text-slate-700 mb-6 italic">"{review.comment}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {review.user_name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{review.user_name}</h4>
                    <p className="text-xs text-slate-500">{new Date(review.date).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=2021&q=80')] bg-cover bg-center opacity-20" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="text-3xl md:text-5xl font-heading font-bold text-white mb-6">
            Prêt pour votre prochaine aventure ?
          </h2>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto mb-8">
            Rejoignez des milliers de voyageurs satisfaits et commencez à planifier votre voyage de rêve dès aujourd'hui.
          </p>
          <Link to="/voyages">
            <Button size="lg" className="px-10 py-7 text-lg rounded-full font-bold shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:scale-105 transition-all">
              Réserver maintenant
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;