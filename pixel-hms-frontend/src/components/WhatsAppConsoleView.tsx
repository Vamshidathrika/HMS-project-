import { useState, useEffect, useRef, useCallback } from 'react';
import {
  MessageSquare,
  Wifi,
  WifiOff,
  RefreshCw,
  LogOut,
  Send,
  Search,
  Sparkles,
  Clock,
  CheckCheck,
  Check,
  Plus,
  Trash2,
  Save,
  CalendarClock,
  CheckCircle2,
  XCircle
} from 'lucide-react';

const NODE_URL = 'http://localhost:3001';

interface WaChat {
  id: string;
  name: string;
  unreadCount: number;
  conversationTimestamp: number;
  profilePic?: string;
}

interface WaMessage {
  id: string;
  direction: 'sent' | 'received';
  content: string;
  mediaUrl?: string;
  mediaType?: string;
  timestamp: string;
  timestampRaw?: number;
  status: string;
}

interface AutoReplyRule {
  id: string;
  keyword: string;
  replyText: string;
  isActive: boolean;
}

interface ScheduledMessage {
  id: string;
  phone: string;
  patientName: string;
  text: string;
  sendAt: string;
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  sentAt?: string;
  error?: string;
}

type SubTab = 'chat' | 'rules' | 'scheduled' | 'connection';

export default function WhatsAppConsoleView() {
  const [subTab, setSubTab] = useState<SubTab>('chat');

  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'qr' | 'connected'>('disconnected');
  const [qrData, setQrData] = useState<string>('');
  const [userInfo, setUserInfo] = useState<{ id: string; name: string } | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [loadingConn, setLoadingConn] = useState(false);

  const [chats, setChats] = useState<WaChat[]>([]);
  const [selectedChat, setSelectedChat] = useState<WaChat | null>(null);
  const [messages, setMessages] = useState<WaMessage[]>([]);
  const [chatSearch, setChatSearch] = useState('');
  const [loadingMsgs, setLoadingMsgs] = useState(false);

  const [msgText, setMsgText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [rules, setRules] = useState<AutoReplyRule[]>([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [newReplyText, setNewReplyText] = useState('');
  const [savingRules, setSavingRules] = useState(false);

  const [scheduled, setScheduled] = useState<ScheduledMessage[]>([]);
  const [schedPhone, setSchedPhone] = useState('');
  const [schedName, setSchedName] = useState('');
  const [schedText, setSchedText] = useState('');
  const [schedAt, setSchedAt] = useState('');
  const [schedSaving, setSchedSaving] = useState(false);

  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`${NODE_URL}/api/status`);
      if (!res.ok) return;
      const data = await res.json();
      setStatus(data.status);
      setQrData(data.qr || '');
      setUserInfo(data.user || null);
      setSyncing(data.syncing || false);
    } catch {
      setStatus('disconnected');
    }
  }, []);

  const fetchChats = useCallback(async () => {
    try {
      const res = await fetch(`${NODE_URL}/api/chats`);
      if (res.ok) setChats(await res.json());
    } catch {}
  }, []);

  const fetchMessages = useCallback(async (jid: string) => {
    setLoadingMsgs(true);
    try {
      const res = await fetch(`${NODE_URL}/api/messages/${encodeURIComponent(jid)}`);
      if (res.ok) setMessages(await res.json());
    } catch {}
    setLoadingMsgs(false);
  }, []);

  const fetchRules = useCallback(async () => {
    try {
      const res = await fetch(`${NODE_URL}/api/rules`);
      if (res.ok) setRules(await res.json());
    } catch {}
  }, []);

  const fetchScheduled = useCallback(async () => {
    try {
      const res = await fetch(`${NODE_URL}/api/scheduled`);
      if (res.ok) setScheduled(await res.json());
    } catch {}
  }, []);

  useEffect(() => {
    fetchStatus();
    fetchChats();
    fetchRules();
    fetchScheduled();
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      await fetchStatus();
      fetchChats();
      if (selectedChat) fetchMessages(selectedChat.id);
    }, 4000);
    return () => clearInterval(interval);
  }, [selectedChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (selectedChat) fetchMessages(selectedChat.id);
  }, [selectedChat]);

  const handleConnect = async () => {
    setLoadingConn(true);
    try {
      const res = await fetch(`${NODE_URL}/api/connect`, { method: 'POST' });
      if (res.ok) {
        showToast('Initializing WhatsApp\u2026 scan QR when it appears.');
        setTimeout(fetchStatus, 2000);
      } else {
        showToast('Could not reach WhatsApp server on :3001', false);
      }
    } catch {
      showToast('Node server not running on port 3001. Start it first.', false);
    }
    setLoadingConn(false);
  };

  const handleLogout = async () => {
    setLoadingConn(true);
    try {
      await fetch(`${NODE_URL}/api/logout`, { method: 'POST' });
      setChats([]);
      setMessages([]);
      setSelectedChat(null);
      setUserInfo(null);
      setStatus('disconnected');
      showToast('Logged out from WhatsApp.');
    } catch {
      showToast('Logout failed.', false);
    }
    setLoadingConn(false);
  };

  const handleSend = async () => {
    if (!selectedChat || !msgText.trim()) return;
    const text = msgText.trim();
    setMsgText('');
    setSending(true);
    const tempId = `temp-${Date.now()}`;
    const tempMsg: WaMessage = {
      id: tempId,
      direction: 'sent',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sending'
    };
    setMessages(prev => [...prev, tempMsg]);
    try {
      const phone = selectedChat.id.replace('@s.whatsapp.net', '').replace('@g.us', '');
      const res = await fetch(`${NODE_URL}/api/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, text })
      });
      if (res.ok) {
        setMessages(prev => prev.map(m => m.id === tempId ? { ...m, status: 'sent' } : m));
      } else {
        setMessages(prev => prev.map(m => m.id === tempId ? { ...m, status: 'failed' } : m));
        showToast('Failed to send message.', false);
      }
    } catch {
      setMessages(prev => prev.map(m => m.id === tempId ? { ...m, status: 'failed' } : m));
      showToast('Connection error.', false);
    }
    setSending(false);
  };

  const handleSaveRules = async () => {
    setSavingRules(true);
    try {
      const res = await fetch(`${NODE_URL}/api/rules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rules)
      });
      if (res.ok) showToast('Auto-reply rules saved to server.');
      else showToast('Failed to save rules.', false);
    } catch {
      showToast('Connection error.', false);
    }
    setSavingRules(false);
  };

  const handleAddRule = () => {
    if (!newKeyword.trim() || !newReplyText.trim()) return;
    const kw = newKeyword.toLowerCase().trim();
    if (rules.some(r => r.keyword === kw)) { showToast('Keyword already exists.', false); return; }
    setRules(prev => [{ id: `r-${Date.now()}`, keyword: kw, replyText: newReplyText.trim(), isActive: true }, ...prev]);
    setNewKeyword(''); setNewReplyText('');
  };

  const handleSchedule = async () => {
    if (!schedPhone.trim() || !schedText.trim() || !schedAt) return;
    setSchedSaving(true);
    try {
      const res = await fetch(`${NODE_URL}/api/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: schedPhone, text: schedText, sendAt: schedAt, patientName: schedName || schedPhone })
      });
      if (res.ok) {
        showToast('Message scheduled successfully!');
        setSchedPhone(''); setSchedName(''); setSchedText(''); setSchedAt('');
        fetchScheduled();
      } else {
        showToast('Failed to schedule.', false);
      }
    } catch {
      showToast('Connection error.', false);
    }
    setSchedSaving(false);
  };

  const filteredChats = chats.filter(c =>
    c.name.toLowerCase().includes(chatSearch.toLowerCase()) ||
    c.id.includes(chatSearch)
  );

  const statusColors: Record<string, string> = {
    connected: 'bg-[#22C55E]/10 border-emerald-500/20 text-emerald-700',
    qr: 'bg-[#F59E0B]/10 border-amber-500/20 text-amber-700',
    connecting: 'bg-[#147C8A]/10 border-[#147C8A]/20 text-[#147C8A]',
    disconnected: 'bg-rose-500/10 border-rose-500/20 text-rose-700',
  };

  const statusLabel: Record<string, string> = {
    connected: `Connected${userInfo ? ` \u00b7 ${userInfo.name}` : ''}`,
    qr: 'Scan QR Code',
    connecting: 'Connecting\u2026',
    disconnected: 'Disconnected',
  };

  return (
    <div className="space-y-5">

      {toast && (
        <div className={`fixed bottom-5 right-5 z-[200] flex items-center space-x-2 px-4 py-2.5 rounded-2xl shadow-2xl font-bold text-sm ${
          toast.ok ? 'bg-[#22C55E] text-[#1E293B]' : 'bg-rose-500 text-white'
        }`}>
          {toast.ok ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          <span>{toast.msg}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#F8FBFB] border border-[#D7E8EA] rounded-2xl p-5 backdrop-blur-md">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B] flex items-center gap-2.5">
            <MessageSquare className="w-6 h-6 text-emerald-700" />
            WhatsApp Messenger
          </h1>
          <p className="text-xs text-[#64748B] mt-1">Real-time Baileys integration \u00b7 Node server :3001</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1.5 ${statusColors[status]}`}>
            {status === 'connected' ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            <span>{statusLabel[status]}</span>
            {syncing && <span className="text-[9px] opacity-70">(syncing\u2026)</span>}
          </span>
          <button onClick={fetchStatus} className="p-2 bg-[#F8FBFB] hover:bg-[#EAF7F8] rounded-xl border border-[#D7E8EA] text-[#147C8A] transition-all">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          {status === 'connected' ? (
            <button onClick={handleLogout} disabled={loadingConn} className="px-3 py-1.5 bg-red-50 border border-red-200 hover:bg-red-50 text-rose-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all">
              <LogOut className="w-3.5 h-3.5" /><span>Logout</span>
            </button>
          ) : (
            <button onClick={handleConnect} disabled={loadingConn || status === 'connecting' || status === 'qr'} className="px-3 py-1.5 bg-[#22C55E] hover:bg-emerald-400 text-[#1E293B] font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm shadow-emerald-500/20 transition-all disabled:opacity-50">
              <Wifi className="w-3.5 h-3.5" /><span>{status === 'connecting' || status === 'qr' ? 'Connecting\u2026' : 'Connect'}</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-1 bg-[#F8FBFB] p-1 rounded-xl border border-[#D7E8EA] w-fit overflow-x-auto">
        {([
          { id: 'chat', label: 'Live Chat', icon: MessageSquare },
          { id: 'rules', label: 'Auto-Replies', icon: Sparkles },
          { id: 'scheduled', label: 'Scheduled', icon: CalendarClock },
          { id: 'connection', label: 'Connection', icon: Wifi },
        ] as const).map(t => (
          <button key={t.id} onClick={() => setSubTab(t.id)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              subTab === t.id ? 'bg-[#22C55E] text-[#1E293B] shadow-md' : 'text-[#64748B] hover:text-[#1E293B]'
            }`}>
            <t.icon className="w-3.5 h-3.5" /><span>{t.label}</span>
          </button>
        ))}
      </div>

      {subTab === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5" style={{ height: '560px' }}>
          <div className="bg-[#F8FBFB] border border-[#D7E8EA] rounded-2xl p-4 flex flex-col gap-3 overflow-hidden backdrop-blur-md">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[#64748B]" />
              <input type="text" placeholder="Search chats\u2026" value={chatSearch} onChange={e => setChatSearch(e.target.value)}
                className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#1E293B] focus:outline-none focus:border-[#22C55E]" />
            </div>
            {status !== 'connected' ? (
              <div className="flex-1 flex flex-col items-center justify-center text-[#64748B] text-xs gap-2">
                <WifiOff className="w-8 h-8 opacity-30" /><span>Connect WhatsApp to see chats</span>
              </div>
            ) : filteredChats.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-[#64748B] text-xs gap-2">
                <RefreshCw className="w-5 h-5 animate-spin opacity-40" /><span>{syncing ? 'Syncing chats\u2026' : 'No chats yet'}</span>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-1 pr-0.5">
                {filteredChats.map(chat => (
                  <button key={chat.id} onClick={() => setSelectedChat(chat)}
                    className={`w-full text-left p-3 rounded-2xl transition-all border flex items-center gap-3 ${
                      selectedChat?.id === chat.id ? 'bg-[#22C55E]/10 border-emerald-500/20' : 'border-transparent hover:bg-[#EAF7F8]'
                    }`}>
                    <div className="w-9 h-9 rounded-full bg-[#D0EFF2] flex items-center justify-center shrink-0 overflow-hidden">
                      {chat.profilePic ? (
                        <img src={chat.profilePic} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-sm font-bold text-[#1E293B]">{chat.name?.[0]?.toUpperCase() || '?'}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-xs text-[#1E293B] block truncate">{chat.name}</span>
                      <span className="text-[10px] text-[#64748B] font-mono">{chat.id.split('@')[0]}</span>
                    </div>
                    {chat.unreadCount > 0 && (
                      <span className="w-4 h-4 rounded-full bg-[#22C55E] text-[9px] font-bold text-[#1E293B] flex items-center justify-center shrink-0">
                        {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-3 bg-[#F8FBFB] border border-[#D7E8EA] rounded-2xl flex flex-col overflow-hidden backdrop-blur-md">
            {selectedChat ? (
              <>
                <div className="px-5 py-3.5 border-b border-[#D7E8EA] flex items-center gap-3 bg-rose-50">
                  <div className="w-8 h-8 rounded-full bg-[#D0EFF2] flex items-center justify-center shrink-0">
                    {selectedChat.profilePic ? (
                      <img src={selectedChat.profilePic} alt="" className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <span className="text-sm font-bold text-[#1E293B]">{selectedChat.name?.[0]?.toUpperCase()}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-bold text-[#1E293B] truncate">{selectedChat.name}</h3>
                    <span className="text-[10px] text-emerald-700 font-mono">+{selectedChat.id.split('@')[0]}</span>
                  </div>
                  <button onClick={() => fetchMessages(selectedChat.id)} className="p-1.5 text-[#64748B] hover:text-[#147C8A] transition-colors">
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F8FBFB]">
                  {loadingMsgs ? (
                    <div className="flex items-center justify-center h-full text-[#64748B] text-xs gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" /><span>Loading messages\u2026</span>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-[#64748B] text-xs">No messages yet.</div>
                  ) : (
                    messages.map((msg, idx) => (
                      <div key={msg.id || idx} className={`flex ${msg.direction === 'sent' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs lg:max-w-md px-3.5 py-2.5 rounded-2xl text-xs shadow-sm ${
                          msg.direction === 'sent'
                            ? msg.status === 'failed' ? 'bg-red-100 border border-red-200 text-red-700 rounded-tr-none'
                              : msg.status === 'sending' ? 'bg-emerald-700/60 text-white rounded-tr-none opacity-70'
                              : 'bg-emerald-600 text-white rounded-tr-none'
                            : 'bg-[#F8FBFB] text-[#1E293B] rounded-tl-none'
                        }`}>
                          {msg.mediaUrl && msg.mediaType === 'image' && (
                            <img src={msg.mediaUrl} alt="media" className="rounded-xl mb-1.5 max-w-[180px]" />
                          )}
                          {msg.mediaUrl && msg.mediaType === 'video' && (
                            <video src={msg.mediaUrl} controls className="rounded-xl mb-1.5 max-w-[180px]" />
                          )}
                          <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                          <div className="flex items-center justify-end gap-1 mt-1.5">
                            <span className="text-[9px] opacity-60 font-mono">{msg.timestamp}</span>
                            {msg.direction === 'sent' && (
                              msg.status === 'failed' ? <XCircle className="w-3 h-3 text-rose-700" />
                              : msg.status === 'read' ? <CheckCheck className="w-3 h-3 text-[#147C8A]" />
                              : msg.status === 'delivered' ? <CheckCheck className="w-3 h-3 opacity-60" />
                              : <Check className="w-3 h-3 opacity-50" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
                <div className="px-4 py-2.5 bg-[#F8FBFB] border-t border-[#D7E8EA] flex flex-wrap gap-1.5 items-center">
                  <span className="text-[10px] font-bold text-emerald-800 mr-1 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                    <span>Suggestions:</span>
                  </span>
                  {[
                    { text: 'Your OPD appointment is confirmed. Please visit the reception on arrival.', label: 'Confirm Appt' },
                    { text: 'Please send us your latest vitals (BP, SpO2, Temperature) for the doctor to review.', label: 'Ask Vitals' },
                    { text: 'Your pharmacy bill and digital receipt have been generated.', label: 'Send Receipt' },
                    { text: 'The doctor is ready for your consultation slot. Please join the queue.', label: 'Call Patient' },
                    { text: 'Welcome to our clinic portal. Let us know how we can assist you today.', label: 'Welcome Msg' }
                  ].map((sug, i) => (
                    <button key={i} onClick={() => setMsgText(sug.text)}
                      className="px-2 py-1 bg-white hover:bg-emerald-50 border border-[#D7E8EA] text-[#147C8A] rounded-lg text-[9px] font-bold transition-all">
                      {sug.label}
                    </button>
                  ))}
                </div>
                <div className="p-3 border-t border-[#D7E8EA] bg-[#EAF7F8] flex items-center gap-2">
                  <input type="text" value={msgText} onChange={e => setMsgText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                    placeholder={status !== 'connected' ? 'Connect WhatsApp first\u2026' : 'Type a message\u2026'}
                    disabled={status !== 'connected' || sending}
                    className="flex-1 bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl px-4 py-2 text-xs text-[#1E293B] focus:outline-none focus:border-[#22C55E] disabled:opacity-40" />
                  <button onClick={handleSend} disabled={status !== 'connected' || sending || !msgText.trim()}
                    className="p-2.5 bg-[#22C55E] hover:bg-emerald-400 text-[#1E293B] rounded-xl font-bold transition-all disabled:opacity-40">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-[#64748B] gap-3">
                <MessageSquare className="w-14 h-14 opacity-20 text-emerald-700" />
                <div className="text-center">
                  <p className="font-bold text-sm">Select a chat to start messaging</p>
                  <p className="text-xs mt-1 opacity-70">{status !== 'connected' ? 'Connect WhatsApp first using the button above.' : `${chats.length} chats loaded`}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {subTab === 'rules' && (
        <div className="space-y-5">
          <div className="bg-[#F8FBFB] border border-[#D7E8EA] rounded-2xl p-6 backdrop-blur-md space-y-4">
            <div className="flex items-center gap-2 border-b border-[#D7E8EA] pb-3">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <h3 className="text-sm font-bold text-[#1E293B]">Keyword Auto-Reply Rules</h3>
              <span className="text-[9px] bg-[#F8FBFB] text-[#64748B] border border-[#D7E8EA] px-2 py-0.5 rounded font-mono ml-auto">Synced to Node server</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#64748B] uppercase">Keyword trigger</label>
                <input value={newKeyword} onChange={e => setNewKeyword(e.target.value)} placeholder="e.g. address"
                  className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl px-3 py-1.5 text-xs text-[#1E293B] focus:outline-none focus:border-[#22C55E]" />
              </div>
              <div className="md:col-span-2 flex gap-2 items-end">
                <div className="flex-1 space-y-1">
                  <label className="text-[10px] font-bold text-[#64748B] uppercase">Reply text</label>
                  <input value={newReplyText} onChange={e => setNewReplyText(e.target.value)} placeholder="Our hospital is at 123 Main St\u2026"
                    className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl px-3 py-1.5 text-xs text-[#1E293B] focus:outline-none focus:border-[#22C55E]" />
                </div>
                <button onClick={handleAddRule} className="px-3 py-1.5 bg-[#22C55E] hover:bg-emerald-400 text-[#1E293B] font-bold rounded-xl text-xs flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
          <div className="bg-[#F8FBFB] border border-[#D7E8EA] rounded-2xl p-6 backdrop-blur-md">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#D7E8EA] text-[#64748B] font-bold uppercase">
                    <th className="pb-3">Keyword</th><th className="pb-3">Reply Text</th>
                    <th className="pb-3">Status</th><th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {rules.map(r => (
                    <tr key={r.id} className="hover:bg-[#F8FBFB]">
                      <td className="py-3 font-mono font-bold text-emerald-700">&quot;{r.keyword}&quot;</td>
                      <td className="py-3 text-[#1E293B] max-w-xs truncate">{r.replyText}</td>
                      <td className="py-3">
                        <button onClick={() => setRules(prev => prev.map(x => x.id === r.id ? { ...x, isActive: !x.isActive } : x))}
                          className={`px-2 py-0.5 rounded text-[9px] font-bold ${r.isActive ? 'bg-green-100 text-green-700' : 'bg-[#F8FBFB] text-[#64748B]'}`}>
                          {r.isActive ? 'ACTIVE' : 'PAUSED'}
                        </button>
                      </td>
                      <td className="py-3 text-right">
                        <button onClick={() => setRules(prev => prev.filter(x => x.id !== r.id))} className="p-1 text-rose-700 hover:text-red-700">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {rules.length === 0 && <tr><td colSpan={4} className="py-6 text-center text-[#64748B]">No rules yet.</td></tr>}
                </tbody>
              </table>
            </div>
            {rules.length > 0 && (
              <div className="flex justify-end mt-4 pt-3 border-t border-[#D7E8EA]">
                <button onClick={handleSaveRules} disabled={savingRules}
                  className="px-4 py-2 bg-[#22C55E] hover:bg-emerald-400 text-[#1E293B] font-bold rounded-xl text-xs flex items-center gap-1.5 disabled:opacity-50">
                  <Save className="w-3.5 h-3.5" /><span>{savingRules ? 'Saving\u2026' : 'Save to Server'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {subTab === 'scheduled' && (
        <div className="space-y-5">
          <div className="bg-[#F8FBFB] border border-[#D7E8EA] rounded-2xl p-6 backdrop-blur-md space-y-4">
            <div className="flex items-center gap-2 border-b border-[#D7E8EA] pb-3">
              <CalendarClock className="w-4 h-4 text-[#147C8A]" />
              <h3 className="text-sm font-bold text-[#1E293B]">Schedule a WhatsApp Message</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#64748B] uppercase">Phone Number</label>
                <input value={schedPhone} onChange={e => setSchedPhone(e.target.value)} placeholder="919876543210"
                  className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl px-3 py-1.5 text-[#1E293B] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#64748B] uppercase">Patient Name</label>
                <input value={schedName} onChange={e => setSchedName(e.target.value)} placeholder="Ramesh Kumar"
                  className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl px-3 py-1.5 text-[#1E293B] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#64748B] uppercase">Send At</label>
                <input type="datetime-local" value={schedAt} onChange={e => setSchedAt(e.target.value)}
                  className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl px-3 py-1.5 text-[#1E293B] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#64748B] uppercase">Message Text</label>
                <input value={schedText} onChange={e => setSchedText(e.target.value)} placeholder="Dear patient, your follow-up is due\u2026"
                  className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl px-3 py-1.5 text-[#1E293B] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]" />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button onClick={handleSchedule} disabled={schedSaving}
                className="px-5 py-2 bg-[#147C8A] hover:bg-[#0F6672] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 disabled:opacity-50">
                <CalendarClock className="w-3.5 h-3.5" /><span>{schedSaving ? 'Scheduling\u2026' : 'Schedule Message'}</span>
              </button>
            </div>
          </div>
          <div className="bg-[#F8FBFB] border border-[#D7E8EA] rounded-2xl p-6 backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-[#D7E8EA] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#147C8A]" />
                <h3 className="text-sm font-bold text-[#1E293B]">Scheduled Queue</h3>
              </div>
              <button onClick={fetchScheduled} className="text-[10px] text-[#147C8A] hover:underline font-bold">Refresh</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#D7E8EA] text-[#64748B] font-bold uppercase">
                    <th className="pb-3">Patient</th><th className="pb-3">Phone</th>
                    <th className="pb-3">Send At</th><th className="pb-3">Message</th>
                    <th className="pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {[...scheduled].reverse().map(s => (
                    <tr key={s.id} className="hover:bg-[#F8FBFB]">
                      <td className="py-3 font-semibold text-[#1E293B]">{s.patientName}</td>
                      <td className="py-3 font-mono text-[#64748B]">{s.phone}</td>
                      <td className="py-3 font-mono text-[#64748B] whitespace-nowrap">{new Date(s.sendAt).toLocaleString()}</td>
                      <td className="py-3 text-[#1E293B] max-w-xs truncate">{s.text}</td>
                      <td className="py-3 text-right">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          s.status === 'sent' ? 'bg-green-100 text-green-700' :
                          s.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          s.status === 'cancelled' ? 'bg-[#F8FBFB] text-[#64748B]' :
                          'bg-red-100 text-red-700'
                        }`}>{s.status.toUpperCase()}</span>
                      </td>
                    </tr>
                  ))}
                  {scheduled.length === 0 && <tr><td colSpan={5} className="py-6 text-center text-[#64748B]">No scheduled messages.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {subTab === 'connection' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-[#F8FBFB] border border-[#D7E8EA] rounded-2xl p-6 backdrop-blur-md flex flex-col gap-5">
            <div>
              <h3 className="text-sm font-bold text-[#1E293B] mb-1">Baileys Session</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Using <code className="bg-[#F8FBFB] px-1 rounded text-emerald-700">@whiskeysockets/baileys</code> multi-device. Session in <code className="bg-[#F8FBFB] px-1 rounded text-[#147C8A]">whatsapp-session/</code>.
              </p>
            </div>
            <div className={`p-3 rounded-2xl border text-xs font-semibold flex items-center gap-2 ${statusColors[status]}`}>
              {status === 'connected' ? <CheckCircle2 className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
              <div>
                <span className="font-bold block">{statusLabel[status]}</span>
                {userInfo && <span className="text-[10px] opacity-70 font-mono">{userInfo.id}</span>}
              </div>
            </div>
            {status === 'connected' ? (
              <button onClick={handleLogout} disabled={loadingConn} className="w-full py-2 bg-red-50 border border-red-200 hover:bg-red-50 text-rose-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5">
                <LogOut className="w-4 h-4" /><span>Disconnect &amp; Logout</span>
              </button>
            ) : (
              <button onClick={handleConnect} disabled={loadingConn || status === 'connecting' || status === 'qr'} className="w-full py-2.5 bg-[#22C55E] hover:bg-emerald-400 text-[#1E293B] font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-500/20 disabled:opacity-50">
                <Wifi className="w-4 h-4" /><span>{status === 'qr' ? 'Scan QR Code\u2026' : status === 'connecting' ? 'Connecting\u2026' : 'Connect WhatsApp'}</span>
              </button>
            )}
            <div className="text-[10px] text-[#64748B] space-y-1.5 pt-2 border-t border-[#D7E8EA]">
              <p>\u2022 Start server: <code className="text-[#147C8A]">node whatsapp-server.js</code></p>
              <p>\u2022 Listens on <code className="text-[#147C8A]">http://localhost:3001</code></p>
              <p>\u2022 First connect: scan QR \u2192 WhatsApp \u2192 Linked Devices</p>
              <p>\u2022 Session is saved \u2014 no QR needed on restart</p>
            </div>
          </div>
          <div className="md:col-span-2 bg-[#F8FBFB] border border-[#D7E8EA] rounded-2xl p-6 backdrop-blur-md flex flex-col items-center justify-center text-center gap-5 min-h-[300px]">
            {status === 'qr' && qrData ? (
              <div className="flex flex-col items-center gap-4">
                <div>
                  <h4 className="text-sm font-bold text-amber-700">Scan with WhatsApp</h4>
                  <p className="text-[11px] text-[#64748B] mt-1 max-w-sm">Open WhatsApp \u2192 Settings \u2192 Linked Devices \u2192 Link a Device, then scan this code.</p>
                </div>
                <div className="p-4 bg-white rounded-2xl shadow-2xl shadow-amber-500/10">
                  <img src={qrData} alt="WhatsApp QR" className="w-52 h-52 object-contain" />
                </div>
                <p className="text-[10px] text-[#64748B] flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 animate-spin" /> Auto-refreshing every 4s\u2026
                </p>
              </div>
            ) : status === 'connected' ? (
              <div className="flex flex-col items-center gap-3">
                <CheckCircle2 className="w-16 h-16 text-emerald-500 animate-pulse" />
                <div>
                  <h4 className="font-bold text-[#1E293B]">Session Active</h4>
                  <p className="text-xs text-[#64748B] mt-1">Baileys event loop running. {chats.length} chats loaded{syncing ? ', syncing\u2026' : '.'}</p>
                </div>
                {userInfo && (
                  <div className="bg-[#F8FBFB] border border-[#D7E8EA] rounded-2xl px-4 py-2 text-xs font-mono text-emerald-700">
                    {userInfo.name} \u00b7 {userInfo.id}
                  </div>
                )}
              </div>
            ) : status === 'connecting' ? (
              <div className="flex flex-col items-center gap-3 text-[#147C8A]">
                <RefreshCw className="w-10 h-10 animate-spin" />
                <p className="text-xs font-semibold">Initializing Baileys socket\u2026</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 text-[#64748B]">
                <WifiOff className="w-14 h-14 opacity-20" />
                <div>
                  <p className="font-bold text-sm">WhatsApp not connected</p>
                  <p className="text-xs mt-1 opacity-70">Click Connect to start Baileys and get the QR code.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
