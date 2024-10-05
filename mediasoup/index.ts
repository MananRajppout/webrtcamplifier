import mediaServer from "./server/mediasoupServer.js";
const MPORT = process.env.MEDIASOUP_PORT || 4000;



mediaServer.listen(MPORT, () => {
    console.log(`Mediasoup Server Running on port ${MPORT}`)
});