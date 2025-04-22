import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

interface WebSocketMessage {
  data: string;
  type: string;
  timestamp: number;
}

export default function useWebSocket(path: string) {
  const { data: session } = useSession();
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);
  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_INTERVAL = 3000;

  const connect = useCallback(() => {
    if (!session?.user?.id) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}${path}?userId=${session.user.id}`;
    
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      setReconnectAttempt(0);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      
      // Attempt to reconnect if we haven't exceeded max attempts
      if (reconnectAttempt < MAX_RECONNECT_ATTEMPTS) {
        setTimeout(() => {
          setReconnectAttempt(prev => prev + 1);
          connect();
        }, RECONNECT_INTERVAL);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = {
          data: event.data,
          type: 'message',
          timestamp: Date.now(),
        };
        setLastMessage(message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    setSocket(ws);

    // Cleanup function
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [path, session?.user?.id, reconnectAttempt]);

  useEffect(() => {
    const cleanup = connect();
    return () => {
      cleanup?.();
      setSocket(null);
      setIsConnected(false);
      setLastMessage(null);
    };
  }, [connect]);

  // Send a message through the WebSocket
  const sendMessage = useCallback((data: any) => {
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(data));
    } else {
      console.error('WebSocket is not connected');
    }
  }, [socket]);

  return {
    socket,
    isConnected,
    lastMessage,
    sendMessage,
  };
} 