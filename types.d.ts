/// <reference types="socket.io" />

declare namespace SocketIOExt {
    export interface Server extends SocketIO.Server { }

    export interface Socket extends SocketIO.Socket { }
    export interface Adapter extends SocketIO.Adapter { }
    export interface EngineSocket extends SocketIO.EngineSocket { }
    export interface Namespace extends SocketIO.Namespace { }
    export interface ServerOptions extends SocketIO.ServerOptions { }

    export interface Packet {
        /**
         * Type of the Packet.
         */
        type: number;

        /**
         * Namespace of the packet.
         */
        nsp: string;

        /** 
         * ID of the Packet.
         */
        id: number;

        /**
         * Data associated with the packet.
         */
        data: Array<any>;
    }
}