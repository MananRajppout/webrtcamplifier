import { MutableRefObject } from "react";
import * as bodySegmentation from "@tensorflow-models/body-segmentation";
import "@tensorflow/tfjs-backend-webgl";



class MediaModel {
    audioTrack;
    videoTrack;
    videoCanvasRef;
    canvasRef
    isBlur;
    segmenter = null;
    canvasTrac = null;
    displayMedia = null;

   constructor(videoCanvasRef,canvasRef,isBlur){
    this.audioTrack = null;
    this.videoTrack = null;
    this.videoCanvasRef = videoCanvasRef;
    this.canvasRef = canvasRef;
    this.isBlur = isBlur
    this.initSegmenter();
    
   }


   

   async getUserMedia(){
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInput = devices.find(device => device.kind === 'videoinput');

        const videoTrack = await this.getVideoTrack(videoInput?.deviceId);
        const audioTrack = await this.getAudioTrack();
        
        return [videoTrack,audioTrack]
    } catch (error) {
        console.log('errror while getting media: ',error.message );
        return [null,null]
    }
   
   }



  async getAudioTrack(){
      try {
        const stream = await window.navigator.mediaDevices.getUserMedia({
            audio: true,
        });

        this.audioTrack = stream.getAudioTracks()[0]
        return this.audioTrack;
      } catch (error) {
        this.audioTrack = null
        return this.audioTrack
      }
   }


    async getVideoTrack(deviceId= null){
      try {
        let stream;
        if(deviceId){
          stream= await window.navigator.mediaDevices.getUserMedia({
              video: {
                deviceId:deviceId,
                width: {
                  min: 640,
                  max: 1920,
                },
                height: {
                  min: 400,
                  max: 1080,
                }
              }
          });
        }else{
          stream= await window.navigator.mediaDevices.getUserMedia({
            video: {
              width: {
                min: 640,
                max: 1920,
              },
              height: {
                min: 400,
                max: 1080,
              }
            }
        });
        }
        




        this.videoTrack = stream.getVideoTracks()[0]
        
        if (this.videoCanvasRef.current) {
          this.videoCanvasRef.current.srcObject = new MediaStream([this.videoTrack]);
          this.videoCanvasRef.current.onloadedmetadata = async () => {
            // Ensure the video is ready to play before processing frames
            await this.videoCanvasRef.current?.play();
  
            // Start the blurring process once the video is ready
            if (this.segmenter) {
              this.blurBackground(this.segmenter, this.isBlur ? 10 : 0);
            }
          };
        }

        if(this.canvasRef.current){

          const stream = this.canvasRef.current?.captureStream(30);
          const tracks = stream.getVideoTracks();
          this.canvasTrack = tracks[0];
          return this.canvasTrack
        }

        return this.videoTrack;


      } catch (error) {
        this.videoTrack = null
        return this.videoTrack;
      }
    }



    async getDisplayTrack(){
      try {
        const stream = await window.navigator.mediaDevices.getDisplayMedia({
         video: {
          width:{ideal: 1920},
          height: {ideal: 1080},
          frameRate: {ideal: 30}
         }
        });

        this.displayMedia = stream.getVideoTracks()[0]
        return this.displayMedia;
      } catch (error) {
        this.displayMedia = null
        return this.displayMedia
      }
   }


  async initSegmenter  () {
    if (this.segmenter) return;

    const model = bodySegmentation.SupportedModels.MediaPipeSelfieSegmentation;
    const segmenterConfig = {
      runtime: "mediapipe",
      solutionPath: "https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation",
      modelType: "general",
    };

    const newSegmenter = await bodySegmentation.createSegmenter(model, segmenterConfig);
    this.segmenter = newSegmenter;
   };


   async blurBackground (segmenter,blurAmount){
    const foregroundThreshold = 0.5;
    const edgeBlurAmount = 3;
    const flipHorizontal = false;
    const context = this.canvasRef.current?.getContext("2d");

    const processFrame = async () => {
      if (context && this.videoCanvasRef.current && this.canvasRef.current) {
        context.drawImage(this.videoCanvasRef.current, 0, 0, 640, 480);

        await bodySegmentation.drawBokehEffect(
          this.canvasRef.current,
          this.videoCanvasRef.current,
          await segmenter.segmentPeople(this.videoCanvasRef.current),
          foregroundThreshold,
          blurAmount,
          edgeBlurAmount,
          flipHorizontal
        );

        requestAnimationFrame(processFrame);
      }
    };

    requestAnimationFrame(processFrame);
  };

  async removeBackground(segmenter) {
    const context = this.canvasRef.current?.getContext("2d");

    const processFrame = async () => {
      if (context && this.videoCanvasRef.current && this.canvasRef.current) {
        context.drawImage(this.videoCanvasRef.current, 0, 0, 640, 480);

        const segmentation = await segmenter.segmentPeople(this.videoCanvasRef.current);
        const foregroundColor = { r: 0, g: 0, b: 0, a: 12 };
        const backgroundColor = { r: 0, g: 0, b: 0, a: 15 };

        const coloredPartImage = await bodySegmentation.toBinaryMask(
          segmentation,
          foregroundColor,
          backgroundColor
        );

        const imageData = context.getImageData(0, 0, 640, 480);
        const pixels = imageData.data;

        for (let i = 3; i < pixels.length; i += 4) {
          if (coloredPartImage.data[i] === 15) {
            pixels[i] = 0;
          }
        }

        context.putImageData(imageData, 0, 0);

        requestAnimationFrame(processFrame);
      }
    };

    requestAnimationFrame(processFrame);
  };
}

export default MediaModel;