

class ParticipantModel {
    name;
    socketId;
    audioTrack;
    videoTrack;
    isMicMute;
    isWebCamMute;
    isShareScreen;

    constructor(name,socketId,isWebCamMute=true,isMicMute=true,isShareScreen=false){
        this.name = name;
        this.socketId = socketId;
        this.audioTrack = null;
        this.videoTrack = null;
        this.isMicMute = isMicMute;
        this.isWebCamMute = isWebCamMute;
        this.isShareScreen = isShareScreen;
    }


}

export default ParticipantModel;