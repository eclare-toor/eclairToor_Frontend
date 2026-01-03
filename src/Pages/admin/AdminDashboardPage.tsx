import React, { useState, useEffect } from 'react';
import { Users, Map, BedDouble, TrendingUp, Calendar, Bell, Clock, AlertCircle } from 'lucide-react';
import { getNotifications } from '../../api';
import type { AppNotification } from '../../Types';
import LoadingSpinner from '../../components/Shared/LoadingSpinner';
import { cn } from '../../lib/utils';

const StatCard = ({ icon: Icon, title, value, subtext, color }: { icon: any, title: string, value: string, subtext: string, color: string }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-start justify-between hover:shadow-md transition-shadow">
    <div>
      <p className="text-slate-500 font-medium text-sm mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-slate-900 mb-2">{value}</h3>
      <p className="text-xs text-slate-400">{subtext}</p>
    </div>
    <div className={cn("p-4 rounded-xl bg-opacity-10", color)}>
      <Icon className={cn("w-6 h-6", color.replace('bg-', 'text-'))} />
    </div>
  </div>
);

function AdminDashboardPage() {
  const [activities, setActivities] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const data = await getNotifications();
        // Sort by latest first and take top 5
        const lastFive = (data || []).sort((a, b) => {
          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return dateB - dateA;
        }).slice(0, 5);

        setActivities(lastFive);
      } catch (error) {
        console.error('Error fetching dashboard activities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const getActivityIcon = (type: string) => {
    if (type.includes('payment')) return { icon: TrendingUp, bg: 'bg-green-100', text: 'text-green-600' };
    if (type.includes('booking')) return { icon: Calendar, bg: 'bg-blue-100', text: 'text-blue-600' };
    if (type.includes('request')) return { icon: Bell, bg: 'bg-amber-100', text: 'text-amber-600' };
    return { icon: AlertCircle, bg: 'bg-slate-100', text: 'text-slate-600' };
  };

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

        {/* Recent Activities (Real Data) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" /> Activités Récentes
          </h3>

          {loading ? (
            <div className="py-20 flex justify-center">
              <LoadingSpinner />
            </div>
          ) : activities.length === 0 ? (
            <div className="py-20 text-center text-slate-400">
              <Bell className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>Aucune activité récente.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => {
                const style = getActivityIcon(activity.type);
                const Icon = style.icon;
                return (
                  <div key={activity.id} className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors cursor-default border border-transparent hover:border-slate-100">
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0", style.bg, style.text)}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-800 font-medium">
                        <span className="font-bold">{activity.title}</span>: {activity.message}
                      </p>
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {activity.created_at ? new Date(activity.created_at).toLocaleString() : 'Récemment'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default AdminDashboardPage