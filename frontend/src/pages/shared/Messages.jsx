import { useState, useEffect, useRef } from 'react';
import { Send, UserCircle, CheckCircle, Loader, Video, PhoneIncoming, PhoneOff } from 'lucide-react';
import VideoRoom from '../../components/video/VideoRoom';
import { useLocation } from 'react-router-dom';
import { socket } from '../../socket';
import { api } from '../../api';

const Messages = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const isClient = user?.role === 'client';
  const location = useLocation();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const [activeCall, setActiveCall] = useState(null); // { targetUserId, isInitiator, targetName }
  const [incomingCall, setIncomingCall] = useState(null); // { callerId, callerName }
  const messagesEndRef = useRef(null);
  
  const token = localStorage.getItem('token');
  const myUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    // Initial load
    fetchUsers().then(data => {
      const params = new URLSearchParams(location.search);
      const targetId = params.get('userId');
      if (targetId && Array.isArray(data)) {
        const found = data.find(u => u && u._id === targetId);
        if (found) setSelectedUser(found);
      }
    });
  }, [location.search]);

  useEffect(() => {
    if (selectedUser) {
      // Clear unreadCount locally for the selected user
      setUsers(prev => prev.map(u => u._id === selectedUser._id ? { ...u, unreadCount: 0 } : u));
      fetchMessages(selectedUser._id);
    }
  }, [selectedUser]);

  useEffect(() => {
    const handleNewMessage = (msg) => {
      // 1. If message is for the current conversation, add to messages state
      if (selectedUser && (msg.senderId === selectedUser._id || msg.receiverId === selectedUser._id)) {
        setMessages(prev => {
          if (prev.find(m => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      }
      
      // 2. Update contacts list unread count
      if (!selectedUser || msg.senderId !== selectedUser._id) {
         setUsers(prev => prev.map(u => u._id === msg.senderId ? { ...u, unreadCount: (u.unreadCount || 0) + 1 } : u));
      }
    };

    socket.on('message:new', handleNewMessage);
    return () => socket.off('message:new', handleNewMessage);
  }, [selectedUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleIncomingCall = ({ callerId, callerName }) => {
      setIncomingCall({ callerId, callerName });
    };

    socket.on('webrtc:incoming-call', handleIncomingCall);
    return () => socket.off('webrtc:incoming-call', handleIncomingCall);
  }, []);

  const acceptCall = () => {
    if (incomingCall) {
      setActiveCall({ 
        targetUserId: incomingCall.callerId, 
        isInitiator: false, 
        targetName: incomingCall.callerName 
      });
      setIncomingCall(null);
    }
  };

  const rejectCall = () => {
    if (incomingCall) {
      socket.emit('webrtc:call-rejected', { targetUserId: incomingCall.callerId });
      setIncomingCall(null);
    }
  };

  const startCall = () => {
    if (selectedUser) {
      setActiveCall({
        targetUserId: selectedUser._id,
        isInitiator: true,
        targetName: selectedUser.name
      });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchUsers = async () => {
    try {
      const data = await api.getUsers();
      setUsers(data);
      return data;
    } catch (err) {
      console.error(err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (userId, loadState = true) => {
    if (loadState) setMsgLoading(true);
    try {
      const data = await api.getMessages(userId);
      setMessages(data);
    } catch (err) {
      console.error(err);
    } finally {
      if (loadState) setMsgLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !selectedUser) return;
    
    const tempText = input;
    setInput('');
    
    // Optimistic UI update with a slight pop animation
    const tempMsg = {
      _id: Date.now().toString(),
      senderId: myUser.id,
      receiverId: selectedUser._id,
      text: tempText,
      createdAt: new Date().toISOString(),
      isTemp: true
    };
    setMessages(prev => [...prev, tempMsg]);

    try {
      const data = await api.sendMessage({
        receiverId: selectedUser._id,
        text: tempText
      });
      setMessages(prev => prev.map(m => m._id === tempMsg._id ? data : m));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto w-full h-[90vh] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className={`text-2xl font-bold font-heading text-slate-900 transition-all duration-300 cursor-default transform hover:scale-105 origin-left ${isClient ? 'hover:text-rose-500' : 'hover:text-indigo-500'}`}>Messages</h1>
        <div className="bg-green-50 text-green-700 px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 shadow-sm transition-all duration-300 hover:shadow-md hover:bg-green-100">
          <CheckCircle className="w-4 h-4 animate-pulse"/> Connected to Node
        </div>
      </div>

      <div className="flex-grow bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-[0_32px_64px_-12px_rgba(79,70,229,0.1)] hover:shadow-[0_60px_120px_-20px_rgba(79,70,229,0.2)] transition-shadow duration-500 flex h-full">
        
        {/* Sidebar: Users List */}
        <div className="w-1/3 border-r border-slate-100 flex flex-col bg-slate-50 relative">
          <div className="p-4 border-b border-slate-200 bg-white sticky top-0 z-10 shadow-sm">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
              <UserCircle className={`w-5 h-5 ${isClient ? 'text-rose-500' : 'text-indigo-500'}`} /> Contacts
            </h2>
          </div>
          <div className="flex-grow overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <Loader className={`w-6 h-6 animate-spin ${isClient ? 'text-rose-500' : 'text-indigo-500'}`} />
              </div>
            ) : users.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                  <UserCircle className="w-8 h-8" />
                </div>
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 leading-relaxed">
                  No Active Engagements Detected
                </p>
                <p className="text-[9px] text-slate-300 uppercase tracking-widest mt-2 leading-loose">
                  Messaging is restricted until a project<br/>is assigned and accepted.
                </p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {users.map(u => (
                  <div 
                    key={u._id} 
                    onClick={() => setSelectedUser(u)}
                    className={`p-3 rounded-2xl flex items-center gap-3 cursor-pointer transition-all duration-300 transform ${
                      selectedUser?._id === u._id 
                        ? (isClient ? 'bg-rose-500 text-white shadow-lg scale-100' : 'bg-indigo-500 text-white shadow-lg scale-100')
                        : 'bg-white hover:bg-slate-100 text-slate-700 border border-transparent hover:border-slate-200 scale-95 hover:scale-100 hover:shadow-md'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${selectedUser?._id === u._id ? 'bg-white/20' : 'bg-slate-100'}`}>
                      <UserCircle className={`w-7 h-7 ${selectedUser?._id === u._id ? 'text-white' : 'text-slate-400'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-bold text-sm ${selectedUser?._id === u._id ? 'text-white' : 'text-slate-800'}`}>{u.name}</h4>
                      <p className={`text-xs capitalize flex items-center gap-1 ${selectedUser?._id === u._id ? 'text-white/80' : 'text-slate-500'}`}>
                        <span className={`w-2 h-2 rounded-full ${selectedUser?._id === u._id ? 'bg-green-300' : 'bg-green-500'}`}></span>
                        {u.role}
                      </p>
                    </div>

                    {u.unreadCount > 0 && selectedUser?._id !== u._id && (
                      <div className={`min-w-[20px] h-5 text-white text-[10px] font-black flex items-center justify-center rounded-full px-1.5 animate-bounce ${isClient ? 'bg-rose-600 shadow-lg shadow-rose-500/30' : 'bg-indigo-600 shadow-lg shadow-indigo-500/30'}`}>
                        {u.unreadCount}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        {selectedUser ? (
          <div className="w-2/3 flex flex-col bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-slate-50/50" 
            onClick={() => {
              // Clear unreadCount locally when clicking into the chat area
              setUsers(prev => prev.map(u => u._id === selectedUser._id ? { ...u, unreadCount: 0 } : u));
            }}
          >
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white/90 backdrop-blur-md sticky top-0 z-10 shadow-sm transition-all duration-300 hover:bg-white">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center relative ${isClient ? 'bg-rose-500/10 text-rose-500' : 'bg-indigo-500/10 text-indigo-500'}`}>
                  <UserCircle className="w-7 h-7" />
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{selectedUser.name}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-500"/> Online Now</p>
                </div>
              </div>
              <button 
                onClick={startCall}
                className={`p-3 rounded-2xl transition-all shadow-sm flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest ${isClient ? 'bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-500 hover:text-white'}`}
              >
                 <Video className="w-4 h-4" /> Start Video Call
              </button>
            </div>

            {/* Chat History */}
            <div className="flex-grow p-6 overflow-y-auto space-y-4">
              {msgLoading ? (
                <div className="h-full flex items-center justify-center">
                  <Loader className={`w-8 h-8 animate-spin ${isClient ? 'text-rose-500/50' : 'text-indigo-500/50'}`} />
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <div className="w-24 h-24 mb-4 opacity-50 bg-slate-200 rounded-full flex items-center justify-center text-slate-400">
                     <Send className="w-10 h-10 -ml-1" />
                  </div>
                  <p className="text-sm font-medium">Start the conversation with {selectedUser.name}</p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const myId = myUser.id || myUser._id || myUser.uid;
                  const isMe = msg.senderId === myId;
                  const timeStr = new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                  return (
                    <div 
                      key={msg._id || idx} 
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-[surge_0.4s_ease-out_forwards] origin-bottom`}
                      style={{ animationName: 'surge', animationDuration: '0.4s', animationTimingFunction: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}
                    >
                      <div 
                        className={`max-w-[75%] px-5 py-3 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${
                          isMe 
                            ? (isClient ? 'bg-gradient-to-br from-rose-500 to-rose-400 text-white rounded-3xl rounded-br-sm' : 'bg-gradient-to-br from-indigo-500 to-indigo-400 text-white rounded-3xl rounded-br-sm') 
                            : 'bg-white border border-slate-100 text-slate-800 rounded-3xl rounded-bl-sm'
                        } ${msg.isTemp ? 'opacity-70' : 'opacity-100'}`}
                      >
                        <p className="leading-relaxed">{msg.text}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1.5 px-2 font-medium tracking-wide">{timeStr}</span>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white/90 backdrop-blur-md border-t border-slate-100">
              <form onSubmit={handleSend} className={`flex gap-2 p-1 bg-slate-50 border border-slate-200 rounded-2xl transition-all duration-300 shadow-sm ${isClient ? 'focus-within:ring-4 focus-within:ring-rose-500/10 focus-within:border-rose-500 focus-within:shadow-md' : 'focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:border-indigo-500 focus-within:shadow-md'}`}>
                <input 
                  type="text" 
                  placeholder="Type a message..." 
                  className="flex-grow px-5 py-3 bg-transparent outline-none transition-colors"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                />
                <button 
                  type="submit" 
                  disabled={!input.trim()} 
                  className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 flex items-center justify-center shrink-0 ${
                    input.trim() 
                      ? (isClient ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5' : 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5') 
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Send className={`w-5 h-5 ${input.trim() ? 'animate-pulse' : ''}`} />
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="w-2/3 flex items-center justify-center bg-slate-50/50">
            <div className="text-center transform transition-all hover:scale-105 duration-500 cursor-default">
              <div className={`w-24 h-24 shadow-xl rounded-full flex items-center justify-center mx-auto mb-6 ${isClient ? 'bg-white text-rose-500' : 'bg-white text-indigo-500'}`}>
                <Send className="w-10 h-10 animate-bounce delay-150" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 font-heading">Your Messages</h3>
              <p className="text-slate-500 mt-2 font-medium">Select a contact to start chatting</p>
            </div>
          </div>
        )}
      </div>

      {/* Incoming Call Modal */}
      {incomingCall && !activeCall && (
        <div className="fixed inset-0 z-[150] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-[fade-in_0.3s]">
          <div className="bg-white rounded-[32px] p-8 max-w-sm w-full text-center shadow-2xl border border-slate-100 animate-[pop_0.4s]">
             <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                <div className="absolute inset-0 border-2 border-indigo-400 rounded-full animate-ping opacity-50" />
                <PhoneIncoming className="w-10 h-10 text-indigo-500 animate-pulse" />
             </div>
             <h3 className="text-xl font-black text-slate-900">{incomingCall.callerName}</h3>
             <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-2 mb-8">Incoming Secure Video Transmission</p>
             
             <div className="flex gap-4">
               <button 
                 onClick={rejectCall}
                 className="flex-1 py-4 bg-rose-50 text-rose-600 rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-rose-500 hover:text-white transition-all flex justify-center items-center gap-2"
               >
                 <PhoneOff className="w-4 h-4" /> Decline
               </button>
               <button 
                 onClick={acceptCall}
                 className="flex-1 py-4 bg-emerald-500 text-white rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/30 flex justify-center items-center gap-2 animate-bounce"
               >
                 <Video className="w-4 h-4" /> Accept
               </button>
             </div>
          </div>
        </div>
      )}

      {/* Active Video Room */}
      {activeCall && (
        <VideoRoom 
          targetUserId={activeCall.targetUserId}
          myUser={myUser}
          socket={socket}
          isInitiator={activeCall.isInitiator}
          targetName={activeCall.targetName}
          onClose={() => setActiveCall(null)}
        />
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes surge {
          0% { opacity: 0; transform: translateY(20px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(203, 213, 225, 0.5);
          border-radius: 20px;
        }
      `}} />
    </div>
  );
};

export default Messages;


