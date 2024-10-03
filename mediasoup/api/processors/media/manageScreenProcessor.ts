import PeerService from "../../model/userModel.js";
import { peers} from "../../constants/variableConstant.js";
import { MUTE_UNMUTE } from "../../constants/mediasoupEventConstant.js";
import { Socket } from "socket.io";

const shareScreen = (type:'mic'|'cam',peer:PeerService,value:boolean,socketId:string,socket:Socket) => {
    const room_id = peer.room_id;
    if(peer.isShareScreen){
        peers.set(socketId,peer);
        socket.to(room_id).emit("stop_share_screen",{value,type,socketId});
    }else{
        socket.to(room_id).emit("start_share_screen",{value,type,socketId});
    }
   
}

export default shareScreen