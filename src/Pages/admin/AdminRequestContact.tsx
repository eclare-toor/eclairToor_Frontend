import React, { useEffect, useState } from 'react';
import { getContactMessages } from '../../api';
import type { ContactMessage } from '../../Types';
import LoadingSpinner from '../../components/Shared/LoadingSpinner';
import { Mail, Phone, Calendar, User, MessageSquare } from 'lucide-react';

const AdminRequestContact = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const data = await getContactMessages();
      setMessages(data);
    } catch (error) {
      console.error("Failed to fetch contact messages", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Messages de Contact</h2>
        <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-semibold">
          {messages.length} Messages
        </span>
      </div>

      {loading ? (
        <div className="min-h-[400px] flex items-center justify-center">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {messages.length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center text-slate-400">
              Aucun message reçu pour le moment.
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    {/* User Info Section */}
                    <div className="space-y-4 flex-1">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900">{msg.full_name}</h3>
                          <p className="text-xs text-slate-500">ID: #{msg.id}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Mail className="w-4 h-4 text-slate-400" />
                          <a href={`mailto:${msg.email}`} className="hover:text-primary transition-colors">
                            {msg.email}
                          </a>
                        </div>
                        {msg.phone && (
                          <div className="flex items-center gap-2 text-slate-600">
                            <Phone className="w-4 h-4 text-slate-400" />
                            <a href={`tel:${msg.phone}`} className="hover:text-primary transition-colors">
                              {msg.phone}
                            </a>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-slate-500 text-xs">
                          <Calendar className="w-4 h-4" />
                          Envoyé le: {msg.created_at ? new Date(msg.created_at).toLocaleDateString() : 'Date inconnue'}
                        </div>
                      </div>
                    </div>

                    {/* Message Section */}
                    <div className="flex-[2] bg-slate-50 rounded-2xl p-4 border border-slate-100 relative">
                      <MessageSquare className="w-4 h-4 text-slate-300 absolute top-4 right-4" />
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Message</h4>
                      <p className="text-slate-700 whitespace-pre-wrap leading-relaxed italic">
                        "{msg.message}"
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AdminRequestContact;