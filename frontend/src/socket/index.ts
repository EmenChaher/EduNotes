import { Socket, io } from "socket.io-client"

class SocketManager {
  private socket: Socket | null = null
  private accessToken: string | null = null

  public connect(): void {
    if (this.socket) return

    this.socket = io(import.meta.env.VITE_APP_WEBSOCKET_BASE_URL as string, {
      query: {
        token: this.accessToken || "",
      },
    })
  }

  public setAccessToken(token: string): void {
    this.accessToken = token
  }

  public clearAccessToken(): void {
    this.accessToken = null
  }

  public on(event: string, callback: (data: any) => void): void {
    this.socket?.on(event, callback)
  }

  public off(event: string, callback: (data: any) => void): void {
    this.socket?.off(event, callback)
  }

  public disconnect(): void {
    if (!this.socket) return
    this.socket.disconnect()
    this.socket = null
  }

  public isConnected(): boolean {
    return this.socket !== null
  }
}

const socketManager = new SocketManager()
export default socketManager
