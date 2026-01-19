import { useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, MapPin, Calendar, Users, Download, ArrowRight, Home } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import logo from '../../../assets/logo.png';

const CongratulationReservation = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { reservationId, trip, totalPrice, passengers } = location.state || {}; // Receive data

  // Redirect if accessed directly without state
  useEffect(() => {
    if (!reservationId) {
      const timer = setTimeout(() => navigate('/'), 3000); // Redirect after 3s if invalid
      return () => clearTimeout(timer);
    }
  }, [reservationId, navigate]);

  if (!reservationId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800">{t('congratulation.not_found_title')}</h2>
          <p>{t('congratulation.redirect_message')}</p>
        </div>
      </div>
    );
  }

  const handleDownloadTicket = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error(t('dashboard.errors.ticket_popup_blocked'));
      return;
    }

    const date = new Date();
    const booking = {
      id: reservationId,
      title: trip?.title || 'Voyage',
      destination_country: trip?.destination_wilaya || trip?.destination_country || trip?.omra_category || trip?.type,
      created_at: date.toISOString(),
      passengers_adult: passengers?.adults || 0,
      passengers_child: passengers?.children || 0,
      passengers_baby: passengers?.babies || 0,
      type: trip?.type,
      total_price: totalPrice,
      status: 'PENDING'
    };

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Billet - ${booking.title}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
          body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; max-width: 800px; margin: 0 auto; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          @page { margin: 0; size: auto; }
          @media print { body { padding: 40px; margin: 20px auto; } }
          
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 40px; }
          .logo-section { display: flex; align-items: center; gap: 15px; }
          .logo-img { height: 60px; width: auto; object-fit: contain; }
          .brand { font-size: 24px; font-weight: 900; letter-spacing: -1px; line-height: 1; }
          .brand span { color: #2563eb; }
          .ticket-type { background: #f1f5f9; padding: 8px 16px; border-radius: 8px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #64748b; border: 1px solid #e2e8f0; }
          
          .trip-title { font-size: 32px; font-weight: 800; margin-bottom: 10px; color: #0f172a; line-height: 1.2; }
          .ref { color: #64748b; font-size: 14px; font-weight: 500; margin-bottom: 40px; font-family: monospace; background: #f8fafc; display: inline-block; padding: 4px 12px; border-radius: 6px; border: 1px solid #e2e8f0; }
          
          .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 30px; margin-bottom: 40px; }
          .label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; font-weight: 700; margin-bottom: 8px; }
          .value { font-size: 18px; font-weight: 600; color: #334155; }
          
          .status-box { background: #f8fafc; padding: 24px; border-radius: 16px; display: flex; justify-content: space-between; align-items: center; border: 1px solid #e2e8f0; }
          .status-badge { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 99px; font-weight: 700; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; }
          .status-confirmed { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
          .status-pending { background: #fef3c7; color: #92400e; border: 1px solid #fde68a; }
          
          .price-large { font-size: 28px; font-weight: 800; color: #2563eb; letter-spacing: -0.5px; }
          
          .footer { margin-top: 60px; padding-top: 30px; border-top: 1px dashed #cbd5e1; text-align: center; color: #94a3b8; font-size: 12px; }
          .footer p { margin: 4px 0; }
        </style>
      </head>
      <body>
        <div class="header">
            <div class="logo-section">
                <img src="${window.location.origin}${logo}" class="logo-img" alt="Logo" onerror="this.style.display='none'"/>
                <div class="brand">ECLAIR<span>TRAVEL</span></div>
            </div>
            <div class="ticket-type">${t('dashboard.ticket.title')}</div>
        </div>
        
        <h1 class="trip-title">Billet - ${booking.title || t('dashboard.ticket.unspecified')}</h1>
        <div class="ref">RÉF: #${booking.id.slice(0, 8).toUpperCase()}</div>

        <div class="grid">
            <div>
                <div class="label">${t('dashboard.ticket.destination')}</div>
                <div class="value">${booking.destination_country || booking.title || t('dashboard.ticket.unspecified')}</div>
            </div>
            <div>
                <div class="label">${t('dashboard.ticket.date')}</div>
                <div class="value">${new Date(booking.created_at || Date.now()).toLocaleDateString(i18n.language, { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            </div>
            <div>
                <div class="label">${t('dashboard.ticket.passengers')}</div>
                <div class="value">
                    ${booking.passengers_adult} ${t('reservation.passengers.adults')}
                    ${booking.passengers_child > 0 ? `, ${booking.passengers_child} ${t('reservation.passengers.children')}` : ''}
                    ${booking.passengers_baby > 0 ? `, ${booking.passengers_baby} ${t('reservation.passengers.babies')}` : ''}
                </div>
            </div>
            <div>
                <div class="label">${t('dashboard.ticket.type')}</div>
                <div class="value" style="text-transform: capitalize;">${booking.type || t('dashboard.ticket.unspecified')}</div>
            </div>
        </div>

        <div class="status-box">
            <div>
                <div class="label">${t('dashboard.ticket.status')}</div>
                <div class="status-badge status-pending">
                    <span>●</span> ${t('dashboard.bookings.status.pending')}
                </div>
            </div>
            <div style="text-align: right;">
                <div class="label">${t('dashboard.ticket.total')}</div>
                <div class="price-large">${(booking.total_price || 0).toLocaleString()} DZD</div>
            </div>
        </div>

        <div class="footer">
            <p>${t('dashboard.ticket.footer_1')}</p>
            <p>${t('dashboard.ticket.footer_2')}</p>
        </div>
        
        <script>
            window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden flex items-center justify-center p-4 pt-40">

      <div className="max-w-3xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden relative z-10 animate-fade-in-up">
        {/* Header Color Bar */}
        <div className="h-4 bg-gradient-to-r from-primary to-green-400 w-full" />

        <div className="p-8 md:p-12 text-center space-y-8">

          {/* Success Icon */}
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-25" />
            <div className="relative bg-green-100 p-6 rounded-full inline-flex items-center justify-center mb-2">
              <CheckCircle2 className="w-16 h-16 text-green-600" />
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-slate-900">
              {t('congratulation.title')}
            </h1>
            <p className="text-xl text-slate-600">
              {t('congratulation.subtitle')}
            </p>
            <div className="inline-block bg-slate-100 px-4 py-2 rounded-lg border border-slate-200 text-sm font-mono text-slate-600 mt-2">
              {t('congratulation.reservation_id')}: <span className="font-bold text-slate-900">{reservationId}</span>
            </div>
          </div>

          {/* Trip Summary Card (Mini) */}
          {trip && (
            <div className="bg-white/50 backdrop-blur-md rounded-2xl p-6 text-left border border-white/40 flex flex-col md:flex-row gap-6 items-center shadow-sm">
              <img
                src={trip.images[0] ? (trip.images[0].startsWith('http') ? trip.images[0] : `http://localhost:3000/api${trip.images[0]}`) : 'https://via.placeholder.com/400x300'}
                alt={trip.title}
                className="w-24 h-24 rounded-xl object-cover shadow-sm"
              />
              <div className="flex-1 space-y-2">
                <h3 className="font-bold text-lg text-slate-900">{trip.title}</h3>
                <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {trip.destination_wilaya || trip.destination_country || trip.omra_category || trip.type}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(trip.start_date).toLocaleDateString(i18n.language)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {passengers.adults + passengers.children + passengers.babies} {t('congratulation.trip_summary.travelers')}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500">{t('congratulation.trip_summary.total_paid')}</p>
                <p className="text-2xl font-bold text-primary">{totalPrice.toLocaleString()} DZD</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button className="w-full sm:w-auto gap-2" size="lg" onClick={handleDownloadTicket}>
              <Download className="w-4 h-4" />
              {t('congratulation.download_btn')}
            </Button>
            <Link to="/mon-compte">
              <Button variant="outline" className="w-full sm:w-auto gap-2" size="lg">
                {t('congratulation.my_bookings_btn')} <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <Link to="/" className="inline-block text-slate-400 hover:text-slate-600 text-sm mt-4 flex items-center justify-center gap-1">
            <Home className="w-3 h-3" />
            {t('congratulation.home_link')}
          </Link>

        </div>
      </div>
    </div>
  );
};

export default CongratulationReservation;