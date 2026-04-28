import { useState, useEffect, useRef } from 'react';
import { Video, VideoOff, Mic, MicOff, PhoneOff, Loader2 } from 'lucide-react';
import { useToast } from '../layout/Toast';

const VideoRoom = ({ targetUserId, myUser, socket, isInitiator, onClose, targetName }) => {
  const { showToast } = useToast();
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [status, setStatus] = useState(isInitiator ? 'calling' : 'connecting');

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);

  // STUN servers for WebRTC
  const configuration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  useEffect(() => {
    let pc = new RTCPeerConnection(configuration);
    peerConnectionRef.current = pc;

    // 1. Get local media
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        setLocalStream(stream);
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        
        // Add tracks to PeerConnection
        stream.getTracks().forEach(track => pc.addTrack(track, stream));

        // If I am the initiator, send the call signal first
        if (isInitiator) {
          socket.emit('webrtc:call-user', { 
            targetUserId, 
            callerId: myUser.id || myUser._id, 
            callerName: myUser.name 
          });
        } else {
          // If I am the receiver, I just hit "Accept".
          // Tell the caller I accepted so they can create the Offer.
          socket.emit('webrtc:call-accepted', { targetUserId });
          setStatus('connected');
        }
      })
      .catch(err => {
        console.error('Media Error:', err);
        showToast('Permission Denied: Could not access Camera/Microphone.', 'error');
        onClose();
      });

    // 2. Handle ICE Candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('webrtc:ice-candidate', { targetUserId, candidate: event.candidate });
      }
    };

    // 3. Handle Remote Stream
    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
      setStatus('connected');
    };

    // ── Socket Listeners ────────────────────────────────────────────────

    const handleCallAccepted = async () => {
      // Receiver accepted. I must create the Offer.
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('webrtc:offer', { targetUserId, offer });
        setStatus('ringing');
      } catch (err) {
        console.error('Error creating offer', err);
      }
    };

    const handleCallRejected = () => {
      showToast(`${targetName || 'User'} declined the call.`, 'warning');
      onClose();
    };

    const handleReceiveOffer = async ({ offer }) => {
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('webrtc:answer', { targetUserId, answer });
      } catch (err) {
        console.error('Error handling offer', err);
      }
    };

    const handleReceiveAnswer = async ({ answer }) => {
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      } catch (err) {
        console.error('Error handling answer', err);
      }
    };

    const handleNewICECandidate = async ({ candidate }) => {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error('Error adding ICE candidate', err);
      }
    };

    const handleCallEnded = () => {
      onClose();
    };

    socket.on('webrtc:call-accepted', handleCallAccepted);
    socket.on('webrtc:call-rejected', handleCallRejected);
    socket.on('webrtc:offer', handleReceiveOffer);
    socket.on('webrtc:answer', handleReceiveAnswer);
    socket.on('webrtc:ice-candidate', handleNewICECandidate);
    socket.on('webrtc:call-ended', handleCallEnded);

    return () => {
      socket.off('webrtc:call-accepted', handleCallAccepted);
      socket.off('webrtc:call-rejected', handleCallRejected);
      socket.off('webrtc:offer', handleReceiveOffer);
      socket.off('webrtc:answer', handleReceiveAnswer);
      socket.off('webrtc:ice-candidate', handleNewICECandidate);
      socket.off('webrtc:call-ended', handleCallEnded);
      
      pc.close();
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  const endCall = () => {
    socket.emit('webrtc:call-ended', { targetUserId });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] bg-slate-950/90 backdrop-blur-3xl flex flex-col items-center justify-center animate-[fade-in_0.3s]">
      {/* Header */}
      <div className="absolute top-8 left-8 z-10 text-white">
        <h2 className="text-2xl font-black uppercase tracking-widest">{targetName || 'Video Room'}</h2>
        <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.3em] flex items-center gap-2 mt-1">
          {status === 'connected' ? <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> : <Loader2 className="w-3 h-3 animate-spin" />}
          {status === 'calling' ? 'Ringing...' : status === 'connected' ? 'Secure WebRTC Active' : 'Connecting...'}
        </p>
      </div>

      {/* Video Grid */}
      <div className="relative w-full max-w-6xl aspect-video bg-black/50 rounded-[40px] overflow-hidden border border-white/10 shadow-2xl flex items-center justify-center">
        
        {/* Remote Video (Main) */}
        {remoteStream ? (
          <video 
            ref={remoteVideoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-white/50 flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin" />
            <p className="text-xs font-bold uppercase tracking-widest">Waiting for Remote Stream</p>
          </div>
        )}

        {/* Local Video (Floating PIP) */}
        <div className="absolute bottom-6 right-6 w-48 aspect-video bg-slate-900 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl">
          <video 
            ref={localVideoRef} 
            autoPlay 
            playsInline 
            muted 
            className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : ''}`}
          />
          {isVideoOff && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
              <VideoOff className="w-6 h-6 text-slate-500" />
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-12 flex items-center gap-4 bg-white/10 backdrop-blur-xl p-4 rounded-full border border-white/20">
        <button 
          onClick={toggleMute}
          className={`p-4 rounded-full transition-all ${isMuted ? 'bg-rose-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'}`}
        >
          {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </button>
        
        <button 
          onClick={endCall}
          className="p-5 rounded-full bg-rose-600 text-white hover:bg-rose-700 transition-all shadow-[0_0_30px_rgba(225,29,72,0.4)]"
        >
          <PhoneOff className="w-7 h-7" />
        </button>

        <button 
          onClick={toggleVideo}
          className={`p-4 rounded-full transition-all ${isVideoOff ? 'bg-rose-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'}`}
        >
          {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
        </button>
      </div>
    </div>
  );
};

export default VideoRoom;
