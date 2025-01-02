import React, { useRef } from 'react'

const RenderParticipantsAudio = ({socketId,audiosElementRef,email}) => {
    const audioRef = useRef(null);
    const setAudioRefs = (ref) => {   
        audioRef.current = ref; 
        if(ref){
          audiosElementRef.current[socketId] = ref; 
        }
      };
  return (
    <audio ref={setAudioRefs} autoPlay id={email}></audio>
  )
}

export default RenderParticipantsAudio