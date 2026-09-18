import React, { useEffect, useRef, useState } from 'react';
import { Bell, Check, MessageCircle, Mic, Paperclip, Send, Square, Users, X } from 'lucide-react';

interface ChatMessage {
  id: string;
  author: string;
  role: string;
  body?: string;
  audioUrl?: string;
  time: string;
  own?: boolean;
}

const initialMessages: ChatMessage[] = [
  { id: '1', author: 'Équipe RESTO QR', role: 'Information', body: 'Bienvenue dans le groupe de votre restaurant. Les alertes importantes et les échanges d’équipe apparaîtront ici.', time: '09:15' },
  { id: '2', author: 'Aïcha', role: 'Gérante', body: 'Bonjour l’équipe, pensez à vérifier les réservations de ce soir.', time: '09:22' },
];

export const RestaurantTeamChat: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState('');
  const [recording, setRecording] = useState(false);
  const [unread, setUnread] = useState(2);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => () => recorderRef.current?.stop(), []);

  const sendMessage = () => {
    const body = draft.trim();
    if (!body) return;
    setMessages(current => [...current, { id: crypto.randomUUID(), author: 'Vous', role: 'Équipe', body, time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }), own: true }]);
    setDraft('');
  };

  const toggleRecording = async () => {
    if (recording && recorderRef.current) {
      recorderRef.current.stop();
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) return;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    chunksRef.current = [];
    recorder.ondataavailable = event => chunksRef.current.push(event.data);
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
      const audioUrl = URL.createObjectURL(blob);
      setMessages(current => [...current, { id: crypto.randomUUID(), author: 'Vous', role: 'Message vocal', audioUrl, time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }), own: true }]);
      stream.getTracks().forEach(track => track.stop());
      setRecording(false);
    };
    recorderRef.current = recorder;
    recorder.start();
    setRecording(true);
  };

  return (
    <>
      {open && (
        <section className="fixed bottom-24 right-4 z-50 flex h-[min(620px,calc(100vh-7rem))] w-[min(390px,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-2xl" aria-label="Chat de l'équipe">
          <header className="flex items-center justify-between bg-stone-950 px-5 py-4 text-white">
            <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-600"><Users className="h-5 w-5" /></div><div><h2 className="text-sm font-black">Équipe du restaurant</h2><p className="text-[11px] text-stone-400">Discussion privée · 5 membres</p></div></div>
            <button onClick={() => setOpen(false)} className="rounded-xl p-2 text-stone-400 hover:bg-stone-800 hover:text-white" aria-label="Fermer le chat"><X className="h-4 w-4" /></button>
          </header>
          <div className="flex items-center gap-2 border-b border-amber-100 bg-amber-50 px-4 py-2 text-[11px] font-semibold text-amber-800"><Bell className="h-3.5 w-3.5" /> Les alertes et consignes de l’équipe sont regroupées ici.</div>
          <div className="flex-1 space-y-4 overflow-y-auto bg-stone-50 p-4">
            {messages.map(message => <div key={message.id} className={`flex ${message.own ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[84%] rounded-2xl px-3.5 py-3 text-xs ${message.own ? 'rounded-br-md bg-orange-600 text-white' : 'rounded-bl-md border border-stone-200 bg-white text-stone-800'}`}><div className={`mb-1 flex items-center gap-2 text-[10px] font-bold ${message.own ? 'text-orange-100' : 'text-stone-400'}`}><span>{message.author}</span><span>{message.role}</span><span>{message.time}</span></div>{message.body && <p className="leading-relaxed">{message.body}</p>}{message.audioUrl && <audio controls src={message.audioUrl} className="h-8 max-w-full" />}</div></div>)}
          </div>
          <div className="border-t border-stone-200 bg-white p-3"><div className="flex items-end gap-2"><button className="rounded-xl p-2 text-stone-400 hover:bg-stone-100" aria-label="Joindre un fichier"><Paperclip className="h-4 w-4" /></button><textarea value={draft} onChange={event => setDraft(event.target.value)} onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing && event.keyCode !== 229) { event.preventDefault(); sendMessage(); } }} placeholder="Écrire un message..." rows={1} className="max-h-24 min-h-10 flex-1 resize-none rounded-xl border border-stone-200 px-3 py-2.5 text-xs outline-none focus:border-orange-500" aria-label="Message" /><button onClick={toggleRecording} className={`rounded-xl p-2 ${recording ? 'bg-red-100 text-red-600' : 'text-stone-500 hover:bg-stone-100'}`} aria-label={recording ? 'Arrêter l’enregistrement' : 'Enregistrer un vocal'}>{recording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}</button><button onClick={sendMessage} className="rounded-xl bg-orange-600 p-2.5 text-white hover:bg-orange-700" aria-label="Envoyer"><Send className="h-4 w-4" /></button></div></div>
        </section>
      )}
      <button onClick={() => { setOpen(value => !value); setUnread(0); }} className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-600 text-white shadow-xl shadow-orange-600/30 transition hover:scale-105" aria-label="Ouvrir le chat de l’équipe"><MessageCircle className="h-6 w-6" />{unread > 0 && <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-black ring-2 ring-white">{unread}</span>}</button>
    </>
  );
};
