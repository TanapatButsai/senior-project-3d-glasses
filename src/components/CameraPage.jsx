import React, { useRef, useEffect } from "react";
import { Camera } from "@mediapipe/camera_utils";
import { FaceMesh } from "@mediapipe/face_mesh";

const CameraPage = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && canvasRef.current) {
      // Initialize Face Mesh
      const faceMesh = new FaceMesh({
        locateFile: (file) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
      });

      faceMesh.setOptions({
        maxNumFaces: 1, // Detect up to one face
        refineLandmarks: true, // Enable detailed landmarks (e.g., iris)
        minDetectionConfidence: 0.5, // Minimum confidence for detection
        minTrackingConfidence: 0.5, // Minimum confidence for tracking
      });

      // Handle Face Mesh results
      faceMesh.onResults((results) => {
        const canvasCtx = canvasRef.current.getContext("2d");
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

        // Visualize specific face mesh landmarks
        if (results.multiFaceLandmarks) {
          results.multiFaceLandmarks.forEach((landmarks) => {
            // Mark key landmarks: nose bridge, eye corners, and ears
            const importantLandmarks = [
              { id: 6, color: "blue" }, // Bridge of nose
              { id: 197, color: "blue" }, // Alternate bridge of nose
              { id: 33, color: "green" }, // Left eye corner
              { id: 263, color: "green" }, // Right eye corner
              { id: 234, color: "purple" }, // Left ear
              { id: 454, color: "purple" }, // Right ear
            ];

            importantLandmarks.forEach((landmarkData) => {
              const { id, color } = landmarkData;
              const landmark = landmarks[id];
              const x = landmark.x * canvasRef.current.width;
              const y = landmark.y * canvasRef.current.height;

              // Draw the specific landmark as a colored dot
              canvasCtx.beginPath();
              canvasCtx.arc(x, y, 4, 0, 2 * Math.PI); // Radius of 4 for better visibility
              canvasCtx.fillStyle = color; // Use the assigned color
              canvasCtx.fill();
            });
          });
        }
      });

      // Initialize the Camera
      const camera = new Camera(videoRef.current, {
        onFrame: async () => {
          await faceMesh.send({ image: videoRef.current });
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
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        width: "100vw",
        backgroundColor: "#000", // Black background
      }}
    >
      <h1
        style={{
          marginBottom: "20px",
          fontSize: "24px",
          color: "#fff", // White text for contrast
          fontWeight: "bold",
          textAlign: "center",
        }}
      >
        Face Mesh with Landmark Visualization
      </h1>
      <video
        ref={videoRef}
        style={{
          display: "none",
        }}
        playsInline
      ></video>
      <canvas
        ref={canvasRef}
        width="640"
        height="480"
        style={{
          border: "2px solid #1DB954", // Modern green border
          borderRadius: "8px",
        }}
      ></canvas>
    </div>
  );
};

export default CameraPage;
