import { useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, MapPin, Calendar, Users, Download, ArrowRight, Home } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { useAuth } from '../../../Context/AuthContext';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
// Extend jsPDF type to include autoTable
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => void;
}

const CongratulationReservation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
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
          <h2 className="text-2xl font-bold text-slate-800">Réservation introuvable</h2>
          <p>Redirection vers l'accueil...</p>
        </div>
      </div>
    );
  }

  const handleDownloadTicket = () => {
    const doc = new jsPDF() as jsPDFWithAutoTable;

    // Header
    doc.setFillColor(68, 190, 199); // Primary color (cyan-ish)
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text('ECLAIR TRAVEL', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text('BILLET DE RÉSERVATION', 105, 30, { align: 'center' });

    // Reservation Info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(`ID Réservation: ${reservationId}`, 20, 60);
    doc.text(`Date de réservation: ${new Date().toLocaleDateString()}`, 20, 68);
    doc.text(`Status: CONFIRMÉE`, 20, 76);

    // Client Info
    if (user) {
      doc.setFontSize(14);
      doc.setTextColor(68, 190, 199);
      doc.text('INFORMATIONS CLIENT', 20, 95);
      doc.line(20, 97, 190, 97);

      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text(`Nom complet: ${user.nom} ${user.prenom}`, 20, 105);
      doc.text(`Email: ${user.email}`, 20, 112);
      if (user.phone) doc.text(`Téléphone: ${user.phone}`, 20, 119);
    }

    // Trip Info
    const startY = user ? 135 : 95;
    doc.setFontSize(14);
    doc.setTextColor(68, 190, 199);
    doc.text('DÉTAILS DU VOYAGE', 20, startY);
    doc.line(20, startY + 2, 190, startY + 2);

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    const destination = trip?.destination_wilaya || trip?.destination_country || trip?.omra_category || trip?.type || 'N/A';

    doc.text(`Titre: ${trip?.title || ''}`, 20, startY + 10);
    doc.text(`Destination: ${destination}`, 20, startY + 17);
    doc.text(`Départ: ${trip ? new Date(trip.start_date).toLocaleDateString() : 'N/A'}`, 20, startY + 24);
    doc.text(`Retour: ${trip ? new Date(trip.end_date).toLocaleDateString() : 'N/A'}`, 120, startY + 24);

    // Passengers Table
    if (passengers) {
      doc.autoTable({
        startY: startY + 35,
        head: [['Type', 'Nombre']],
        body: [
          ['Adultes', passengers.adults || 0],
          ['Enfants', passengers.children || 0],
          ['Bébés', passengers.babies || 0],
        ],
        theme: 'grid',
        headStyles: { fillColor: [68, 190, 199] }
      });
    }

    // Total
    const finalY = (doc as any).lastAutoTable?.finalY || (startY + 40);
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text(`TOTAL PAYÉ: ${totalPrice?.toLocaleString() || 0} DZD`, 190, finalY + 20, { align: 'right' });

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text('Ce document est une preuve de réservation. Veuillez le présenter lors de votre départ.', 105, 280, { align: 'center' });

    doc.save(`Billet_EclairTravel_${reservationId}.pdf`);
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
              Félicitations !
            </h1>
            <p className="text-xl text-slate-600">
              Votre réservation a été confirmée avec succès.
            </p>
            <div className="inline-block bg-slate-100 px-4 py-2 rounded-lg border border-slate-200 text-sm font-mono text-slate-600 mt-2">
              ID Réservation: <span className="font-bold text-slate-900">{reservationId}</span>
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
                    {new Date(trip.start_date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {passengers.adults + passengers.children + passengers.babies} Voyageurs
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500">Total payé</p>
                <p className="text-2xl font-bold text-primary">{totalPrice.toLocaleString()} DZD</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button className="w-full sm:w-auto gap-2" size="lg" onClick={handleDownloadTicket}>
              <Download className="w-4 h-4" />
              Télécharger le billet
            </Button>
            <Link to="/mon-compte">
              <Button variant="outline" className="w-full sm:w-auto gap-2" size="lg">
                Voir mes réservations <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <Link to="/" className="inline-block text-slate-400 hover:text-slate-600 text-sm mt-4 flex items-center justify-center gap-1">
            <Home className="w-3 h-3" />
            Retour à l'accueil
          </Link>

        </div>
      </div>
    </div>
  );
};

export default CongratulationReservation;