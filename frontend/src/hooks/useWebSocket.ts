import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/lib/stores/auth-store';

const SOCKET_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000';

export function useWebSocket(namespace: string = '/render') {
  const { accessToken } = useAuthStore();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!accessToken) return;

    const socket = io(`${SOCKET_URL}${namespace}`, {
      auth: {
        token: accessToken,
      },
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [accessToken, namespace]);

  const subscribeToRender = (renderId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('subscribe-render', { renderId });
    }
  };

  const unsubscribeFromRender = (renderId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('unsubscribe-render', { renderId });
    }
  };

  const onRenderProgress = (callback: (data: { renderId: string; progress: number }) => void) => {
    if (socketRef.current) {
      socketRef.current.on('render:progress', callback);
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.off('render:progress', callback);
      }
    };
  };

  const onRenderComplete = (callback: (data: { renderId: string; outputUrl: string }) => void) => {
    if (socketRef.current) {
      socketRef.current.on('render:complete', callback);
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.off('render:complete', callback);
      }
    };
  };

  const onRenderError = (callback: (data: { renderId: string; error: string }) => void) => {
    if (socketRef.current) {
      socketRef.current.on('render:error', callback);
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.off('render:error', callback);
      }
    };
  };

  return {
    isConnected,
    subscribeToRender,
    unsubscribeFromRender,
    onRenderProgress,
    onRenderComplete,
    onRenderError,
  };
}

