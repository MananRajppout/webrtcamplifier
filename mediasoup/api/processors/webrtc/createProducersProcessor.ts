import * as mediasoup from 'mediasoup'



interface IProducerData {
    producerId: string
    socketId: string
}

export class Producer {
    public socketId:string
    public producer: mediasoup.types.Producer
    public room_id:string

    constructor(socketId:string,producer: mediasoup.types.Producer,room_id:string){
   
        this.producer = producer;
        this.room_id = room_id;
        this.socketId = socketId;
    }
}


class ProducerProcessor {
    public producers: Producer[];

    constructor(){
        this.producers = [];
    }


    addProducer(producer:Producer){
        this.producers.push(producer);
    }

    remove(socketId:string){
        this.producers.forEach((producer:Producer) => {
            if(producer.socketId == socketId){
                producer?.producer?.close();
            }
        });
        this.producers = this.producers.filter((producer:Producer) => producer.socketId != socketId);
    }

    getProducer(socketId:string):mediasoup.types.Producer | undefined{
        const producer:Producer | undefined = this.producers.find((producer:Producer) => producer.socketId == socketId);
        return producer?.producer;
    }

    getAllProducer(room_id:string,socketId:string):IProducerData[]{
        return this.producers.filter((producer:Producer) => producer.room_id == room_id && producer.socketId != socketId).map((producer:Producer) => ({producerId: producer.producer.id,socketId: producer.socketId}));
    }


}

export default ProducerProcessor;