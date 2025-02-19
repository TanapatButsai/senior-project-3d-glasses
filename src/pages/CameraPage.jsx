import React, { useRef, useEffect, useState } from "react";
import { FaceMesh } from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";
import Header from "../components/Header";
import Footer from "../components/Footer";

const CameraPage = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraError, setCameraError] = useState(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const [headPose, setHeadPose] = useState({ pitch: 0, yaw: 0, roll: 0 });

  useEffect(() => {
    const checkOpenCV = setInterval(() => {
      if (window.cv && window.cv.imread) {
        console.log("✅ OpenCV.js is ready to use!");
        clearInterval(checkOpenCV);
      }
    }, 500);
  }, []);

  useEffect(() => {
    const initializeCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;

        const faceMesh = new FaceMesh({
          locateFile: (file) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
        });

        faceMesh.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
          minDetectionConfidence: 0.8,
          minTrackingConfidence: 0.8,
        });

        faceMesh.onResults((results) => {
          if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
            setFaceDetected(false);
            return;
          }

          setFaceDetected(true);
          const landmarks = results.multiFaceLandmarks[0];

          // Perform head pose estimation
          estimateHeadPose(landmarks);
        });

        const camera = new Camera(videoRef.current, {
          onFrame: async () => {
            await faceMesh.send({ image: videoRef.current });
          },
          width: 800,
          height: 600,
        });

        camera.start();
      } catch (error) {
        console.error("Camera access error:", error);
        setCameraError("Camera not accessible. Please check permissions.");
      }
    };

    initializeCamera();
  }, []);

  const estimateHeadPose = (landmarks) => {
    if (!window.cv) {
      console.error("❌ OpenCV.js is not loaded.");
      return;
    }
  
    const cv = window.cv; // ✅ Use OpenCV.js from the global object
  
    // **Camera Matrix**
    const imageWidth = 800;
    const imageHeight = 600;
    const focalLength = imageWidth; // Assume focal length = width
    const cameraMatrix = cv.Mat.zeros(3, 3, cv.CV_64F);
    cameraMatrix.data64F.set([
      focalLength, 0, imageWidth / 2,
      0, focalLength, imageHeight / 2,
      0, 0, 1,
    ]);
  
    const distCoeffs = cv.Mat.zeros(4, 1, cv.CV_64F); // No lens distortion
  
    // **3D Model Points (Head Reference)**
    const modelPoints = cv.Mat.zeros(6, 3, cv.CV_64F);
    modelPoints.data64F.set([
      0.0, 0.0, 0.0,  // Nose tip
      -30.0, -30.0, -30.0,  // Left eye
      30.0, -30.0, -30.0,   // Right eye
      -60.0, 40.0, -50.0,   // Left ear
      60.0, 40.0, -50.0,    // Right ear
      0.0, -70.0, -30.0,    // Chin
    ]);
  
    // **2D Image Points (from FaceMesh)**
    const imagePoints = cv.Mat.zeros(6, 2, cv.CV_64F);
    imagePoints.data64F.set([
      landmarks[1].x * imageWidth, landmarks[1].y * imageHeight,   // Nose tip
      landmarks[33].x * imageWidth, landmarks[33].y * imageHeight, // Left eye
      landmarks[263].x * imageWidth, landmarks[263].y * imageHeight, // Right eye
      landmarks[234].x * imageWidth, landmarks[234].y * imageHeight, // Left ear
      landmarks[454].x * imageWidth, landmarks[454].y * imageHeight, // Right ear
      landmarks[152].x * imageWidth, landmarks[152].y * imageHeight, // Chin
    ]);
  
    // Solve PnP
    let rvec = new cv.Mat();
    let tvec = new cv.Mat();
    cv.solvePnP(modelPoints, imagePoints, cameraMatrix, distCoeffs, rvec, tvec);
  
    // Convert rotation vector to Euler angles
    let rmat = new cv.Mat();
    cv.Rodrigues(rvec, rmat);
  
    let rotationMatrix = rmat.data64F;
    let pitch = Math.atan2(rotationMatrix[7], rotationMatrix[8]) * (180 / Math.PI);
    let yaw = Math.atan2(-rotationMatrix[6], Math.sqrt(rotationMatrix[7] ** 2 + rotationMatrix[8] ** 2)) * (180 / Math.PI);
    let roll = Math.atan2(rotationMatrix[3], rotationMatrix[0]) * (180 / Math.PI);
  
    setHeadPose({ pitch, yaw, roll });
  
    // **Clean up OpenCV Mat objects**
    rvec.delete();
    tvec.delete();
    rmat.delete();
    modelPoints.delete();
    imagePoints.delete();
    cameraMatrix.delete();
    distCoeffs.delete();
  };
  
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
      <Header title="Head Pose Estimation" />
      <h1 style={{ color: "#fff", fontSize: "24px", fontWeight: "bold" }}>Head Pose Detection</h1>

      {cameraError && <p style={{ color: "red", fontWeight: "bold" }}>{cameraError}</p>}

      {/* Face Detection Status */}
      <p style={{ color: faceDetected ? "green" : "red", fontWeight: "bold" }}>
        {faceDetected ? "Face Detected ✅" : "No Face Detected ❌"}
      </p>

      {/* Head Pose Data */}
      <p style={{ color: "white", fontSize: "18px" }}>
        <b>Pitch:</b> {headPose.pitch.toFixed(2)}°
        <b> Yaw:</b> {headPose.yaw.toFixed(2)}°
        <b> Roll:</b> {headPose.roll.toFixed(2)}°
      </p>

      {/* Video Feed */}
      <div style={{ position: "relative", width: "800px", height: "600px" }}>
        <video ref={videoRef} style={{ width: "100%", height: "100%", objectFit: "cover" }} playsInline></video>
      </div>

      <Footer />
    </div>
  );
};

export default CameraPage;
