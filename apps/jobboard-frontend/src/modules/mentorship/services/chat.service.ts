import { api } from '@shared/lib/api-client';
import type { ChatMessageDTO } from '@shared/types/api.types';
import type { ChatMessage } from '@shared/types/chat';
import { SharedStompClient } from '@shared/services/stompClient';

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
    id: String(dto.id),
    senderId: String(dto.senderId),
    senderName: dto.senderUsername || 'Unknown',
    senderAvatar: dto.senderAvatar,
    content: dto.content,
    timestamp: dto.timestamp,
    // Use read status from backend exactly as it comes
    read: dto.read || false,
  }));
}


/**
 * WebSocket connection for real-time chat using STOMP over SockJS
 * 
 * WebSocket sadece "real-time mesaj push" için kullanılacak.
 * Unread sayısı WS'den gelen event'e göre yönetilecek ama aktif ekranda unread artmayacak.
 */
export class ChatWebSocket {
  private client: SharedStompClient | null = null;
  private conversationId: number | null = null;
  private unsubscribe: (() => void) | null = null;
  private onMessageCallback: ((message: ChatMessage) => void) | null = null;
  private onErrorCallback: ((error: Error) => void) | null = null;
  private onConnectCallback: (() => void) | null = null;
  private onDisconnectCallback: (() => void) | null = null;

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
    if (this.client?.isConnected()) {
      this.disconnect();
    }

    this.conversationId = conversationId;
    this.onMessageCallback = onMessage;
    this.onErrorCallback = onError || null;
    this.onConnectCallback = onConnect || null;
    this.onDisconnectCallback = onDisconnect || null;

    this.client = new SharedStompClient({
      token: accessToken,
      debug: import.meta.env.DEV,
      onConnect: () => {
        if (this.conversationId && this.client) {
          const topic = `/topic/conversation/${this.conversationId}`;
          this.unsubscribe = this.client.subscribe(topic, (message) => {
            try {
              const chatMessageDTO: ChatMessageDTO = JSON.parse(message.body);
              const chatMessage: ChatMessage = {
                id: String(chatMessageDTO.id),
                senderId: String(chatMessageDTO.senderId),
                senderName: chatMessageDTO.senderUsername || 'Unknown',
                senderAvatar: chatMessageDTO.senderAvatar,
                content: chatMessageDTO.content,
                timestamp: chatMessageDTO.timestamp,
                read: false,
              };

              this.onMessageCallback?.(chatMessage);
            } catch (err) {
              console.error('[ChatWebSocket] Error parsing message:', err);
            }
          });
        }

        this.onConnectCallback?.();
      },
      onDisconnect: () => {
        this.onDisconnectCallback?.();
      },
      onError: (error) => {
        this.onErrorCallback?.(error);
      },
    });

    this.client
      .connect()
      .catch((error) => {
        this.onErrorCallback?.(error);
      });
  }


  /**
   * Send a message via WebSocket
   * @param content - Message content
   */
  sendMessage(content: string) {
    if (!this.client?.isConnected() || !this.conversationId) {
      console.error('[ChatWebSocket] Cannot send message: not connected');
      throw new Error('WebSocket not connected');
    }

    const destination = `/app/chat.sendMessage/${this.conversationId}`;
    this.client.publish(destination, { content });

    console.log('[ChatWebSocket] Message sent:', { destination, content });
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }

    if (this.client) {
      this.client.disconnect();
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
    return this.client?.isConnected() || false;
  }

  /**
   * Get current conversation ID
   */
  getConversationId(): number | null {
    return this.conversationId;
  }

  /**
   * Send read sync to backend
   * Marks all messages in the conversation as read
   */
  sendReadSync() {
    if (!this.client?.isConnected() || !this.conversationId) {
      console.warn('[ChatWebSocket] Cannot send read sync: not connected');
      return;
    }

    try {
      const destination = `/app/chat.readSync`;
      const message = { conversationId: this.conversationId };

      this.client.publish(destination, message);

      console.log('[ChatWebSocket] Read sync sent:', { destination, conversationId: this.conversationId });
    } catch (error) {
      console.warn('[ChatWebSocket] Failed to send read sync:', error);
    }
  }
}
