import { Redis } from 'ioredis';
import { redisChannel } from '../../constants/eventsConstant.js';

interface IData {
    room_id: string,
    text: string,
    name: string,
    socketId: string
}

const createSendMessageProcessor = (redispub: Redis, data: IData) => {
    redispub.publish(redisChannel, JSON.stringify(data));
}

export default createSendMessageProcessor