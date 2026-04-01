type WsCallback<T = Event> = (event: T) => void

interface WebSocketClientOptions {
  url: string;
  protocol?: string | string[];
  autoReconnectInterval?: number;
  onopen?: WsCallback;
  onmessage?: WsCallback<MessageEvent>;
  onclose?: WsCallback<CloseEvent>;
  onerror?: WsCallback<Event>;
}

export default class WebSocketClient {
  private ws: WebSocket | null = null;
  private queue: object[] = [];
  private options: WebSocketClientOptions;
  private isManualClose = false;

  constructor(options: WebSocketClientOptions) {
    this.options = { autoReconnectInterval: 0, ...options };
    this.open();
  }


  public send(data: object): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      this.queue.push(data);
    }
  }

  public close(): void {
    this.isManualClose = true;
    this.ws?.close(1000);
  }


  private open(): void {
    this.isManualClose = false;
    this.ws = new WebSocket(this.options.url, this.options.protocol);

    // Listener registrieren
    this.ws.addEventListener('open', this.handleOpen);
    this.ws.addEventListener('message', this.handleMessage as EventListener);
    this.ws.addEventListener('error', this.handleError);
    this.ws.addEventListener('close', this.handleClose as EventListener);
  }

  private handleOpen = (e: Event): void => {
    console.log('WebSocket connected');
    this.flushQueue();
    this.options.onopen?.(e);
  };

  private handleMessage = (e: MessageEvent): void => {
    this.options.onmessage?.(e);
  };

  private handleError = (e: Event): void => {
    console.error('WebSocket error:', e);
    this.options.onerror?.(e);
  };

  private handleClose = (e: CloseEvent): void => {
    this.cleanup() // remove old listeners
    this.options.onclose?.(e);

    if (!this.isManualClose && e.code !== 1000 && this.options.autoReconnectInterval! > 0) {
      console.log(`WebSocket: Reconnecting in ${this.options.autoReconnectInterval}ms...`);
      setTimeout(() => this.open(), this.options.autoReconnectInterval);
    }
  };

  private cleanup(): void {
    if (this.ws) {
      this.ws.removeEventListener('open', this.handleOpen);
      this.ws.removeEventListener('message', this.handleMessage as EventListener);
      this.ws.removeEventListener('error', this.handleError);
      this.ws.removeEventListener('close', this.handleClose as EventListener);
      this.ws = null;
    }
  }

  private flushQueue(): void {
    while (this.queue.length > 0 && this.ws?.readyState === WebSocket.OPEN) {
      const obj = this.queue.shift();
      if (obj) {
        this.ws.send(JSON.stringify(obj))
      }
    }
  }
}
