import React, { useRef, useEffect } from 'react';
import { Camera } from '@mediapipe/camera_utils';
import { FaceDetection } from '@mediapipe/face_detection';

const CameraPage = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && canvasRef.current) {
      // Initialize Face Detection
      const faceDetection = new FaceDetection({
        locateFile: (file) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`,
      });

      faceDetection.setOptions({
        model: 'short', // Use short-range face detection model
        minDetectionConfidence: 0.5, // Confidence threshold
      });

      // Handle detection results
      faceDetection.onResults((results) => {
        const canvasCtx = canvasRef.current.getContext('2d');
        canvasCtx.clearRect(
          0,
          0,
          canvasRef.current.width,
          canvasRef.current.height
        );

        // Draw the video frame onto the canvas
        canvasCtx.drawImage(
          results.image,
          0,
          0,
          canvasRef.current.width,
          canvasRef.current.height
        );

        // Draw bounding boxes for detected faces
        results.detections.forEach((detection) => {
          const { xCenter, yCenter, width, height } = detection.boundingBox;

          canvasCtx.strokeStyle = 'blue';
          canvasCtx.lineWidth = 4;
          canvasCtx.strokeRect(
            xCenter - width / 2, // Top-left x
            yCenter - height / 2, // Top-left y
            width, // Box width
            height // Box height
          );
        });
      });

      // Initialize Camera
      const camera = new Camera(videoRef.current, {
        onFrame: async () => {
          await faceDetection.send({ image: videoRef.current });
        },
        width: 640,
        height: 480,
      });

      camera.start();
    }
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        height: '100vh',
        width: '100vw',
        paddingTop: '20px',
        boxSizing: 'border-box',
        backgroundColor: '#fff',
      }}
    >
      <h1
        style={{
          marginBottom: '20px',
          color: '#000',
          fontSize: '2rem',
        }}
      >
        Face Detection
      </h1>
      <video
        ref={videoRef}
        style={{
          display: 'none',
        }}
        playsInline
      ></video>
      <canvas
        ref={canvasRef}
        width="640"
        height="480"
        style={{
          border: '2px solid black',
        }}
      ></canvas>
    </div>
  );
};

export default CameraPage;
