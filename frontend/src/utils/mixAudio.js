const mixAudio = async (context,destination,stream) => {
    if (stream.getAudioTracks().length > 0 && destination) {
        context?.createMediaStreamSource(stream).connect(destination);
    }
}


export const addAudioTrackToStream = async (context,destination,track) => {
    if (track && destination) {
        const stream = new MediaStream([ track ]);

        mixAudio(context,destination,stream);
    }
}