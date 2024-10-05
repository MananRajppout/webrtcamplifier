import PeerService from "../../model/userModel.js";
import { peers} from "../../constants/variableConstant.js";
import { MUTE_UNMUTE } from "../../constants/mediasoupEventConstant.js";
import { Socket } from "socket.io";

const manageAudioProcessor = (type:'mic'|'cam'|'screen',peer:PeerService,value:boolean,socketId:string,socket:Socket) => {
    if(type == 'mic'){
        peer.isMicMute = value;
    }else if(type == 'cam'){
        peer.isWebCamMute = value;
    }else{
        if(value){
            peer.isShareScreen = value;
            peer.isWebCamMute = true;
        }else{
            peer.isShareScreen = false;
        }
    }
    peers.set(socketId,peer);
    const room_id = peer.room_id;
    socket.to(room_id).emit(MUTE_UNMUTE,{value,type,socketId});
}

export default manageAudioProcessor