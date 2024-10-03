import PeerService from "../../model/userModel.js";
import { peers} from "../../constants/variableConstant.js";
import { MUTE_UNMUTE } from "../../constants/mediasoupEventConstant.js";
import { Socket } from "socket.io";

const manageAudioProcessor = (type:'mic'|'cam',peer:PeerService,value:boolean,socketId:string,socket:Socket) => {
    if(type == 'mic'){
        peer.isMicMute = value;
    }else{
        peer.isWebCamMute = value;
    }
    peers.set(socketId,peer);
    const room_id = peer.room_id;
    socket.to(room_id).emit(MUTE_UNMUTE,{value,type,socketId});
}

export default manageAudioProcessor