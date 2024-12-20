
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
import RenderSingleAndDoubleParticipants from '../RenderSingleAndDoubleParticipant';



const OngoingMeeting = () => {
  const searchParams = useSearchParams();
  const params = useParams();
  const role = searchParams.get("role");
  const type = searchParams.get('type') || 'main';
  const roomname = searchParams.get('roomname') || null;
  const [breakRoomID, setRoomBreakID] = useState(null);
  const [fullName, setFullName] = useState(searchParams.get("fullName") || "Guest");
  const [roomId, setRoomId] = useState(type == 'breackout' ? `${params.id}-${roomname}` : params.id);
  const videoCanvasRef = useRef(null);
  const canvasRef = useRef(null);
  const [isMicMute, setIsMicMute] = useState(false);
  const [isWebCamMute, setIsWebCamMute] = useState(false);
  const [isBlur, setIsBlur] = useState(false);
  const [selected, setSelected] = useState(0);
  const [permissionOpen, setPermisstionOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [isScreenShare, setIsScreenShare] = useState(false);
  const [superForceRender, setSuperForceRender] = useState(0);
  const [sidebarOpen, setSideBarOpen] = useState(false);
  const [selectedSideBar, setSelectedSide] = useState('chat');
  const [showbtn, setshowbtn] = useState(false);
  const [settingOpen, setSettingOpen] = useState(false);
  const [setting, setSetting] = useState({
    allowScreenShare: false,
  });


  const isMobile = false;

  const timeoutref = useRef(null);
  const localVideoElementRef = useRef(null);




  const handleJoinCallRef = useRef(false);
  const selectedVideoRef = useRef(null)


  const { audioPermisson, cameraPermisson } = useCheckPermission();
  const { handleJoin, participantsRef, videosElementsRef, audiosElementRef, socketIdRef, videoTrackRef, handleMuteUnmute, remoteVideoTracksRef, handleScreenShare, displayTrackRef, remoteDisplayTracksRef, handleChangeSetting } = useWebRtcManage(roomId, fullName, isWebCamMute, isMicMute, videoCanvasRef, canvasRef, isBlur, isScreenShare, setSuperForceRender, setPermisstionOpen, setIsScreenShare, setSelected, role, setting, setSetting);



  // on select video change
  useEffect(() => {

    const id = participantsRef.current[selected]?.socketId
    // if (id && selectedVideoRef.current && remoteVideoTracksRef.current[id]) {
    //   selectedVideoRef.current.srcObject = new MediaStream([remoteVideoTracksRef.current[id]]);
    //   selectedVideoRef.current.play();
    //   return
    // }
    if (id && selectedVideoRef.current && remoteDisplayTracksRef.current[id]) {
      selectedVideoRef.current.srcObject = new MediaStream([remoteDisplayTracksRef.current[id]]);
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




  }, [selected, videoTrackRef.current, remoteVideoTracksRef.current, participantsRef.current, displayTrackRef.current, superForceRender, remoteDisplayTracksRef])


  useEffect(() => {
    if (localVideoElementRef.current && videoTrackRef.current) {
      localVideoElementRef.current.srcObject = new MediaStream([videoTrackRef.current]);
      localVideoElementRef.current.play();
    }
  }, [videoTrackRef.current,participantsRef.current]);


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

  const handleClickOytside = useCallback(() => {
    if (setChatOpen) {
      setSettingOpen(false)
    }
  }, [settingOpen]);

  const handleAllowScreen = useCallback(() => {
    if (setting.allowScreenShare) {
      setSetting(prev => ({ ...prev, allowScreenShare: false }))
      handleChangeSetting({ setting, allowScreenShare: false })
    } else {
      setSetting(prev => ({ ...prev, allowScreenShare: true }));
      handleChangeSetting({ setting, allowScreenShare: true });
    }
  }, [setting])



  return (
    <div className="md:block mt-1">
      <div
        className="rounded-md pb-10 h-[75vh] overflow-y-hidden"
        style={{ width: "100%", position: "relative" }}
      >
        <div className='section w-[100%] h-[74vh] overflow-hidden relative' onClick={handleClick}>

          <video ref={videoCanvasRef} style={{ display: "none" }}></video>
          <canvas ref={canvasRef} width={640} height={480} style={{ display: "none" }}></canvas>


          <div className={`flex flex-row h-[68vh] relative`}>
            <div className='flex flex-1 flex-col md:flex-row relative h-[68vh] '>
              {/* cards center  */}
              {
                participantsRef.current && participantsRef.current.filter(participant => (participant.isShareScreen == true)).length == 0 &&
                <>
                  {
                    participantsRef.current?.length > 1 ?

                      <>
                        {
                          participantsRef.current?.filter(p => p.role.toLowerCase() != "observer").filter(participant => (participant.isShareScreen == true || participant.isWebCamMute == false)).length == 0 ?
                            (
                              //when no one share camera
                              <div className={`md:h-[68vh] h-[30vh] relative overflow-auto flex-wrap cursor-pointer  flex flex-row justify-start items-end p-5  w-[100%] bg-[#3C3C3C]`}>
                                <div className={`${(participantsRef.current[0]?.isWebCamMute == false || participantsRef.current[0]?.isShareScreen === true) ? 'block' : 'hidden'} w-full h-full absolute top-0 left-0 right-0 bottom-0`}>
                                  <video autoPlay className='w-full h-full object-cover' ref={localVideoElementRef}> </video>
                                </div>
                                <h1 className='text-3xl font-medium text-white z-10 select-none text-center mb-3'>{participantsRef.current[0]?.name}</h1>
                              </div>
                            ) : participantsRef.current?.filter(p => p.role.toLowerCase() != "observer").filter(participant => (participant.isShareScreen == true || participant.isWebCamMute == false)).length == 1 ?
                              // when one user share camera
                              (
                                <div className={`md:h-[68vh] h-[30vh] p-2 relative overflow-auto grid grid-cols-1  w-[100%] bg-[#3C3C3C]`}>
                                  {
                                    participantsRef.current.map((participant, index) => ({ ...participant, index })).filter(p => p.role.toLowerCase() != "observer").filter(participant => (participant.isShareScreen == true || participant.isWebCamMute == false)).map((participant, index) => (
                                      <RenderSingleAndDoubleParticipants key={participant.socketId} onClick={() => setSelected(participant.index)} {...participant} videosElementsRef={videosElementsRef} audiosElementRef={audiosElementRef} socketIdRef={socketIdRef} videoTrackRef={videoTrackRef} index={participant.index} selected={selected} superForceRender={superForceRender} displayTrackRef={displayTrackRef} widthAuto={true} stream={remoteVideoTracksRef.current[participant.socketId]} />
                                    ))
                                  }
                                </div>
                              ) : (participantsRef.current?.filter(p => p.role.toLowerCase() != "observer").filter(participant => (participant.isShareScreen == true || participant.isWebCamMute == false)).length == 2 ||
                                participantsRef.current?.filter(p => p.role.toLowerCase() != "observer").filter(participant => (participant.isShareScreen == true || participant.isWebCamMute == false)).length == 4) ?
                                (
                                  // when 2 and 3 user share camera
                                  <div className={`md:h-[68vh] h-[30vh] p-2 relative overflow-auto grid grid-cols-2 gap-4  w-[100%] bg-[#3C3C3C]`}>
                                    {
                                      participantsRef.current.map((participant, index) => ({ ...participant, index })).filter(p => p.role.toLowerCase() != "observer").filter(participant => (participant.isShareScreen == true || participant.isWebCamMute == false)).map((participant, index) => (
                                        <RenderSingleAndDoubleParticipants key={participant.socketId} onClick={() => setSelected(participant.index)} {...participant} videosElementsRef={videosElementsRef} audiosElementRef={audiosElementRef} socketIdRef={socketIdRef} videoTrackRef={videoTrackRef} index={participant.index} selected={selected} superForceRender={superForceRender} displayTrackRef={displayTrackRef} widthAuto={true} stream={remoteVideoTracksRef.current[participant.socketId]} />
                                      ))
                                    }
                                  </div>
                                ) : (participantsRef.current?.filter(p => p.role.toLowerCase() != "observer").filter(participant => (participant.isShareScreen == true || participant.isWebCamMute == false)).length == 3 ||
                                  participantsRef.current?.filter(p => p.role.toLowerCase() != "observer").filter(participant => (participant.isShareScreen == true || participant.isWebCamMute == false)).length == 5 ||
                                  participantsRef.current?.filter(p => p.role.toLowerCase() != "observer").filter(participant => (participant.isShareScreen == true || participant.isWebCamMute == false)).length == 6) ?

                                  (
                                    <div className={`md:h-[68vh] h-[30vh] p-2 relative overflow-auto grid grid-cols-3 gap-4  w-[100%] bg-[#3C3C3C]`}>
                                      {
                                        participantsRef.current.map((participant, index) => ({ ...participant, index })).filter(p => p.role.toLowerCase() != "observer").filter(participant => (participant.isShareScreen == true || participant.isWebCamMute == false)).map((participant, index) => (
                                          <RenderSingleAndDoubleParticipants key={participant.socketId} onClick={() => setSelected(participant.index)} {...participant} videosElementsRef={videosElementsRef} audiosElementRef={audiosElementRef} socketIdRef={socketIdRef} videoTrackRef={videoTrackRef} index={participant.index} selected={selected} superForceRender={superForceRender} displayTrackRef={displayTrackRef} widthAuto={true} stream={remoteVideoTracksRef.current[participant.socketId]} />
                                        ))
                                      }
                                    </div>
                                  ) : (participantsRef.current?.filter(p => p.role.toLowerCase() != "observer").filter(participant => (participant.isShareScreen == true || participant.isWebCamMute == false)).length == 7 ||
                                    participantsRef.current?.filter(p => p.role.toLowerCase() != "observer").filter(participant => (participant.isShareScreen == true || participant.isWebCamMute == false)).length == 8) ?
                                    (
                                      <div className={`md:h-[68vh] h-[30vh] p-2 relative overflow-auto grid grid-cols-4 gap-4  w-[100%] bg-[#3C3C3C]`}>
                                        {
                                          participantsRef.current.map((participant, index) => ({ ...participant, index })).filter(p => p.role.toLowerCase() != "observer").filter(participant => (participant.isShareScreen == true || participant.isWebCamMute == false)).map((participant, index) => (
                                            <RenderSingleAndDoubleParticipants key={participant.socketId} onClick={() => setSelected(participant.index)} {...participant} videosElementsRef={videosElementsRef} audiosElementRef={audiosElementRef} socketIdRef={socketIdRef} videoTrackRef={videoTrackRef} index={participant.index} selected={selected} superForceRender={superForceRender} displayTrackRef={displayTrackRef} widthAuto={true} stream={remoteVideoTracksRef.current[participant.socketId]} />
                                          ))
                                        }
                                      </div>
                                    ) :
                                    (participantsRef.current?.filter(p => p.role.toLowerCase() != "observer").filter(participant => (participant.isShareScreen == true || participant.isWebCamMute == false)).length == 9 ||
                                      participantsRef.current?.filter(p => p.role.toLowerCase() != "observer").filter(participant => (participant.isShareScreen == true || participant.isWebCamMute == false)).length == 10) ?
                                      (
                                        <div className={`md:h-[68vh] h-[30vh] p-2 relative overflow-auto grid grid-cols-5 gap-4  w-[100%] bg-[#3C3C3C]`}>
                                          {
                                            participantsRef.current.map((participant, index) => ({ ...participant, index })).filter(p => p.role.toLowerCase() != "observer").filter(participant => (participant.isShareScreen == true || participant.isWebCamMute == false)).map((participant, index) => (
                                              <RenderSingleAndDoubleParticipants key={participant.socketId} onClick={() => setSelected(participant.index)} {...participant} videosElementsRef={videosElementsRef} audiosElementRef={audiosElementRef} socketIdRef={socketIdRef} videoTrackRef={videoTrackRef} index={participant.index} selected={selected} superForceRender={superForceRender} displayTrackRef={displayTrackRef} widthAuto={true} stream={remoteVideoTracksRef.current[participant.socketId]} />
                                            ))
                                          }
                                        </div>
                                      ) :
                                      (participantsRef.current?.filter(p => p.role.toLowerCase() != "observer").filter(participant => (participant.isShareScreen == true || participant.isWebCamMute == false)).length == 11 ||
                                        participantsRef.current?.filter(p => p.role.toLowerCase() != "observer").filter(participant => (participant.isShareScreen == true || participant.isWebCamMute == false)).length == 12) ?
                                        (
                                          <div className={`md:h-[68vh] h-[30vh] p-2 relative overflow-auto grid grid-cols-6 gap-4  w-[100%] bg-[#3C3C3C]`}>
                                            {
                                              participantsRef.current.map((participant, index) => ({ ...participant, index })).filter(p => p.role.toLowerCase() != "observer").filter(participant => (participant.isShareScreen == true || participant.isWebCamMute == false)).map((participant, index) => (
                                                <RenderSingleAndDoubleParticipants key={participant.socketId} onClick={() => setSelected(participant.index)} {...participant} videosElementsRef={videosElementsRef} audiosElementRef={audiosElementRef} socketIdRef={socketIdRef} videoTrackRef={videoTrackRef} index={participant.index} selected={selected} superForceRender={superForceRender} displayTrackRef={displayTrackRef} widthAuto={true} stream={remoteVideoTracksRef.current[participant.socketId]} />
                                              ))
                                            }
                                          </div>
                                        ) :

                                        (participantsRef.current?.filter(p => p.role.toLowerCase() != "observer").filter(participant => (participant.isShareScreen == true || participant.isWebCamMute == false)).length == 13 ||
                                          participantsRef.current?.filter(p => p.role.toLowerCase() != "observer").filter(participant => (participant.isShareScreen == true || participant.isWebCamMute == false)).length == 14) ?
                                          (
                                            <div className={`md:h-[68vh] h-[30vh] p-2 relative overflow-auto grid grid-cols-7 gap-4  w-[100%] bg-[#3C3C3C]`}>
                                              {
                                                participantsRef.current.map((participant, index) => ({ ...participant, index })).filter(p => p.role.toLowerCase() != "observer").filter(participant => (participant.isShareScreen == true || participant.isWebCamMute == false)).map((participant, index) => (
                                                  <RenderSingleAndDoubleParticipants key={participant.socketId} onClick={() => setSelected(participant.index)} {...participant} videosElementsRef={videosElementsRef} audiosElementRef={audiosElementRef} socketIdRef={socketIdRef} videoTrackRef={videoTrackRef} index={participant.index} selected={selected} superForceRender={superForceRender} displayTrackRef={displayTrackRef} widthAuto={true} stream={remoteVideoTracksRef.current[participant.socketId]} />
                                                ))
                                              }
                                            </div>
                                          ) :

                                          (participantsRef.current?.filter(p => p.role.toLowerCase() != "observer").filter(participant => (participant.isShareScreen == true || participant.isWebCamMute == false)).length == 15 ||
                                            participantsRef.current?.filter(p => p.role.toLowerCase() != "observer").filter(participant => (participant.isShareScreen == true || participant.isWebCamMute == false)).length == 16) ?
                                            (
                                              <div className={`md:h-[68vh] h-[30vh] p-2 relative overflow-auto grid grid-cols-8 gap-4  w-[100%] bg-[#3C3C3C]`}>
                                                {
                                                  participantsRef.current.map((participant, index) => ({ ...participant, index })).filter(p => p.role.toLowerCase() != "observer").filter(participant => (participant.isShareScreen == true || participant.isWebCamMute == false)).map((participant, index) => (
                                                    <RenderSingleAndDoubleParticipants key={participant.socketId} onClick={() => setSelected(participant.index)} {...participant} videosElementsRef={videosElementsRef} audiosElementRef={audiosElementRef} socketIdRef={socketIdRef} videoTrackRef={videoTrackRef} index={participant.index} selected={selected} superForceRender={superForceRender} displayTrackRef={displayTrackRef} widthAuto={true} stream={remoteVideoTracksRef.current[participant.socketId]} />
                                                  ))
                                                }
                                              </div>
                                            ) :

                                            (participantsRef.current?.filter(p => p.role.toLowerCase() != "observer").filter(participant => (participant.isShareScreen == true || participant.isWebCamMute == false)).length == 17 ||
                                              participantsRef.current?.filter(p => p.role.toLowerCase() != "observer").filter(participant => (participant.isShareScreen == true || participant.isWebCamMute == false)).length == 18) ?
                                              (
                                                <div className={`md:h-[68vh] h-[30vh] p-2 relative overflow-auto grid grid-cols-9 gap-4  w-[100%] bg-[#3C3C3C]`}>
                                                  {
                                                    participantsRef.current.map((participant, index) => ({ ...participant, index })).filter(p => p.role.toLowerCase() != "observer").filter(participant => (participant.isShareScreen == true || participant.isWebCamMute == false)).map((participant, index) => (
                                                      <RenderSingleAndDoubleParticipants key={participant.socketId} onClick={() => setSelected(participant.index)} {...participant} videosElementsRef={videosElementsRef} audiosElementRef={audiosElementRef} socketIdRef={socketIdRef} videoTrackRef={videoTrackRef} index={participant.index} selected={selected} superForceRender={superForceRender} displayTrackRef={displayTrackRef} widthAuto={true} stream={remoteVideoTracksRef.current[participant.socketId]} />
                                                    ))
                                                  }
                                                </div>
                                              ) :

                                              (participantsRef.current?.filter(p => p.role.toLowerCase() != "observer").filter(participant => (participant.isShareScreen == true || participant.isWebCamMute == false)).length == 19 ||
                                                participantsRef.current?.filter(p => p.role.toLowerCase() != "observer").filter(participant => (participant.isShareScreen == true || participant.isWebCamMute == false)).length == 20) ?
                                                (
                                                  <div className={`md:h-[68vh] h-[30vh] p-2 relative overflow-auto grid grid-cols-10 gap-4  w-[100%] bg-[#3C3C3C]`}>
                                                    {
                                                      participantsRef.current.map((participant, index) => ({ ...participant, index })).filter(p => p.role.toLowerCase() != "observer").filter(participant => (participant.isShareScreen == true || participant.isWebCamMute == false)).map((participant, index) => (
                                                        <RenderSingleAndDoubleParticipants key={participant.socketId} onClick={() => setSelected(participant.index)} {...participant} videosElementsRef={videosElementsRef} audiosElementRef={audiosElementRef} socketIdRef={socketIdRef} videoTrackRef={videoTrackRef} index={participant.index} selected={selected} superForceRender={superForceRender} displayTrackRef={displayTrackRef} widthAuto={true} stream={remoteVideoTracksRef.current[participant.socketId]} />
                                                      ))
                                                    }
                                                  </div>
                                                ) :

                                                (participantsRef.current?.filter(p => p.role.toLowerCase() != "observer").filter(participant => (participant.isShareScreen == true || participant.isWebCamMute == false)).length == 21 ||
                                                  participantsRef.current?.filter(p => p.role.toLowerCase() != "observer").filter(participant => (participant.isShareScreen == true || participant.isWebCamMute == false)).length == 22) ?
                                                  (
                                                    <div className={`md:h-[68vh] h-[30vh] p-2 relative overflow-auto grid grid-cols-11 gap-4  w-[100%] bg-[#3C3C3C]`}>
                                                      {
                                                        participantsRef.current.map((participant, index) => ({ ...participant, index })).filter(p => p.role.toLowerCase() != "observer").filter(participant => (participant.isShareScreen == true || participant.isWebCamMute == false)).map((participant, index) => (
                                                          <RenderSingleAndDoubleParticipants key={participant.socketId} onClick={() => setSelected(participant.index)} {...participant} videosElementsRef={videosElementsRef} audiosElementRef={audiosElementRef} socketIdRef={socketIdRef} videoTrackRef={videoTrackRef} index={participant.index} selected={selected} superForceRender={superForceRender} displayTrackRef={displayTrackRef} widthAuto={true} stream={remoteVideoTracksRef.current[participant.socketId]} />
                                                        ))
                                                      }
                                                    </div>
                                                  ) :

                                                  (participantsRef.current?.filter(p => p.role.toLowerCase() != "observer").filter(participant => (participant.isShareScreen == true || participant.isWebCamMute == false)).length == 23 ||
                                                    participantsRef.current?.filter(p => p.role.toLowerCase() != "observer").filter(participant => (participant.isShareScreen == true || participant.isWebCamMute == false)).length == 24) ?
                                                    (
                                                      <div className={`md:h-[68vh] h-[30vh] p-2 relative overflow-auto grid grid-cols-12 gap-4  w-[100%] bg-[#3C3C3C]`}>
                                                        {
                                                          participantsRef.current.map((participant, index) => ({ ...participant, index })).filter(p => p.role.toLowerCase() != "observer").filter(participant => (participant.isShareScreen == true || participant.isWebCamMute == false)).map((participant, index) => (
                                                            <RenderSingleAndDoubleParticipants key={participant.socketId} onClick={() => setSelected(participant.index)} {...participant} videosElementsRef={videosElementsRef} audiosElementRef={audiosElementRef} socketIdRef={socketIdRef} videoTrackRef={videoTrackRef} index={participant.index} selected={selected} superForceRender={superForceRender} displayTrackRef={displayTrackRef} widthAuto={true} stream={remoteVideoTracksRef.current[participant.socketId]} />
                                                          ))
                                                        }
                                                      </div>
                                                    ) :

                                                    (
                                                      <div className={`md:h-[68vh] h-[30vh] p-2 relative overflow-auto flex-wrap cursor-pointer  flex flex-row justify-center items-center  w-[100%] bg-[#3C3C3C]`}>
                                                        {
                                                          participantsRef.current.map((participant, index) => ({ ...participant, index })).filter(p => p.role.toLowerCase() != "observer").filter(participant => (participant.isShareScreen == true || participant.isWebCamMute == false)).map((participant, index) => (
                                                            <RenderParticipants key={participant.socketId} onClick={() => setSelected(participant.index)} {...participant} videosElementsRef={videosElementsRef} audiosElementRef={audiosElementRef} socketIdRef={socketIdRef} videoTrackRef={videoTrackRef} index={participant.index} selected={selected} superForceRender={superForceRender} displayTrackRef={displayTrackRef} widthAuto={true} stream={remoteVideoTracksRef.current[participant.socketId]} />
                                                          ))
                                                        }
                                                      </div>
                                                    )
                        }
                      </>
                      :

                      // when only one user in meet 
                      <div className={`md:h-[68vh] h-[30vh] relative overflow-auto flex-wrap cursor-pointer  flex flex-row justify-start items-end p-5  w-[100%] bg-[#3C3C3C]`}>
                        <div className={`${(participantsRef.current[0]?.isWebCamMute == false || participantsRef.current[0]?.isShareScreen === true) ? 'block' : 'hidden'} w-full h-full absolute top-0 left-0 right-0 bottom-0`}>
                          <video autoPlay className='w-full h-full object-cover' ref={localVideoElementRef}> </video>
                        </div>
                        <h1 className='text-3xl font-medium text-white z-10 select-none text-center mb-3'>{participantsRef.current[0]?.name}</h1>
                      </div>
                  }
                </>
              }

              {/* card left  */}
              {
                participantsRef.current && participantsRef.current.filter(participant => (participant.isShareScreen == true)).length > 0 &&
                <div className={`md:h-[68vh] h-[30vh] !p-2 relative overflow-y-auto cursor-pointer  flex flex-row justify-end items-end md:!flex-col md:gap-0 w-[100vw] md:w-[16vw] xl:w-[17vw] bg-[#3C3C3C]`}>
                  {
                    participantsRef.current.map((participant, index) => ({ ...participant, index })).filter(p => p.role.toLowerCase() != "observer").filter(participant => (participant.isShareScreen == true || participant.isWebCamMute == false)).map((participant, index) => (
                      <RenderParticipants key={participant.socketId} onClick={() => setSelected(participant.index)} {...participant} videosElementsRef={videosElementsRef} audiosElementRef={audiosElementRef} socketIdRef={socketIdRef} videoTrackRef={videoTrackRef} index={participant.index} selected={selected} superForceRender={superForceRender} displayTrackRef={displayTrackRef} widthAuto={false} stream={remoteVideoTracksRef.current[participant.socketId]} />
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

              <div className={`flex-1 w-full md:w-auto mx-auto my-auto ${isMobile && !showbtn ? 'h-[68vh]' : 'h-[68vh]'} `}>
                {

                  participantsRef.current && participantsRef.current.length > 0 && participantsRef.current[selected] &&
                  <div className={`w-full flex items-center justify-center ${isMobile && !showbtn ? 'h-[68vh]' : 'h-[68vh]'} bg-[#3C3C3C] text-white`} key={participantsRef.current[selected].socketId}>

                    <div className={`${(participantsRef.current[selected].isWebCamMute == false || participantsRef.current[selected].isShareScreen === true) ? 'block' : 'hidden'} w-full h-full`}>
                      <video ref={selectedVideoRef} autoPlay className='w-full h-full object-contain'> </video>
                    </div>
                  </div>
                }

                {
                  participantsRef.current && participantsRef.current.length > 0 && !participantsRef.current[selected] &&
                  <div className={`w-full  flex items-center justify-center ${isMobile && !showbtn ? 'h-[68vh]' : 'h-[68vh]'} bg-[#3C3C3C] text-white`} key={participantsRef.current[0].socketId}>
                    <div className={`${(participantsRef.current[0].isWebCamMute == false || participantsRef.current[0].isShareScreen === true) ? 'block' : 'hidden'} w-full h-full`}>
                      <video ref={selectedVideoRef} autoPlay className='w-full h-full object-contain'> </video>
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

                    {
                      (setting.allowScreenShare || role == 'Moderator') &&
                      <button className={`title-notification-container p-2 text-2xl rounded-full md:block hidden  relative ${isScreenShare ? 'bg-red-600 text-white' : 'bg-gray-200 text-black'}`} onClick={shareScreen}>
                        <span className='title-notification absolute -top-[2.5rem] left-[50%] -translate-x-[50%] bg-gray-700 text-white text-[12px] font-bold z-50 whitespace-pre px-2 rounded-sm uppercase'>{isScreenShare ? 'Stop presenting' : 'Present'}</span>
                        <PiAirplay />
                      </button>
                    }

                    <button className={`title-notification-container p-2 text-2xl rounded-full  relative ${isBlur ? 'bg-green-600 text-white' : 'bg-gray-200 text-black'}`} onClick={() => setIsBlur(prev => !prev)}>
                      <span className='title-notification absolute -top-[2.5rem] left-[50%] -translate-x-[50%] bg-gray-700 text-white text-[12px] font-bold z-50 whitespace-pre px-2 rounded-sm uppercase'>Blur Background</span>
                      <MdOutlineDeblur />
                    </button>





                    {
                      settingOpen &&
                      <div className='absolute -top-[21rem] left-[60%] bg-gray-800 text-white z-50  rounded-md w-[15rem] h-[20rem] overflow-y-auto'>
                        <ul className='space-x-4 p-2'>
                          <li className='flex items-center gap-3'>
                            <input type='checkbox' checked={setting.allowScreenShare} onClick={handleAllowScreen} />
                            <p className='text-white text-xs text-left'>Allow participants to share their screen.</p>
                          </li>
                        </ul>
                      </div>
                    }

                    {
                      role == 'Moderator' &&
                      <button className={`title-notification-container p-2 text-2xl rounded-full  relative bg-gray-200 text-black`} onClick={() => setSettingOpen((p) => !p)}>
                        <span className='title-notification absolute -top-[2.5rem] left-[50%] -translate-x-[50%] py-2 bg-gray-700 text-white text-[12px] font-bold z-50 whitespace-pre px-2 rounded-sm uppercase'>Setting</span>




                        <PiGear />
                      </button>
                    }



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
