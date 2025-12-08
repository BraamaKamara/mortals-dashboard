import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:3001';

export function useSocket(token) {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!token) return;

    try {
      // Create socket connection with CORS error handling
      socketRef.current = io(SOCKET_URL, {
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 3, // Reduced from 5 to fail faster
        transports: ['polling'], // Use polling only to avoid WebSocket CORS issues
      });

      const socket = socketRef.current;

      socket.on('connect', () => {
        console.log('[Socket.io] Connected to server');
        // Authenticate with JWT token
        try {
          socket.emit('authenticate', token);
        } catch (e) {
          console.warn('[Socket.io] Auth emit failed (non-blocking):', e.message);
        }
      });

      socket.on('disconnect', (reason) => {
        console.log('[Socket.io] Disconnected:', reason);
      });

      socket.on('connect_error', (error) => {
        // Silently log CORS errors - don't break the app
        if (error?.message?.includes('CORS') || error?.message?.includes('ERR_FAILED')) {
          console.warn('[Socket.io] Backend unavailable (CORS/connection issue) - app will work offline');
        } else {
          console.error('[Socket.io] Connection error:', error);
        }
      });

      socket.on('error', (error) => {
        // Catch socket errors gracefully
        console.warn('[Socket.io] Socket error (non-blocking):', error);
      });
    } catch (e) {
      // Socket initialization failed - app continues without realtime features
      console.warn('[Socket.io] Failed to initialize socket.io:', e.message);
    }

    // Cleanup on unmount
    return () => {
      try {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      } catch (e) {
        console.warn('[Socket.io] Disconnect failed:', e.message);
      }
    };
  }, [token]);

  return socketRef.current;
}

export function useSocketEvent(socket, eventName, handler) {
  useEffect(() => {
    if (!socket) return;

    socket.on(eventName, handler);

    return () => {
      socket.off(eventName, handler);
    };
  }, [socket, eventName, handler]);
}
