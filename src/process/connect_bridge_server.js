import WebSocket from 'ws';
import settings from '../../settings.js';

class ConnectBridgeServer {
    constructor() {
        if (ConnectBridgeServer.instance) return ConnectBridgeServer.instance;

        this.socket = null;
        this.connected = false;
        this.reconnectInterval = 5000;
        ConnectBridgeServer.instance = this;
    }

    connect(agent) {
        if (this.connected) return this.ready;

        const serverUrl = `${settings.minecraft_bridge_server_url}:${settings.minecraft_bridge_server_port}/events`;

        try {
            this.socket = new WebSocket(serverUrl);

            this.socket.on('open', () => {
                console.log('WebSocket connected to bridge server.');
                this.connected = true;
            });

            this.socket.on('close', () => {
                console.log('WebSocket connection closed to bridge server.');
                this.connected = false;
            });

            this.socket.on('error', (error) => {
                console.error(`Websocket Bridge Connection error: ${error.message}`);
                this.connected = false;
                this.scheduleReconnect();
            });

            this.socket.on('message', (message) => {
                console.log('Received message:', message);
                try {
                    const parsedMessage = JSON.parse(message);
                    const { source, content } = parsedMessage;
                    if (source && content) {
                        agent.handleMessage(source, content);
                    } else {
                        console.warn('Invalid message format received:', message);
                    }
                } catch (error) {
                    console.error('Error processing received message:', error);
                }
            });

        } catch (error) {
            console.error(`Failed to initialize WebSocket: ${error.message}`);
            this.scheduleReconnect();
        }
    }

    scheduleReconnect() {
        if (!this.connected) {
            console.log('Attempting to reconnect...');
            setTimeout(() => this.connect(), this.reconnectInterval);
        }
    }

    sendMessage(message) {
        if (this.socket?.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(message));
            console.log('Message sent to bridge server:', message);
        } else {
            console.warn('Bridge server not connected or not ready. Message not sent:', message);
        }
    }
}

export const connectBridgeServer = new ConnectBridgeServer();
