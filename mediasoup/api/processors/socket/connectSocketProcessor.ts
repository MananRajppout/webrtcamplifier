import { Server } from "socket.io";

class ConnectSocketProcessor {
    private _io: Server;

    constructor() {  
        this._io = new Server({
            cors: {
                allowedHeaders: ['*'],
                origin: '*'
            }
        });
    }

    get io() {
        return this._io;
    }

}

export default ConnectSocketProcessor;