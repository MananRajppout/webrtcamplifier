
export class RecordingServerConnector {
    constructor(meetingId,projectId) {
        this.recordingServer = new WebSocket(`${process.env.NEXT_PUBLIC_RECORDING_SERVER_URL}?meetingId=${meetingId}&projectId=${projectId}`);
        this.recordingServer.onopen = this.onOpen;
        this.recordingServer.onmessage = this.onMessage;
        this.recordingServer.onclose = this.onClose;
        this.recordingServer.onerror = this.onError;
    }

    get WebSocket() {
        return this.recordingServer;
    }

    get isOpen() {
        return this.recordingServer.readyState === WebSocket.OPEN;
    }
    
    onOpen = (event) => {
        console.log("Connected to recording server");
    }
    
    onMessage = (event) => {
        console.log("Message from recording server: ", event.data);
    }
    
    onClose = (event) => {
        console.log("Disconnected from recording server");
    }
    
    onError = (event) => {
        console.log("Error connecting to recording server");
    }
    
    send = (message) => {
        if(!this.isOpen) return;
        this.recordingServer.send(message);
    }
    
    close = () => {
        this.recordingServer.close();
    }
}