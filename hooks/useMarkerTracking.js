import { useState, useEffect, useRef } from 'react';
import * as Aruco from '../lib/js-aruco.js';

const useMarkerTracking = (videoElement, debugCanvasRef) => {
  const [markers, setMarkers] = useState([]);
  const [error, setError] = useState(null);
  
  const canvasRef = useRef(document.createElement('canvas'));
  const detectorRef = useRef(null);
  const videoStreamRef = useRef(null);

  useEffect(() => {
    if (!videoElement) {
      return;
    }

    let animationFrameId;

    const tick = () => {
      if (videoElement.readyState === videoElement.HAVE_ENOUGH_DATA && detectorRef.current) {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        
        try {
          const detectedMarkers = detectorRef.current.detect(imageData);

          if (debugCanvasRef && debugCanvasRef.current) {
            const debugCtx = debugCanvasRef.current.getContext('2d');
            const thresholdImage = detectorRef.current.thres;
            if (thresholdImage) {
              if (debugCanvasRef.current.width !== thresholdImage.width) {
                debugCanvasRef.current.width = thresholdImage.width;
                debugCanvasRef.current.height = thresholdImage.height;
              }
              const debugImageData = debugCtx.createImageData(thresholdImage.width, thresholdImage.height);
              for (let i = 0; i < thresholdImage.data.length; i++) {
                const value = thresholdImage.data[i];
                debugImageData.data[i * 4] = value;
                debugImageData.data[i * 4 + 1] = value;
                debugImageData.data[i * 4 + 2] = value;
                debugImageData.data[i * 4 + 3] = 255;
              }
              debugCtx.putImageData(debugImageData, 0, 0);
            }
          }

          const scaleX = window.innerWidth / canvas.width;
          const scaleY = window.innerHeight / canvas.height;

          const processedMarkers = detectedMarkers.map(marker => {
            const centerX = (marker.corners[0].x + marker.corners[1].x + marker.corners[2].x + marker.corners[3].x) / 4;
            const centerY = (marker.corners[0].y + marker.corners[1].y + marker.corners[2].y + marker.corners[3].y) / 4;
            const vx = marker.corners[1].x - marker.corners[0].x;
            const vy = marker.corners[1].y - marker.corners[0].y;
            const angle = Math.atan2(vy, vx);
            const len = Math.hypot(vx, vy) || 1;
            return {
              id: marker.id,
              x: centerX * scaleX,
              y: centerY * scaleY,
              angle,
              facing: { x: vx / len, y: vy / len },
            };
          });

          setMarkers(processedMarkers);

        } catch (err) {
          alert('An error occurred during marker detection: ' + err.message);
          console.error("Error during marker detection:", err);
          setError(err);
          if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
          }
        }
      }
      animationFrameId = requestAnimationFrame(tick);
    };

    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
        });

        videoStreamRef.current = stream;
        videoElement.srcObject = stream;
        
        videoElement.onloadedmetadata = () => {
          videoElement.play();

          const canvas = canvasRef.current;
          canvas.width = videoElement.videoWidth;
          canvas.height = videoElement.videoHeight;
          
          detectorRef.current = new Aruco.AR.Detector();
          
          animationFrameId = requestAnimationFrame(tick);
        };
      } catch (err) {
        console.error("Error accessing camera: ", err);
        setError(err);
      }
    };

    initCamera();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (videoStreamRef.current) {
        videoStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [videoElement, debugCanvasRef]);

  return { markers, error };
};

export default useMarkerTracking;
