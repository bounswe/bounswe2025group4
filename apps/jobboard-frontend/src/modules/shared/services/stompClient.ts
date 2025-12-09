import SockJS from 'sockjs-client';
import { Client, type IMessage, type StompSubscription } from '@stomp/stompjs';

type StompPath = string | undefined;

export interface StompConfig {
  token: string;
  path?: StompPath;
  debug?: boolean;
  reconnectDelayMs?: number;
  heartbeatIncomingMs?: number;
  heartbeatOutgoingMs?: number;
  hostHeader?: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

/**
  * Shared STOMP/SockJS client for real-time features (chat, notifications, etc.).
  *
  * - Uses VITE_API_URL to derive the WebSocket endpoint (defaults to /ws-chat).
  * - Adds Authorization: Bearer <token> on connect.
  * - Exposes minimal subscribe/publish/disconnect helpers.
  */
export class SharedStompClient {
  private client: Client | null = null;
  private subscriptions: StompSubscription[] = [];
  private config: StompConfig;
  private connectPromise: Promise<void> | null = null;

  constructor(config: StompConfig) {
    this.config = config;
  }

  private getWebSocketUrl(path?: StompPath): string {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
    const baseUrl = apiUrl.replace(/\/api$/, '');
    const cleanBase =
      baseUrl.startsWith('http://') || baseUrl.startsWith('https://')
        ? baseUrl
        : `http://${baseUrl}`;
    const resolvedPath = path || '/ws-chat';
    return `${cleanBase}${resolvedPath.startsWith('/') ? resolvedPath : `/${resolvedPath}`}`;
  }

  /**
   * Establishes the STOMP connection (idempotent).
   */
  connect(): Promise<void> {
    if (this.client?.active) {
      return this.connectPromise || Promise.resolve();
    }

    this.connectPromise = new Promise((resolve, reject) => {
      this.client = new Client({
        webSocketFactory: () =>
          new SockJS(this.getWebSocketUrl(this.config.path)) as unknown as WebSocket,
        reconnectDelay: this.config.reconnectDelayMs ?? 5000,
        heartbeatIncoming: this.config.heartbeatIncomingMs ?? 4000,
        heartbeatOutgoing: this.config.heartbeatOutgoingMs ?? 4000,
        debug: (message) => {
          if (this.config.debug && import.meta.env.DEV) {
            console.log('[STOMP]', message);
          }
        },
        connectHeaders: {
          Authorization: `Bearer ${this.config.token}`,
          ...(this.config.hostHeader ? { host: this.config.hostHeader } : {}),
        },
        onConnect: () => {
          this.config.onConnect?.();
          resolve();
        },
        onDisconnect: () => {
          this.config.onDisconnect?.();
        },
        onStompError: (frame) => {
          const error = new Error(frame.headers['message'] || 'STOMP error');
          this.config.onError?.(error);
          reject(error);
        },
        onWebSocketError: () => {
          const error = new Error('WebSocket connection failed');
          this.config.onError?.(error);
          reject(error);
        },
      });

      this.client.activate();
    });

    return this.connectPromise;
  }

  /**
   * Subscribe to a destination. Returns an unsubscribe function.
   */
  subscribe(destination: string, onMessage: (message: IMessage) => void): () => void {
    if (!this.client?.active) {
      throw new Error('STOMP client is not connected');
    }

    const subscription = this.client.subscribe(destination, onMessage);
    this.subscriptions.push(subscription);

    return () => {
      subscription.unsubscribe();
      this.subscriptions = this.subscriptions.filter((s) => s !== subscription);
    };
  }

  /**
   * Publish a message to a destination.
   */
  publish(destination: string, body?: unknown) {
    if (!this.client?.active) {
      throw new Error('STOMP client is not connected');
    }

    this.client.publish({
      destination,
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * Disconnects and cleans up subscriptions.
   */
  disconnect() {
    this.subscriptions.forEach((s) => s.unsubscribe());
    this.subscriptions = [];

    if (this.client) {
      if (this.client.active) {
        this.client.deactivate();
      }
      this.client = null;
    }

    this.connectPromise = null;
    this.config.onDisconnect?.();
  }

  isConnected(): boolean {
    return Boolean(this.client?.active);
  }
}

