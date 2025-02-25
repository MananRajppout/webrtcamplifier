import * as mediasoup from 'mediasoup'
import {  WebRtcTransport } from 'mediasoup/node/lib/types.js';
import {WebRTCTransportConfig} from '../../config/mediasoupConfig.js'


export interface ISetting 
{
  allowScreenShare: boolean,
}


class manageRoomProcessor {
    public router: mediasoup.types.Router;
    public participants: string[] = [];
    public settings:ISetting = {
      allowScreenShare: false,
    }
    constructor(router:mediasoup.types.Router,socketId:string,settings:ISetting,role:string){
        this.router = router;
        this.participants = [socketId];
        if(role == 'Moderator'){
          this.settings = settings;
        }
    }


    addParticipants(socketId: string){
        this.participants = [...this.participants,socketId]
    }



    async createWebRtcTransport ():Promise<WebRtcTransport> {
        const router = this.router;
        return new Promise(async (resolve, reject) => {
          try {
            console.log(process.env.PUBLIC_IP,'Public IP')
            const webRtcTransport_options = {
              listenIps: [
                {
                  ip: '0.0.0.0', // replace with relevant IP address
                  // announcedIp: '127.0.0.1',
                  announcedIp: process.env.PUBLIC_IP,
                  
                }
              ],
              enableUdp: true,
              enableTcp: true,
              preferUdp: true,
              iceServers: WebRTCTransportConfig.iceServers
            }
      
           
            let transport:WebRtcTransport = await router.createWebRtcTransport(webRtcTransport_options);
            

            console.log(`transport id: ${transport.id}`)
      
            transport.on('dtlsstatechange', (dtlsState:mediasoup.types.DtlsState) => {
              if (dtlsState === 'closed') {
                transport.close()
              }
            })
      
            transport.on('@close', () => {
              console.log('transport closed')
            })
      
            resolve(transport)
      
          } catch (error) {
            reject(error)
          }
        })
    }


    changeRoomSetting(settings: ISetting,role:string){
      if(role == 'Moderator'){
        this.settings = settings;
      }else{
        throw new Error('Only Moderator change room setting');
      }
    }
}

export default manageRoomProcessor;