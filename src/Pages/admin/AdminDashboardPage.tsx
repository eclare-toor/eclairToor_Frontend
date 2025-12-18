//Vue d'ensemble (Stats, KPIs, Dernières activités).
import React from 'react';
import { Users, Map, Globe, BedDouble, TrendingUp, Calendar } from 'lucide-react';

const StatCard = ({ icon: Icon, title, value, subtext, color }: { icon: any, title: string, value: string, subtext: string, color: string }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-start justify-between hover:shadow-md transition-shadow">
    <div>
      <p className="text-slate-500 font-medium text-sm mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-slate-900 mb-2">{value}</h3>
      <p className="text-xs text-slate-400">{subtext}</p>
    </div>
    <div className={`p-4 rounded-xl ${color} bg-opacity-10 text-opacity-100`}>
      {/* Note: The color logic below is simplified for Tailwind classes constructed dynamically */}
      <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
    </div>
  </div>
);

function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Tableau de bord</h2>
        <p className="text-slate-500">Bienvenue sur votre espace d'administration.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          title="Clients Inscrits"
          value="1,240"
          subtext="+12% ce mois"
          color="bg-blue-500"
        />
        <StatCard
          icon={Map}
          title="Voyages Actifs"
          value="24"
          subtext="8 destinations"
          color="bg-green-500"
        />
        <StatCard
          icon={Calendar}
          title="Réservations"
          value="86"
          subtext="En attente de confirmation"
          color="bg-orange-500"
        />
        <StatCard
          icon={BedDouble}
          title="Hôtels Omra"
          value="12"
          subtext="Partenaires vérifiés"
          color="bg-purple-500"
        />
      </div>

      {/* Sections: Activities & Top Destinations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Top Destinations */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" /> Destinations Populaires
          </h3>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1565552629477-gin-4d4c4ec9?auto=format&fit=crop&q=80)' }} />
              <div className="flex-1">
                <h4 className="font-bold text-slate-800">La Mecque (Omra)</h4>
                <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
                  <div className="bg-primary h-full w-[85%]" />
                </div>
              </div>
              <span className="font-bold text-slate-900">85%</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1542401886-65d6c61db217?auto=format&fit=crop&q=80)' }} />
              <div className="flex-1">
                <h4 className="font-bold text-slate-800">Sahara Algérien</h4>
                <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
                  <div className="bg-orange-500 h-full w-[65%]" />
                </div>
              </div>
              <span className="font-bold text-slate-900">65%</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&q=80)' }} />
              <div className="flex-1">
                <h4 className="font-bold text-slate-800">Istanbul</h4>
                <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
                  <div className="bg-blue-500 h-full w-[50%]" />
                </div>
              </div>
              <span className="font-bold text-slate-900">50%</span>
            </div>
          </div>
        </div>

        {/* Recent Activities (Static Mock) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-6">Activités Récentes</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors cursor-default border border-transparent hover:border-slate-100">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                  UD
                </div>
                <div>
                  <p className="text-sm text-slate-800 font-medium">
                    <span className="font-bold">Amine Benali</span> a réservé le voyage <span className="font-bold text-primary">Omra VIP</span>.
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Il y a 2 heures</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

export default AdminDashboardPage