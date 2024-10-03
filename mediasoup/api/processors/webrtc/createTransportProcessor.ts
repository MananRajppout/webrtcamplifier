import * as mediasoup from 'mediasoup'

export class Transport {
    public socketId:string
    public transport: mediasoup.types.WebRtcTransport
    public room_id:string
    public consumer: Boolean

    constructor(socketId:string,transport: mediasoup.types.WebRtcTransport,room_id:string,consumer: Boolean){
        this.consumer = consumer;
        this.transport = transport;
        this.room_id = room_id;
        this.socketId = socketId;
    }
}


class TransportProcessor {
    public transports: Transport[];

    constructor(){
        this.transports = [];
    }


    addTransport(transport:Transport){
        this.transports.push(transport);
    }

    remove(socketId:string){
        this.transports.forEach((transport:Transport) => {
            if(transport.socketId == socketId){
                transport?.transport?.close();
            }
        })
        this.transports = this.transports.filter((transport:Transport) => transport.socketId != socketId);
    }

    removeByTransportId(transportId:string){
        this.transports = this.transports.filter((transport) => transport.transport.id !== transportId);
    }

    getTranport(socketId:string):mediasoup.types.WebRtcTransport | undefined{
        const transport:Transport | undefined = this.transports.find((transport:Transport) => transport.socketId == socketId);
        return transport?.transport;
    }


    getTransportById(id:string){
       const transport:Transport|undefined =  this.transports.find((transport:Transport) => transport.transport.id == id && transport.consumer);
       return transport?.transport;
    }


}

export default TransportProcessor;