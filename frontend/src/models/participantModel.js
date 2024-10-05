

class ParticipantModel {
    name;
    socketId;
    audioTrack;
    videoTrack;
    isMicMute;
    isWebCamMute;
    isShareScreen;
    role;

    constructor(name,socketId,isWebCamMute=true,isMicMute=true,isShareScreen=false,role="participant"){
        this.name = name;
        this.socketId = socketId;
        this.audioTrack = null;
        this.videoTrack = null;
        this.isMicMute = isMicMute;
        this.isWebCamMute = isWebCamMute;
        this.isShareScreen = isShareScreen;
        this.role = role;
    }


}

export default ParticipantModel;