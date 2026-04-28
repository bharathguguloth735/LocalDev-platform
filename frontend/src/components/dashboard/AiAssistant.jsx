import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, ChevronDown, RotateCcw, Copy, Check, Zap, Brain, Briefcase, TrendingUp, MessageCircle, Bot, User as UserIcon } from 'lucide-react';
import { api } from '../../api';
import useUserStore from '../../store/useUserStore';

// ── Markdown renderer ──────────────────────────────────────────────────────
const md = (text) => {
  if (!text) return '';
  return text
    .replace(/```([\s\S]*?)```/g, '<pre style="background:#1e293b;color:#e2e8f0;padding:10px 14px;border-radius:10px;font-size:12px;overflow-x:auto;margin:6px 0;font-family:monospace;line-height:1.6">$1</pre>')
    .replace(/`([^`]+)`/g, '<code style="background:#f1f5f9;padding:2px 6px;border-radius:4px;font-size:11px;font-family:monospace;color:#6366f1">$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^#{1,3} (.+)$/gm, '<p style="font-weight:800;font-size:13px;color:#1e293b;margin:8px 0 4px">$1</p>')
    .replace(/^\d+\. (.+)$/gm, '<div style="display:flex;gap:6px;margin:3px 0"><span style="color:#6366f1;font-weight:700;flex-shrink:0;min-width:16px">•</span><span>$1</span></div>')
    .replace(/^[-•] (.+)$/gm, '<div style="display:flex;gap:6px;margin:3px 0"><span style="color:#6366f1;flex-shrink:0">•</span><span>$1</span></div>')
    .replace(/\n{2,}/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');
};

const QUICK_ACTIONS = [
  { icon: <Briefcase size={11} />, label: 'Draft project', text: 'Help me draft a project requirement document for a web app' },
  { icon: <TrendingUp size={11} />, label: 'Estimate budget', text: 'Estimate the budget for a full-stack e-commerce website with payment integration' },
  { icon: <Brain size={11} />, label: 'Project status', text: 'Give me a summary of my current active projects and their progress' },
  { icon: <Zap size={11} />, label: 'Talent tips', text: 'What skills should I look for when hiring a student developer for a React project?' },
];

const INIT_MSG = {
  id: 'init', role: 'ai',
  text: "Hello! 👋 I'm **Aura**, your AI concierge for LocalDev Connect.\n\nI can help with:\n- **Project drafting** & requirement specs\n- **Budget estimation** for your builds\n- **Talent scouting** strategies\n- **Project status** updates & insights\n\nHow can I assist you today?",
  time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
};

const AiAssistant = () => {
  const { isAuthenticated } = useUserStore();
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [messages, setMessages] = useState(() => {
    if (!isAuthenticated) return [INIT_MSG];
    try {
      const s = localStorage.getItem('aura_v3');
      return s ? JSON.parse(s) : [INIT_MSG];
    } catch { return [INIT_MSG]; }
  });
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [activeModel, setActiveModel] = useState('Gemini 2.0 Flash');
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  useEffect(() => {
    if (isAuthenticated && messages.length > 1)
      localStorage.setItem('aura_v3', JSON.stringify(messages.slice(-40)));
  }, [messages, isAuthenticated]);

  useEffect(() => {
    if (isOpen) { setHasUnread(false); setTimeout(() => inputRef.current?.focus(), 300); }
  }, [isOpen]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 100) + 'px';
    }
  }, [input]);

  const handleSend = useCallback(async (forced = null) => {
    const text = (forced || input).trim();
    if (!text || isTyping) return;

    const userMsg = {
      id: Date.now().toString(), role: 'user', text,
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const history = messages.filter(m => m.id !== 'init').slice(-12);
    try {
      const res = await api.chatWithAi(text, history);
      if (res.model) {
        const labels = { 'gemini-2.0-flash': 'Gemini 2.0 Flash', 'gemini-1.5-flash-8b': 'Gemini 1.5 Flash 8B', 'gemini-1.0-pro': 'Gemini 1.0 Pro' };
        setActiveModel(labels[res.model] || res.model);
      }
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(), role: 'ai', text: res.response,
        isQuota: !!res.quotaExceeded, model: res.model,
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(), role: 'ai', isError: true,
        text: '⚡ Connection lost. Please check your network and try again.',
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally { setIsTyping(false); }
  }, [input, isTyping, messages]);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text.replace(/<[^>]+>/g, ''));
    setCopiedId(id); setTimeout(() => setCopiedId(null), 2000);
  };

  const handleReset = () => { setMessages([INIT_MSG]); localStorage.removeItem('aura_v3'); };
  const handleKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } };

  const btnBase = { background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', color: '#fff', borderRadius: 10, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' };

  return (
    <>
      {/* Launch Button */}
      <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
        onClick={() => setIsOpen(o => !o)} aria-label="Open Aura AI"
        style={{ position: 'fixed', bottom: 28, right: 28, zIndex: 9999, width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6,#a855f7)', boxShadow: '0 8px 32px rgba(99,102,241,0.5)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
        <AnimatePresence mode="wait">
          {isOpen
            ? <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}><ChevronDown size={26} /></motion.div>
            : <motion.div key="s" style={{ position: 'relative' }} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ duration: 0.18 }}>
                <Sparkles size={26} fill="rgba(255,255,255,0.25)" />
                {hasUnread && <motion.div animate={{ scale: [1, 1.35, 1] }} transition={{ repeat: Infinity, duration: 2 }} style={{ position: 'absolute', top: -4, right: -4, width: 11, height: 11, borderRadius: '50%', background: '#10b981', border: '2.5px solid #8b5cf6' }} />}
              </motion.div>}
        </AnimatePresence>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.93 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.93 }} transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            style={{ position: 'fixed', bottom: 104, right: 28, zIndex: 10000, width: 400, maxWidth: 'calc(100vw - 40px)', height: 630, maxHeight: 'calc(100vh - 150px)', borderRadius: 24, overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 80px rgba(0,0,0,0.2),0 0 0 1px rgba(99,102,241,0.15)', background: '#fff' }}>

            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed,#9333ea)', padding: '18px 18px 14px', flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -30, right: -30, width: 110, height: 110, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', bottom: -25, left: 50, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ position: 'relative' }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Bot size={20} color="#fff" />
                    </div>
                    <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 2 }} style={{ position: 'absolute', bottom: 1, right: 1, width: 11, height: 11, borderRadius: '50%', background: '#10b981', border: '2px solid #7c3aed' }} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <h3 style={{ color: '#fff', fontWeight: 900, fontSize: 16, margin: 0 }}>Aura</h3>
                      <span style={{ fontSize: 9, fontWeight: 800, color: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', padding: '2px 7px', borderRadius: 99, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                        {activeModel}
                      </span>
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 11, margin: '2px 0 0', fontWeight: 600 }}>Executive AI Concierge • Online</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button onClick={handleReset} title="Clear chat" style={btnBase}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.22)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}>
                    <RotateCcw size={14} />
                  </button>
                  <button onClick={() => setIsOpen(false)} title="Close" style={btnBase}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.22)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}>
                    <X size={14} />
                  </button>
                </div>
              </div>
              {/* Status pill */}
              <div style={{ marginTop: 12, padding: '7px 11px', borderRadius: 10, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', gap: 7 }}>
                <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1.8 }} style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', flexShrink: 0 }} />
                <span style={{ color: 'rgba(255,255,255,0.82)', fontSize: 11, fontWeight: 600 }}>Context-aware · Project-integrated · Multi-turn memory</span>
              </div>
            </div>

            {/* Quick Actions */}
            {messages.length <= 1 && (
              <div style={{ padding: '10px 14px 0', display: 'flex', gap: 6, flexWrap: 'wrap', flexShrink: 0 }}>
                {QUICK_ACTIONS.map((qa, i) => (
                  <button key={i} onClick={() => handleSend(qa.text)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 11px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#475569', cursor: 'pointer', transition: 'all 0.18s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#ede9fe'; e.currentTarget.style.borderColor = '#c4b5fd'; e.currentTarget.style.color = '#6366f1'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#475569'; }}>
                    {qa.icon} {qa.label}
                  </button>
                ))}
              </div>
            )}

            {/* Messages */}
            <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '14px 14px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <style>{`
                .aura-win::-webkit-scrollbar{width:3px}
                .aura-win::-webkit-scrollbar-thumb{background:#e2e8f0;border-radius:99px}
                @keyframes afade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
                .amsg{animation:afade 0.28s ease}
              `}</style>

              {messages.map((msg) => (
                <div key={msg.id} className={msg.role === 'ai' ? 'amsg' : ''} style={{ display: 'flex', gap: 8, justifyContent: msg.role === 'ai' ? 'flex-start' : 'flex-end' }}>
                  {msg.role === 'ai' && (
                    <div style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, marginTop: 3, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Bot size={13} color="#fff" />
                    </div>
                  )}
                  <div style={{ maxWidth: '80%', display: 'flex', flexDirection: 'column', gap: 4, alignItems: msg.role === 'ai' ? 'flex-start' : 'flex-end' }}>
                    <div style={{ padding: '10px 13px', borderRadius: msg.role === 'ai' ? '4px 16px 16px 16px' : '16px 4px 16px 16px', fontSize: 13, lineHeight: 1.65, fontWeight: 500, background: msg.role === 'ai' ? (msg.isQuota ? '#fffbeb' : msg.isError ? '#fff1f2' : '#f8fafc') : 'linear-gradient(135deg,#6366f1,#7c3aed)', color: msg.role === 'ai' ? '#334155' : '#fff', border: msg.role === 'ai' ? `1px solid ${msg.isQuota ? '#fde68a' : msg.isError ? '#fecdd3' : '#f1f5f9'}` : 'none', boxShadow: msg.role === 'user' ? '0 4px 14px rgba(99,102,241,0.28)' : '0 1px 3px rgba(0,0,0,0.04)' }}>
                      {msg.role === 'ai'
                        ? <div dangerouslySetInnerHTML={{ __html: md(msg.text) }} />
                        : <span>{msg.text}</span>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 9, color: '#cbd5e1', fontWeight: 600 }}>{msg.time}</span>
                      {msg.role === 'ai' && msg.id !== 'init' && (
                        <button onClick={() => handleCopy(msg.text, msg.id)} style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '1px 7px', background: 'none', border: '1px solid #e2e8f0', borderRadius: 99, cursor: 'pointer', fontSize: 9, fontWeight: 700, color: '#94a3b8', transition: 'all 0.15s' }}>
                          {copiedId === msg.id ? <><Check size={9} color="#10b981" /> Copied</> : <><Copy size={9} /> Copy</>}
                        </button>
                      )}
                    </div>
                  </div>
                  {msg.role === 'user' && (
                    <div style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, marginTop: 3, background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <UserIcon size={13} color="#fff" />
                    </div>
                  )}
                </div>
              ))}

              {/* Typing dots */}
              {isTyping && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Bot size={13} color="#fff" />
                  </div>
                  <div style={{ padding: '12px 14px', background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '4px 16px 16px 16px', display: 'flex', gap: 4, alignItems: 'center' }}>
                    {[0, 0.18, 0.36].map((d, i) => (
                      <motion.div key={i} animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 0.85, delay: d }} style={{ width: 7, height: 7, borderRadius: '50%', background: '#a78bfa' }} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div style={{ padding: '10px 14px 14px', borderTop: '1px solid #f1f5f9', flexShrink: 0, background: '#fff' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', background: '#f8fafc', borderRadius: 16, padding: '8px 8px 8px 14px', border: '1.5px solid #e2e8f0', transition: 'border-color 0.2s' }}
                onFocusCapture={e => e.currentTarget.style.borderColor = '#6366f1'}
                onBlurCapture={e => e.currentTarget.style.borderColor = '#e2e8f0'}>
                <textarea
                  ref={e => { inputRef.current = e; textareaRef.current = e; }}
                  value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
                  placeholder="Ask Aura anything… (Enter to send)" rows={1}
                  style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 13, fontWeight: 500, color: '#1e293b', resize: 'none', fontFamily: 'inherit', lineHeight: 1.55, maxHeight: 100, overflowY: 'auto', paddingTop: 3 }} />
                <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.9 }}
                  onClick={() => handleSend()} disabled={!input.trim() || isTyping}
                  style={{ width: 38, height: 38, borderRadius: 12, border: 'none', cursor: input.trim() && !isTyping ? 'pointer' : 'not-allowed', background: input.trim() && !isTyping ? 'linear-gradient(135deg,#6366f1,#7c3aed)' : '#e2e8f0', color: input.trim() && !isTyping ? '#fff' : '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', flexShrink: 0 }}>
                  <Send size={15} />
                </motion.button>
              </div>
              <div style={{ marginTop: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                <MessageCircle size={9} color="#cbd5e1" />
                <span style={{ fontSize: 9, fontWeight: 700, color: '#cbd5e1', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Aura · LocalDev Connect · {activeModel}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AiAssistant;
