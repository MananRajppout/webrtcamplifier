
'use client'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import PermissionButton from '@/components/PermissionButtonComponent';
import useCheckPermission from '@/hooks/useCheckPermission'
import useWebRtcManage from '@/hooks/useWebrtcHook';
import RenderParticipants from '@/components/RenderParticipantsComponent';
import { PiMicrophone, PiMicrophoneSlash, PiVideoCameraSlash, PiVideoCamera, PiAirplay, PiGear, PiPhoneX, PiChats, PiAddressBook } from "react-icons/pi";
import { useSearchParams, useParams } from 'next/navigation';
import { MdOutlineDeblur } from "react-icons/md"
import RenderParticipantsAudio from '../RenderParticipantsAudio';

const OngoingMeeting = () => {
  const searchParams = useSearchParams();
  const params = useParams();
  const role = searchParams.get("role");
  const [breakRoomID, setRoomBreakID] = useState(null);
  const [fullName, setFullName] = useState(searchParams.get("fullName") || "Guest");
  const [roomId, setRoomId] = useState(params.id);
  const videoCanvasRef = useRef(null);
  const canvasRef = useRef(null);
  const [isMicMute, setIsMicMute] = useState(true);
  const [isWebCamMute, setIsWebCamMute] = useState(true);
  const [isBlur, setIsBlur] = useState(false);
  const [selected, setSelected] = useState(0);
  const [permissionOpen, setPermisstionOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [isScreenShare, setIsScreenShare] = useState(false);
  const [superForceRender, setSuperForceRender] = useState(0);
  const [sidebarOpen, setSideBarOpen] = useState(false);
  const [selectedSideBar, setSelectedSide] = useState('chat');
  const [showbtn, setshowbtn] = useState(false);


  const isMobile = false;

  const timeoutref = useRef(null);





  const handleJoinCallRef = useRef(false);
  const selectedVideoRef = useRef(null)


  const { audioPermisson, cameraPermisson } = useCheckPermission();
  const { handleJoin, participantsRef, videosElementsRef, audiosElementRef, socketIdRef, videoTrackRef, handleMuteUnmute, remoteVideoTracksRef, handleScreenShare, displayTrackRef } = useWebRtcManage(roomId, fullName, isWebCamMute, isMicMute, videoCanvasRef, canvasRef, isBlur, isScreenShare, setSuperForceRender, setPermisstionOpen, setIsScreenShare, setSelected, role);



  // on select video change
  useEffect(() => {

    const id = participantsRef.current[selected]?.socketId
    if (id && selectedVideoRef.current && remoteVideoTracksRef.current[id]) {
      selectedVideoRef.current.srcObject = new MediaStream([remoteVideoTracksRef.current[id]]);
      selectedVideoRef.current.play();
      return
    }


    if (id == socketIdRef.current && selectedVideoRef.current && displayTrackRef.current) {
      selectedVideoRef.current.srcObject = new MediaStream([displayTrackRef.current]);
      selectedVideoRef.current.play();
      return
    }

    if (id == socketIdRef.current && selectedVideoRef.current && videoTrackRef.current) {

      selectedVideoRef.current.srcObject = new MediaStream([videoTrackRef.current]);
      selectedVideoRef.current.play();
      return
    }






    const me = participantsRef.current[0]?.socketId


    if (me && selectedVideoRef.current && displayTrackRef.current) {
      selectedVideoRef.current.srcObject = new MediaStream([displayTrackRef.current]);
      selectedVideoRef.current.play();
      return
    }

    if (me && selectedVideoRef.current && videoTrackRef.current) {
      selectedVideoRef.current.srcObject = new MediaStream([videoTrackRef.current]);
      selectedVideoRef.current.play();
      return
    }




  }, [selected, videoTrackRef.current, remoteVideoTracksRef.current, participantsRef.current, displayTrackRef.current, superForceRender])




  useEffect(() => {
    // calling only one time this function
    if (!handleJoinCallRef.current) {
      handleJoin();
      handleJoinCallRef.current = true;
    }
  }, []);


  const handleVideoMute = useCallback(() => {


    if (!cameraPermisson) {
      setPermisstionOpen(true);
      return
    }

    if (isWebCamMute) {
      handleMuteUnmute(false, 'cam');
      setIsWebCamMute(false);
    } else {
      setIsScreenShare(false);
      handleScreenShare('unshare');
      setIsWebCamMute(true);
      handleMuteUnmute(true, 'cam');
    }
  }, [isWebCamMute, cameraPermisson])


  const handleMicMute = useCallback(() => {
    if (!audioPermisson) {
      setPermisstionOpen(true);
      return
    }
    if (isMicMute) {
      handleMuteUnmute(false, 'mic');
      setIsMicMute(false);
    } else {
      setIsMicMute(true);
      handleMuteUnmute(true, 'mic');
    }
  }, [isMicMute, audioPermisson])



  const shareScreen = useCallback(() => {
    if (isScreenShare) {
      setIsScreenShare(false);
      handleScreenShare('unshare');
    } else {
      handleScreenShare('share');
      setIsWebCamMute(true);
      setIsScreenShare(true)
    }
  }, [isScreenShare]);



  const handleClick = () => {
    setshowbtn(true);
    if (timeoutref.current) {

      clearTimeout(timeoutref.current)
    }
    timeoutref.current = setTimeout(() => setshowbtn(false), 3000)
  }



  useEffect(() => {

    // Check if the page has already been reloaded
    const hasReloaded = localStorage.getItem("hasReloaded");

    if (!hasReloaded) {
      // If not reloaded, reload the page and set the flag
      localStorage.setItem("hasReloaded", "true");
      window.location.reload();
    }
  }, []);



  return (
    <div className="md:block mt-5">
      <div
        className="rounded-md pb-10 h-[75vh] overflow-y-hidden"
        style={{ width: "100%", position: "relative" }}
      >
        <div className='section w-[100%] h-[70vh] overflow-hidden relative' onClick={handleClick}>

          <video ref={videoCanvasRef} style={{ display: "none" }}></video>
          <canvas ref={canvasRef} width={640} height={480} style={{ display: "none" }}></canvas>


          <div className={`flex flex-row h-[65vh] relative`}>
            <div className='flex flex-1 flex-col md:flex-row relative h-[65vh] '>
              {/* cards center  */}
              {
                participantsRef.current && participantsRef.current.filter(participant => (participant.isShareScreen == true)).length == 0 &&
                <>
                  {
                    participantsRef.current.length > 1 ?
                      <div className={`md:h-[65vh] h-[30vh] p-2 relative overflow-auto flex-wrap cursor-pointer  flex flex-row justify-center items-center  w-[100%] bg-[#3C3C3C]`}>
                        {
                          participantsRef.current.map((participant, index) => ({ ...participant, index })).filter(p => p.role.toLowerCase() != "observer").map((participant, index) => (
                            <RenderParticipants key={participant.socketId} onClick={() => setSelected(participant.index)} {...participant} videosElementsRef={videosElementsRef} audiosElementRef={audiosElementRef} socketIdRef={socketIdRef} videoTrackRef={videoTrackRef} index={participant.index} selected={selected} superForceRender={superForceRender} displayTrackRef={displayTrackRef} widthAuto={true} stream={remoteVideoTracksRef.current[participant.socketId]}/>
                          ))
                        }
                      </div>
                      :
                      <div className={`md:h-[65vh] h-[30vh] p-2 relative overflow-auto flex-wrap cursor-pointer  flex flex-row justify-center items-center  w-[100%] bg-[#3C3C3C]`}>
                        <h1 className='text-3xl font-semibold text-white z-10 select-none text-center'>{participantsRef.current[0]?.name}</h1>
                      </div>
                  }
                </>
              }

              {/* card left  */}
              {
                participantsRef.current && participantsRef.current.filter(participant => (participant.isShareScreen == true)).length > 0 &&
                <div className={`md:h-[65vh] h-[30vh] !p-2 relative overflow-y-auto cursor-pointer  flex flex-row justify-end items-end md:!flex-col md:gap-0 w-[100vw] md:w-[16vw] xl:w-[17vw] bg-[#3C3C3C]`}>
                  {
                    participantsRef.current.map((participant, index) => ({ ...participant, index })).filter(p => p.role.toLowerCase() != "observer").filter(participant => (participant.isShareScreen == true || participant.isWebCamMute == false)).map((participant, index) => (
                      <RenderParticipants key={participant.socketId} onClick={() => setSelected(participant.index)} {...participant} videosElementsRef={videosElementsRef} audiosElementRef={audiosElementRef} socketIdRef={socketIdRef} videoTrackRef={videoTrackRef} index={participant.index} selected={selected} superForceRender={superForceRender} displayTrackRef={displayTrackRef} widthAuto={false} stream={remoteVideoTracksRef.current[participant.socketId]}/>
                    ))
                  }
                </div>
              }


              {/* audios  */}
              {
                participantsRef.current && participantsRef.current.length > 0 &&
                <>
                  {
                    participantsRef.current.map((participant, index) => (
                      <RenderParticipantsAudio key={participant.socketId} {...participant} audiosElementRef={audiosElementRef} />
                    ))
                  }
                </>
              }

              <div className={`flex-1 w-full md:w-auto mx-auto my-auto ${isMobile && !showbtn ? 'h-[65vh]' : 'h-[65vh]'} `}>
                {

                  participantsRef.current && participantsRef.current.length > 0 && participantsRef.current[selected] &&
                  <div className={`w-full flex items-center justify-center ${isMobile && !showbtn ? 'h-[65vh]' : 'h-[65vh]'} bg-[#3C3C3C] text-white`} key={participantsRef.current[selected].socketId}>

                    <div className={`${(participantsRef.current[selected].isWebCamMute == false || participantsRef.current[selected].isShareScreen === true) ? 'block' : 'hidden'} w-full h-full`}>
                      <video ref={selectedVideoRef} autoPlay className='w-full h-full object-cover'> </video>
                    </div>
                  </div>
                }

                {
                  participantsRef.current && participantsRef.current.length > 0 && !participantsRef.current[selected] &&
                  <div className={`w-full  flex items-center justify-center ${isMobile && !showbtn ? 'h-[65vh]' : 'h-[65vh]'} bg-[#3C3C3C] text-white`} key={participantsRef.current[0].socketId}>
                    <div className={`${(participantsRef.current[0].isWebCamMute == false || participantsRef.current[0].isShareScreen === true) ? 'block' : 'hidden'} w-full h-full`}>
                      <video ref={selectedVideoRef} autoPlay className='w-full h-full object-cover'> </video>
                    </div>
                  </div>
                }
              </div>




            </div>

          </div>








          {/* controlls */}
          {
            role != "Observer" && (
              <div className={`${isMobile && !showbtn ? 'hidden' : 'block'} absolute bottom-0 left-0 right-0 bg-white`}>
                <div className='py-2 px-6 flex items-center  justify-center h-[10%]  gap-5'>



                  <div className='flex items-center gap-4'>
                    <PermissionButton permission={audioPermisson} onClick={handleMicMute} className={`title-notification-container ${isMicMute && audioPermisson ? 'bg-red-600 text-white' : 'bg-gray-200'}`}>
                      <span className='title-notification absolute -top-[2.5rem] left-[50%] -translate-x-[50%] bg-gray-700 text-white text-[12px] font-bold z-50 whitespace-pre px-2 rounded-sm uppercase'>{!audioPermisson ? 'Show more info' : isMicMute ? 'Turn on microphone' : 'Turn off microphone'}</span>
                      {isMicMute ? <PiMicrophoneSlash /> : <PiMicrophone />}
                    </PermissionButton>

                    <PermissionButton permission={cameraPermisson} onClick={handleVideoMute} className={`title-notification-container ${isWebCamMute && cameraPermisson ? 'bg-red-600 text-white' : 'bg-gray-200'}`}>
                      <span className='title-notification absolute -top-[2.5rem] left-[50%] -translate-x-[50%] bg-gray-700 text-white text-[12px] font-bold z-50 whitespace-pre px-2 rounded-sm uppercase'>{!cameraPermisson ? 'Show more info' : isWebCamMute ? 'Turn on video' : 'Turn off video'}</span>
                      {isWebCamMute ? <PiVideoCameraSlash /> : <PiVideoCamera />}
                    </PermissionButton>

                    <button className={`title-notification-container p-2 text-2xl rounded-full md:block hidden  relative ${isScreenShare ? 'bg-red-600 text-white' : 'bg-gray-200 text-black'}`} onClick={shareScreen}>
                      <span className='title-notification absolute -top-[2.5rem] left-[50%] -translate-x-[50%] bg-gray-700 text-white text-[12px] font-bold z-50 whitespace-pre px-2 rounded-sm uppercase'>{isScreenShare ? 'Stop presenting' : 'Present'}</span>
                      <PiAirplay />
                    </button>

                    <button className={`title-notification-container p-2 text-2xl rounded-full  relative ${isBlur ? 'bg-green-600 text-white' : 'bg-gray-200 text-black'}`} onClick={() => setIsBlur(prev => !prev)}>
                      <span className='title-notification absolute -top-[2.5rem] left-[50%] -translate-x-[50%] bg-gray-700 text-white text-[12px] font-bold z-50 whitespace-pre px-2 rounded-sm uppercase'>Settings</span>
                      <MdOutlineDeblur />
                    </button>



                    <a href="/" className='p-2 title-notification-container px-4 text-2xl rounded-full bg-red-600 text-white relative' title='Disconnect'>
                      <span className='title-notification absolute -top-[2.5rem] left-[50%] -translate-x-[50%] bg-gray-700 text-white text-[12px] font-bold z-50 whitespace-pre px-2 rounded-sm uppercase'>Disconnect</span>
                      <PiPhoneX />
                    </a>
                  </div>



                </div>
              </div>
            )
          }



        </div>

      </div>
    </div>
  );
};

export default OngoingMeeting;
