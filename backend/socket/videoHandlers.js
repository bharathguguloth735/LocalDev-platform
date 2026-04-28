export const registerVideoHandlers = (io, socket) => {
  // 1. Initiate Call
  socket.on('webrtc:call-user', ({ targetUserId, callerId, callerName }) => {
    io.to(targetUserId).emit('webrtc:incoming-call', { callerId, callerName });
  });

  // 2. Call Accepted
  socket.on('webrtc:call-accepted', ({ targetUserId }) => {
    io.to(targetUserId).emit('webrtc:call-accepted');
  });

  // 3. Call Rejected
  socket.on('webrtc:call-rejected', ({ targetUserId }) => {
    io.to(targetUserId).emit('webrtc:call-rejected');
  });

  // 4. Relay SDP Offer
  socket.on('webrtc:offer', ({ targetUserId, offer }) => {
    io.to(targetUserId).emit('webrtc:offer', { offer, callerId: socket.id });
  });

  // 5. Relay SDP Answer
  socket.on('webrtc:answer', ({ targetUserId, answer }) => {
    io.to(targetUserId).emit('webrtc:answer', { answer });
  });

  // 6. Relay ICE Candidates
  socket.on('webrtc:ice-candidate', ({ targetUserId, candidate }) => {
    io.to(targetUserId).emit('webrtc:ice-candidate', { candidate });
  });

  // 7. End Call
  socket.on('webrtc:call-ended', ({ targetUserId }) => {
    io.to(targetUserId).emit('webrtc:call-ended');
  });
};
