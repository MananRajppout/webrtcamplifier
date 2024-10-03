import mediaServer from "./server/mediasoupServer.js";
import chatServer from "./server/chatServer.js";

const MPORT = process.env.MEDIASOUP_PORT || 4000;
const CPORT = process.env.CHAT_PORT || 4001;


mediaServer.listen(MPORT, () => {
    console.log(`Mediasoup Server Running on port ${MPORT}`)
});
chatServer.listen(CPORT, () => {
    console.log(`Chat Server Running on port ${CPORT}`)
});