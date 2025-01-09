
export class RecordingServerConnector {
    constructor(meetingId,projectId,email,fullName,userRole) {
        this.recordingServer = new WebSocket(`${process.env.NEXT_PUBLIC_RECORDING_SERVER_URL}?meetingId=${meetingId}&projectId=${projectId}&email=${email}&role=${userRole}&name=${fullName}`);
        this.recordingServer.onmessage = this.onMessage;
        this.recordingServer.onclose = this.onClose;
    }

    get WebSocket() {
        return this.recordingServer;
    }

    get isOpen() {
        return this.recordingServer.readyState === WebSocket.OPEN;
    }
    
    
    onMessage = (event) => {
        console.log("Message from recording server: ", event.data);
    }
    
    onClose = (event) => {
        console.log("Disconnected from recording server");
    }
    

    
    send = (message) => {
        if(!this.isOpen) return;
        this.recordingServer.send(message);
    }
    
    close = () => {
        this.recordingServer.close();
    }

    waitForConnection = () => {
        return new Promise((resolve, reject) => {
            if(this.isOpen) {
                console.log("Connected to recording server");
                resolve();
            } else {
                this.recordingServer.onopen = () => resolve();
                this.recordingServer.onerror = () => reject();
            }
        })
    }
}