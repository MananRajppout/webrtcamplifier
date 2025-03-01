

export class GenerateCaption {
    io = null;
    audioStream = null;
    socket = null;
    myTracks = null;
    email=null;
    name=null;
    meetingId=null;

    constructor(io,myTracks,email, name, meetingId) {
        this.io = io;
        this.myTracks = myTracks;
        this.name = name;
        this.email = email;
        this.meetingId = meetingId;
        this.sendAudioStream();
    }




    async getAudioStream() {
        const stream = new MediaStream([this.myTracks]);
        return stream;

    }

    sendAudioStream() {
        this.getAudioStream().then(stream => {
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'audio/webm',
            })
            this.socket = new WebSocket(`wss://api.deepgram.com/v1/listen?model=nova-2-phonecall&language=en`, [
                'token',
                process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY,
            ])
            this.socket.onopen = () => {
                console.log({ event: 'onopen' })
                mediaRecorder.addEventListener('dataavailable', async (event) => {
                    if (event.data.size > 0 && this.socket.readyState == 1) {
                        this.socket.send(event.data)
                    }
                });
                mediaRecorder.start(250);
            }

            this.socket.onmessage = (message) => {
                const received = JSON.parse(message.data)
                const transcript = received.channel.alternatives[0].transcript
                if (transcript && received.is_final) {
                    const data = {
                        transcript: transcript,
                        name: this.name,
                        email: this.email,
                        meetingId: this.meetingId
                    }

                    
                    this.io.emit("caption:send",data);
                }
            }

            this.socket.onclose = () => {
                console.log({ event: 'onclose' })
            }

            this.socket.onerror = (error) => {
                console.log({ event: 'onerror', error })
            }
        }).catch(err => console.log(err.message));
    }



    handlemute(value){
        this.audioStream.getAudioTracks().forEach(track => {
            track.enabled = !value;
        });
    }


    disconnect(){
        this.socket.close();
    }
}