import React, { Dispatch, SetStateAction, useEffect, useState } from 'react'

// Browser detection function
function detectBrowser() {
  const userAgent = navigator.userAgent;
  if (userAgent.indexOf("Edg") > -1) {
    return "Microsoft Edge";
  } else if (userAgent.indexOf("Chrome") > -1) {
    return "Chrome";
  } else if (userAgent.indexOf("Firefox") > -1) {
    return "Firefox";
  } else if (userAgent.indexOf("Safari") > -1) {
    return "Safari";
  } else if (userAgent.indexOf("Opera") > -1) {
    return "Opera";
  } else if (userAgent.indexOf("Trident") > -1 || userAgent.indexOf("MSIE") > -1) {
    return "Internet Explorer";
  }
  return "Unknown";
}

const useCheckPermission = () => {
  const [cameraPermisson, setCameraPermission] = useState(false);
  const [audioPermisson, setAudioPermission] = useState(false);
  const [cameraPermissonStatus, setCameraPermissionStatus] = useState('prompt');
  const [audioPermissonStatus, setAudioPermissionStatus] = useState('prompt');



  function setPermission(permissionStatus, setPermissionState, setPermissionStatusState) {
    if (permissionStatus.state === 'granted') {
      setPermissionState(true);
    } else if (permissionStatus.state === 'denied') {
      setPermissionState(false);
    } else if (permissionStatus.state === 'prompt') {
      setPermissionState(false);
    }
  }

  async function checkCameraPermission(name, setPermissionState, setPermissionStatusState) {
    const browser = detectBrowser();
    if (browser == 'Chrome') {
      try {
        // Check the status of the camera permission
        const permissionStatus = await window.navigator.permissions.query({ name });

        setPermission(permissionStatus, setPermissionState, setPermissionStatusState)

        // Optional: Listen for changes in permission status
        permissionStatus.onchange = () => {
          setPermission(permissionStatus, setPermissionState, setPermissionStatusState);
        };
      } catch (error) {
        console.error('Error checking camera permission:', error);
      }
    }else{
   
      try {
        if(name == 'camera'){
          const devices = await navigator.mediaDevices.enumerateDevices();
          const videoInput = devices.find(device => device.kind === 'videoinput');
          await navigator.mediaDevices.getUserMedia({video: {deviceId: videoInput?.deviceId}});
        }else{
          const devices = await navigator.mediaDevices.enumerateDevices();
          const audioInput = devices.find(device => device.kind === 'audioinput');
          await navigator.mediaDevices.getUserMedia({audio: {deviceId: audioInput?.deviceId }})
        }
        const permissionStatus = {
          state: 'granted'
        }
        setPermission(permissionStatus, setPermissionState, setPermissionStatusState);
        console.log('permission','granted',name)
      } catch (error) {
        console.log('permission','denied',name,error)
        const permissionStatus = {
          state: 'denied'
        }
      
        setPermission(permissionStatus, setPermissionState, setPermissionStatusState);
      }
    }

  }

  useEffect(() => {
    
    checkCameraPermission('camera', setCameraPermission, setCameraPermissionStatus);
    checkCameraPermission('microphone', setAudioPermission, setAudioPermissionStatus);
  }, [])
  return { cameraPermisson, audioPermisson, cameraPermissonStatus, audioPermissonStatus }

}

export default useCheckPermission;