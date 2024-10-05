class UserModel {
    public socketId: string;
    public transports: string[] = [];
    public producers: string[] = [];
    public consumers: string[] = [];
    public username: string;
    public isModirator: boolean;
    public room_id: string;
    public isMicMute: boolean;
    public isWebCamMute: boolean;
    public isShareScreen: boolean;
    public role: "modirator" | "participant" | "observer" = "participant";

    constructor(socketId:string,isModirator:boolean,username:string,room_id:string,isWebCamMute:boolean=true,isMicMute:boolean=true,isShareScreen:boolean=false,role: "modirator" | "participant" | "observer" = "participant"){
        this.socketId = socketId;
        this.username = username;
        this.isModirator = isModirator;
        this.room_id = room_id;
        this.isMicMute = isMicMute;
        this.isWebCamMute = isWebCamMute;
        this.role = role;
        this.isShareScreen = isShareScreen;
    }

}

export default UserModel;