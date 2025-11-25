import { api } from '@/lib/api-client';
import type { ChatMessageDTO } from '@/types/api.types';
import type { ChatMessage } from '@/types/chat';
import SockJS from 'sockjs-client';
import { Client, type StompSubscription } from '@stomp/stompjs';

/**
 * Chat Service
 * Handles chat-related API calls and WebSocket connections
 */

/**
 * Get chat message history for a conversation
 * GET /api/chat/history/{conversationId}
 */
export async function getChatHistory(conversationId: number): Promise<ChatMessage[]> {
  const response = await api.get<ChatMessageDTO[]>(`/chat/history/${conversationId}`);
  
  return response.data.map((dto): ChatMessage => ({
    id: dto.id,
    senderId: dto.senderId,
    senderName: dto.senderUsername || 'Unknown',
    senderAvatar: dto.senderAvatar,
    content: dto.content,
    timestamp: dto.timestamp,
    read: dto.read || false,
  }));
}

/**
 * WebSocket connection for real-time chat using STOMP over SockJS
 */
export class ChatWebSocket {
  private client: Client | null = null;
  private conversationId: number | null = null;
  private subscription: StompSubscription | null = null;
  private onMessageCallback: ((message: ChatMessage) => void) | null = null;
  private onErrorCallback: ((error: Error) => void) | null = null;
  private onConnectCallback: (() => void) | null = null;
  private onDisconnectCallback: (() => void) | null = null;

  /**
   * Get WebSocket URL based on environment
   * SockJS requires http:// or https://, not ws:// or wss://
   */
  private getWebSocketUrl(): string {
    // Use same base URL as API client
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
    // Remove /api suffix if present
    const baseUrl = apiUrl.replace(/\/api$/, '');
    // SockJS requires http:// or https://, it handles the WebSocket protocol internally
    // Ensure we have http:// or https://
    if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
      // If no protocol, default to http://
      return `http://${baseUrl}/ws-chat`;
    }
    return `${baseUrl}/ws-chat`;
  }

  /**
   * Connect to WebSocket
   * @param conversationId - The conversation ID to connect to
   * @param accessToken - JWT access token for authentication
   * @param onMessage - Callback when a message is received
   * @param onError - Callback when an error occurs
   * @param onConnect - Callback when connected
   * @param onDisconnect - Callback when disconnected
   */
  connect(
    conversationId: number,
    accessToken: string,
    onMessage: (message: ChatMessage) => void,
    onError?: (error: Error) => void,
    onConnect?: () => void,
    onDisconnect?: () => void
  ) {
    // Disconnect existing connection if any
    if (this.client?.active) {
      this.disconnect();
    }

    this.conversationId = conversationId;
    this.onMessageCallback = onMessage;
    this.onErrorCallback = onError || null;
    this.onConnectCallback = onConnect || null;
    this.onDisconnectCallback = onDisconnect || null;

    // Create STOMP client with SockJS
    this.client = new Client({
      webSocketFactory: () => new SockJS(this.getWebSocketUrl()) as any,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str) => {
        // Only log in development
        if (import.meta.env.DEV) {
          console.log('[STOMP]', str);
        }
      },
      onConnect: (frame) => {
        console.log('[ChatWebSocket] Connected:', frame);
        
        // Subscribe to conversation topic
        if (this.conversationId && this.client) {
          const topic = `/topic/conversation/${this.conversationId}`;
          this.subscription = this.client.subscribe(topic, (message) => {
            try {
              const chatMessageDTO: ChatMessageDTO = JSON.parse(message.body);
              const chatMessage: ChatMessage = {
                id: chatMessageDTO.id,
                senderId: chatMessageDTO.senderId,
                senderName: chatMessageDTO.senderUsername || 'Unknown',
                senderAvatar: chatMessageDTO.senderAvatar,
                content: chatMessageDTO.content,
                timestamp: chatMessageDTO.timestamp,
                read: false, // New messages are unread
              };
              
              if (this.onMessageCallback) {
                this.onMessageCallback(chatMessage);
              }
            } catch (err) {
              console.error('[ChatWebSocket] Error parsing message:', err);
            }
          });
          
          console.log(`[ChatWebSocket] Subscribed to ${topic}`);
        }

        if (this.onConnectCallback) {
          this.onConnectCallback();
        }
      },
      onStompError: (frame) => {
        console.error('[ChatWebSocket] STOMP error:', frame);
        const error = new Error(frame.headers['message'] || 'WebSocket connection error');
        if (this.onErrorCallback) {
          this.onErrorCallback(error);
        }
      },
      onWebSocketError: (event) => {
        console.error('[ChatWebSocket] WebSocket error:', event);
        const error = new Error('WebSocket connection failed');
        if (this.onErrorCallback) {
          this.onErrorCallback(error);
        }
      },
      onDisconnect: () => {
        console.log('[ChatWebSocket] Disconnected');
        if (this.onDisconnectCallback) {
          this.onDisconnectCallback();
        }
      },
      connectHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // Activate the client
    this.client.activate();
  }

  /**
   * Send a message via WebSocket
   * @param content - Message content
   */
  sendMessage(content: string) {
    if (!this.client?.active || !this.conversationId) {
      console.error('[ChatWebSocket] Cannot send message: not connected');
      throw new Error('WebSocket not connected');
    }

    const destination = `/app/chat.sendMessage/${this.conversationId}`;
    const message = { content };

    this.client.publish({
      destination,
      body: JSON.stringify(message),
    });

    console.log('[ChatWebSocket] Message sent:', { destination, content });
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }

    if (this.client) {
      if (this.client.active) {
        this.client.deactivate();
      }
      this.client = null;
    }

    this.conversationId = null;
    this.onMessageCallback = null;
    this.onErrorCallback = null;
    this.onConnectCallback = null;
    this.onDisconnectCallback = null;

    console.log('[ChatWebSocket] Disconnected and cleaned up');
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.client?.active || false;
  }

  /**
   * Get current conversation ID
   */
  getConversationId(): number | null {
    return this.conversationId;
  }
}
