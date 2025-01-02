

class ParticipantModel {
    name;
    socketId;
    audioTrack;
    videoTrack;
    displayTrack;
    isMicMute;
    isWebCamMute;
    isShareScreen;
    role;
    email;


    constructor(name,socketId,isWebCamMute=true,isMicMute=true,isShareScreen=false,role="participant",email){
        this.name = name;
        this.socketId = socketId;
        this.audioTrack = null;
        this.videoTrack = null;
        this.isMicMute = isMicMute;
        this.isWebCamMute = isWebCamMute;
        this.isShareScreen = isShareScreen;
        this.role = role;
        this.email = email;
    }


}

export default ParticipantModel;