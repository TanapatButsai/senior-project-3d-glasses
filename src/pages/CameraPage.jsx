import React, { useRef, useEffect } from "react";
import { Camera } from "@mediapipe/camera_utils";
import { FaceMesh } from "@mediapipe/face_mesh";
import Footer from "../components/Footer";
import Header from "../components/Header";
import ThreeCanvas from "../components/ThreeCanvas";

const CameraPage = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && canvasRef.current) {
      const faceMesh = new FaceMesh({
        locateFile: (file) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
      });

      faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      faceMesh.onResults((results) => {
        const canvasCtx = canvasRef.current.getContext("2d");
        canvasCtx.clearRect(
          0,
          0,
          canvasRef.current.width,
          canvasRef.current.height
        );

        canvasCtx.drawImage(
          results.image,
          0,
          0,
          canvasRef.current.width,
          canvasRef.current.height
        );

        if (results.multiFaceLandmarks) {
          results.multiFaceLandmarks.forEach((landmarks) => {
            const importantLandmarks = [
              { id: 6, color: "blue" },
              { id: 197, color: "blue" },
              { id: 33, color: "green" },
              { id: 263, color: "green" },
              { id: 234, color: "purple" },
              { id: 454, color: "purple" },
            ];

            importantLandmarks.forEach((landmarkData) => {
              const { id, color } = landmarkData;
              const landmark = landmarks[id];
              const x = landmark.x * canvasRef.current.width;
              const y = landmark.y * canvasRef.current.height;

              canvasCtx.beginPath();
              canvasCtx.arc(x, y, 4, 0, 2 * Math.PI);
              canvasCtx.fillStyle = color;
              canvasCtx.fill();
            });
          });
        }
      });

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
        backgroundColor: "#326a72",
      }}
    >
      <Header title="3D Glasses Try-on App" />
      <h1
        style={{
          color: "#fff",
          fontSize: "24px",
          fontWeight: "bold",
          marginBottom: "20px",
        }}
      >
        Face Mesh with Fixed Camera Feed
      </h1>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-around",
          width: "100%",
        }}
      >
        {/* Camera Feed */}
        <div
          style={{
            width: "800px", // Upscaled width
            height: "600px", // Upscaled height
            border: "10px solid black", // Black frame
            borderRadius: "8px", // Rounded corners
            overflow: "hidden",
            position: "relative",
            backgroundColor: "#000", // Background for empty areas
          }}
        >
          <video
            ref={videoRef}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
            playsInline
          ></video>
          <canvas
            ref={canvasRef}
            width="800"
            height="600"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
            }}
          ></canvas>
        </div>

        {/* 3D Canvas */}
        {/* <ThreeCanvas /> */}
      </div>
      <Footer />
    </div>
  );
};

export default CameraPage;
