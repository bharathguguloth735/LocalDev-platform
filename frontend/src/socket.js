import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

// Single shared socket connection across the app
export const socket = io(SOCKET_URL, {
  autoConnect: false,         // connect only when a user is logged in
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
});

/**
 * Call after successful login to connect and join the user's private room.
 * @param {string} userId
 */
export const connectSocket = (userId) => {
  if (!socket.connected) {
    socket.connect();
  }
  socket.emit('join', userId);
};

/**
 * Call on logout to cleanly disconnect.
 */
export const disconnectSocket = () => {
  if (socket.connected) socket.disconnect();
};
