declare module 'sockjs-client' {
  interface SockJSOptions {
    transports?: string[];
    timeout?: number;
    sessionId?: number | (() => number);
    server?: string;
    devel?: boolean;
    debug?: boolean;
    protocols_whitelist?: string[];
    [key: string]: any;
  }

  class SockJS {
    constructor(url: string, protocols?: string | string[] | null, options?: SockJSOptions);
    protocol: string;
    readyState: number;
    url: string;
    onopen: ((event: any) => void) | null;
    onmessage: ((event: any) => void) | null;
    onclose: ((event: any) => void) | null;
    onerror: ((event: any) => void) | null;
    send(data: string | ArrayBuffer | Blob): void;
    close(code?: number, reason?: string): void;
    static readonly CONNECTING: number;
    static readonly OPEN: number;
    static readonly CLOSING: number;
    static readonly CLOSED: number;
  }

  export = SockJS;
}

