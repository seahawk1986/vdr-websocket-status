/* WebsocketClient, usage:
wsClient = new WebSocketClient({
    url: "ws://" + location.host,
    protocol: "optional",
    autoReconnectInterval: 5000, // default is 0, without reconnect
    onopen: () => {  ...  },
    onmessage: (msg) => {  ...  },
    onclose: function () {  ...  },
    onerror: function (err) {  ...  }
})
*/

interface WsFunctionInterface {
  (event: Event): any | null
}

// interface WsErrorFunctionInterface {
//   (event: Event|ErrorEvent): any|null
// }

// TODO: currently this implementation doesn't recognize if the VDR dies resp. is restarted

interface WsCloseFunctionInterface {
  (event: CloseEvent): any | null
}

interface WsMessageFunctionInterface {
  (event: MessageEvent): any | null
}

interface WebSocketClientOptionInterface {
  url: string
  protocol: string
  autoReconnectInterval: number
  onopen: WsFunctionInterface
  onclose: WsCloseFunctionInterface
  onmessage: WsMessageFunctionInterface
  // onerror: WsErrorFunctionInterface
}

export default class WebSocketClientClass {
  options: WebSocketClientOptionInterface
  queue: object[] | null = []
  ws: WebSocket | null = null

  constructor(options: WebSocketClientOptionInterface) {
    if (!window.WebSocket) {
      console.log('Error: no Websocket support')
      throw new Error('No websocket support available')
    }
    this.options = options
    this.open()
  }

  onclose() {
    console.log('websocket connection closed')
  }

  onerror(err: Event) {
    console.log('websocket error:', err)
  }

  // for (const key in options) { this[key] = options[key] }
  reconnect(e: Event) {
    if (this.options.autoReconnectInterval) {
      console.log(`WebSocketClient: retry in ${this.options.autoReconnectInterval} ms`, e)
      setTimeout(() => {
        console.log('WebSocketClient: reconnecting...')
        this.open()
      }, this.options.autoReconnectInterval)
    }
  }

  send(JSONobj: object) {
    if (this.queue) {
      this.queue.push(JSONobj)
    } else {
      this.ws?.send(JSON.stringify(JSONobj))
    }
  }

  open() {
    this.ws = new WebSocket(this.options.url, this.options.protocol)
    console.log('ws created:', this.ws)
    const client = this
    this.ws.addEventListener('open', function (e) {
      if (client.queue && client.ws) {
        let JSONobj
        while ((JSONobj = client.queue.shift())) {
          client.ws.send(JSON.stringify(JSONobj))
        }
        client.queue = null
      }
      client.options.onopen(e)
    })
    this.ws.onmessage = this.options.onmessage
    this.ws.addEventListener('close', function (e) {
      // console.log('got WS onclose callback: ', e)
      client.queue = []
      switch (e.code) {
        case 1000: { // CLOSE_NORMAL
          console.log('WebSocket: closed')
          break
        }
        default: { // Abnormal closure
          client.reconnect(e)
          break
        }
      }
      client.options.onclose && client.options.onclose(e)
    })
    this.ws.onerror = function (e: Event): any | null {
      console.log('ws.onerror got:', e)
      switch (e.type) {
        case 'ECONNREFUSED': {
          client.reconnect(e)
          break
        }
        default: {
          client.onerror || client.onerror(e)
          break
        }
      }
    }
  }

  reopen() {
    if (this.ws) {
      this.ws.onerror = this.ws.onclose = this.ws.onmessage = null
      this.ws.close()
      this.open()
    }
  }
}
