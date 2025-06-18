import { createServer } from 'http';
import { Server } from 'socket.io';

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: '*', // Replace with actual frontend URL in production
  },
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Save the current session ID for this socket
  let currentSessionId: string | null = null;

  // Join a specific whiteboard session (room)
  socket.on('join', (sessionId: string) => {
    currentSessionId = sessionId;
    socket.join(sessionId);
    console.log(`${socket.id} joined session ${sessionId}`);
  });

  // Handle drawing data
  socket.on('drawing', ({ sessionId, line }) => {
    socket.to(sessionId).emit('drawing', line);
  });

  // Handle real-time cursor updates
  socket.on('cursor', ({ sessionId, x, y }) => {
    socket.to(sessionId).emit('cursor', {
      id: socket.id,
      x,
      y,
    });
  });

  // Handle chat messages
  socket.on('chat', (message: string) => {
    if (currentSessionId) {
      io.to(currentSessionId).emit('chat', message);
    }
  });

  // Cleanup
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

httpServer.listen(5000, () => {
  console.log('Socket.IO server running at http://localhost:5000');
});
