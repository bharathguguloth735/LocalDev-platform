import { useEffect } from 'react';
import { socket } from '../../socket';
import { useToast } from './Toast';

const GlobalSocketListener = () => {
  const { showToast } = useToast();

  useEffect(() => {
    const handleNewNotif = (notif) => {
      showToast(notif.title + ': ' + notif.message, 'info');
      
      // Also play a subtle sound if possible or other UI cues
      console.log('[REAL-TIME] Notification received:', notif);
    };

    const handleNewMessage = (msg) => {
       const preview = msg.text.length > 40 ? msg.text.substring(0, 40) + '...' : msg.text;
       showToast(`${msg.senderName || 'Partner'}: ${preview}`, 'success');
    };

    socket.on('notification:new', handleNewNotif);
    socket.on('message:new', handleNewMessage);

    return () => {
      socket.off('notification:new', handleNewNotif);
      socket.off('message:new', handleNewMessage);
    };
  }, [showToast]);

  return null; // This component doesn't render anything
};

export default GlobalSocketListener;
