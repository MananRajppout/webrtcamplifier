import * as mediasoup from 'mediasoup'



export class Consumer {
    public socketId:string
    public consumer: mediasoup.types.Consumer
    public room_id:string

    constructor(socketId:string,consumer: mediasoup.types.Consumer,room_id:string){
   
        this.consumer = consumer;
        this.room_id = room_id;
        this.socketId = socketId;
    }
}


class ConsumerProcessor {
    public consumers: Consumer[];

    constructor(){
        this.consumers = [];
    }


    addConsumer(consumer:Consumer){
        this.consumers.push(consumer);
    }

    remove(socketId:string){
        this.consumers.forEach((consumer:Consumer) => {
            if(consumer.socketId == socketId){
                consumer?.consumer?.close();
            }
        });
        this.consumers = this.consumers.filter((consumer:Consumer) => consumer.socketId != socketId);
    }

    removeByConsumerId(consumerId:string){
        this.consumers = this.consumers.filter((consumer) => consumer.consumer.id !== consumerId);
    }

    findConsumerId(consumerId:string):mediasoup.types.Consumer | undefined{
        const consumer: Consumer | undefined = this.consumers.find((consumer) => consumer.consumer.id == consumerId);
       
        return consumer?.consumer
    }

    getConsumer(socketId:string):mediasoup.types.Consumer | undefined{
        const consumer:Consumer | undefined = this.consumers.find((consumer:Consumer) => consumer.socketId == socketId);
        return consumer?.consumer;
    }

}

export default ConsumerProcessor;