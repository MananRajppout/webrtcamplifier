import React,{Dispatch, FC, MutableRefObject, SetStateAction, useEffect, useRef} from 'react'



const RenderParticipants = ({socketId,name,videosElementsRef,audiosElementRef,socketIdRef,videoTrackRef,isMicMute,isWebCamMute,onClick,index,selected,superForceRender,displayTrackRef,isShareScreen,role,widthAuto,stream}) => {
  const videoRef = useRef(null);
  // const audioRef = useRef(null);
  
  const setVideoRefs = (ref) => {   
    videoRef.current = ref; 
    if(ref){
      videosElementsRef.current[socketId] = ref; 
    }
  };


  useEffect(() => {
    if(stream){
      videoRef.current.srcObject = new MediaStream([stream]);
    }
  },[stream])

  useEffect(() => {
    console.log(videoRef.current && videoTrackRef.current,videoTrackRef.current,'ppppppp')
    if(socketIdRef.current == socketId){
      if(videoRef.current && displayTrackRef.current){
        videoRef.current.srcObject = new MediaStream([displayTrackRef.current])
        return
      }
      if(videoRef.current && videoTrackRef.current){
        videoRef.current.srcObject = new MediaStream([videoTrackRef.current])
        return
      }
    }
  },[socketId,socketIdRef.current,videoTrackRef.current,superForceRender])

  return (

    <div className={`w-[30rem] p-1 !m-2 md:mx-0 h-[10rem] ${widthAuto ? 'md:w-[20rem]' : 'md:w-[97%]'} md:h-[14rem] bg-[#242424] shadow-xl rounded-xl flex items-center justify-center relative`} onClick={onClick}>

        <video autoPlay ref={setVideoRefs} className={`absolute top left-0 right-0 bottom-0 rounded-xl object-cover z-0 w-full h-full ${!isWebCamMute ? 'block': 'hidden'}`}></video>
        
        <h1 className={`text-2xl font-semibold text-white z-10 select-none text-center`}>{name}</h1>
    
    </div>
  )
  
}

export default RenderParticipants