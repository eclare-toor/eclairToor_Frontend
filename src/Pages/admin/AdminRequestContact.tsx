import React, { useEffect, useState } from 'react';
import type { ContactMessage } from '../../Types';
import { getContactMessages, updateMessageStatus } from '../../api';
import { Button } from '../../components/ui/button';
import { Mail, Phone, Calendar, Archive } from 'lucide-react';
import LoadingSpinner from '../../components/Shared/LoadingSpinner';

const AdminRequestContact = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    setLoading(true);
    const data = await getContactMessages();
    setMessages(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    await updateMessageStatus(id, 'READ');
    fetchMessages();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Messages & Contact</h2>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid gap-4">
          {messages.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-200 text-slate-400">
              <Mail className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>Aucun message pour le moment.</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={`bg-white p-6 rounded-xl border ${msg.status === 'UNREAD' ? 'border-primary/50 shadow-sm relative overflow-hidden' : 'border-slate-200 opacity-90'}`}>
                {msg.status === 'UNREAD' && (
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                )}

                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-lg text-slate-900">{msg.full_name}</h3>
                      <span className="text-xs font-mono text-slate-400">{msg.email}</span>
                      {msg.status === 'UNREAD' && (
                        <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Nouveau</span>
                      )}
                    </div>
                    <p className="font-medium text-slate-800">{msg.subject}</p>
                    <p className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100">
                      {msg.message}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-slate-400 pt-2">
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {msg.phone || 'N/A'}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(msg.created_at).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex items-start">
                    {msg.status === 'UNREAD' && (
                      <Button variant="outline" size="sm" onClick={() => handleMarkAsRead(msg.id)}>
                        <Archive className="w-4 h-4 mr-2" /> Marquer comme lu
                      </Button>
                    )}
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