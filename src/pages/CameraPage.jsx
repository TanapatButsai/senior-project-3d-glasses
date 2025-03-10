import React, { useRef, useEffect, useState } from "react";
import { FaceMesh } from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as THREE from "three";
import Header from "../components/Header";
import Footer from "../components/Footer";

const CameraPage = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const camera3DRef = useRef(null);
  const glassesRef = useRef(null);
  const [cameraError, setCameraError] = useState(null);
  const [faceDetected, setFaceDetected] = useState(false);

  let noFaceFrames = 0;
  const NO_FACE_THRESHOLD = 5; // Number of frames before hiding glasses
  const BASE_SCALE_MULTIPLIER = 5; // Base multiplier for scaling glasses
  const MIN_SCALE = 0.5; // Minimum scale for glasses
  const MAX_SCALE = 3.0; // Maximum scale for glasses
  const SMOOTH_FACTOR = 0.2; // Smooth interpolation factor (0.0 - 1.0)

  const loadGlassesModel = (scene) => {
    const loader = new GLTFLoader();
    loader.load(
      "/models/gl.glb", // Replace with actual model path
      (gltf) => {
        const glasses = gltf.scene;
        glassesRef.current = glasses;
        scene.add(glasses);
        glasses.visible = false; // Hide initially
      },
      undefined,
      (error) => {
        console.error("Failed to load model:", error);
      }
    );
  };

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera3D = new THREE.PerspectiveCamera(75, 800 / 600, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    camera3D.position.set(0, 0, 5);
    renderer.setSize(800, 600);
    renderer.setClearColor(0x000000, 0);
    canvasRef.current.appendChild(renderer.domElement);

    sceneRef.current = scene;
    camera3DRef.current = camera3D;
    rendererRef.current = renderer;

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7.5).normalize();
    scene.add(directionalLight);

    loadGlassesModel(scene);

    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera3D);
    };
    animate();
  }, []);

  useEffect(() => {
    const checkCameraAccess = async () => {
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
            noFaceFrames += 1;
            if (noFaceFrames >= NO_FACE_THRESHOLD) {
              glassesRef.current.visible = false;
              setFaceDetected(false);
            }
            return;
          }
        
          noFaceFrames = 0;
          setFaceDetected(true);
          glassesRef.current.visible = true;
        
          const landmarks = results.multiFaceLandmarks[0];
        
          // ✅ จุด Landmark สำคัญ
          const leftEye = landmarks[33];   // หางตาซ้าย
          const rightEye = landmarks[263]; // หางตาขวา
          const noseTip = landmarks[1];    // ปลายจมูก
          const leftEar = landmarks[234];  // หูซ้าย
          const rightEar = landmarks[454]; // หูขวา
          const chin = landmarks[152];     // คาง
        
          // ✅ คำนวณขนาดใบหน้า
          const faceWidth = Math.sqrt(
            Math.pow(rightEar.x - leftEar.x, 2) +
            Math.pow(rightEar.y - leftEar.y, 2) +
            Math.pow(rightEar.z - leftEar.z, 2)
          );
        
          const faceHeight = Math.sqrt(
            Math.pow(chin.x - noseTip.x, 2) +
            Math.pow(chin.y - noseTip.y, 2) +
            Math.pow(chin.z - noseTip.z, 2)
          );
        
          const eyeDistance = Math.sqrt(
            Math.pow(rightEye.x - leftEye.x, 2) +
            Math.pow(rightEye.y - leftEye.y, 2) +
            Math.pow(rightEye.z - leftEye.z, 2)
          );
        
          // ✅ ปรับขนาดแว่นให้สัมพันธ์กับระยะห่างดวงตา
          let scaleX = eyeDistance * 12;
          let scaleY = eyeDistance * 6;
          let scaleZ = eyeDistance * 10;
        
          glassesRef.current.scale.set(scaleX, scaleY, scaleZ);
        
          // ✅ ใช้ตำแหน่ง "ปลายจมูก" เป็นจุดศูนย์กลางของแว่น
          const noseX = noseTip.x;
          const noseY = noseTip.y;
          const midX = (leftEye.x + rightEye.x) / 2;
          const midY = (leftEye.y + rightEye.y) / 2;
        
          // ✅ ปรับตำแหน่งแว่น
          glassesRef.current.position.set(
            THREE.MathUtils.lerp(glassesRef.current.position.x, (noseX - 0.5) * 10, 0.2),
            THREE.MathUtils.lerp(glassesRef.current.position.y, -(midY - 0.5) * 10 + 0.5, 0.2), // 👈 Add a slight offset (0.5) to lift the glasses
            -faceWidth * 1.8
          );
        
          // ✅ ปรับการหมุนของแว่นให้พอดี
          const yaw = Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x);
          const pitch = Math.atan2(noseTip.y - midY, faceHeight);
          const roll = -yaw * 0.5;
        
          glassesRef.current.rotation.set(
            THREE.MathUtils.lerp(glassesRef.current.rotation.x, pitch, 0.2),
            THREE.MathUtils.lerp(glassesRef.current.rotation.y, yaw, 0.2),
            THREE.MathUtils.lerp(glassesRef.current.rotation.z, roll, 0.2)
          );
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

    checkCameraAccess();
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
      <Header title="TRY-ME" />
      <h1 style={{ color: "#fff", fontSize: "24px", fontWeight: "bold" }}>
        test
      </h1>

      {cameraError && (
        <p style={{ color: "red", fontWeight: "bold" }}>{cameraError}</p>
      )}

      {/* Face Detection Status */}
      <p style={{ color: faceDetected ? "green" : "red", fontWeight: "bold" }}>
        {faceDetected ? "Face Detected ✅" : "No Face Detected ❌ (Glasses Hidden)"}
      </p>

      {/* Video and Canvas */}
      <div style={{ position: "relative", width: "800px", height: "600px" }}>
      <div
          ref={canvasRef}
          style={{
            width: "100%",
            height: "100%",
            position: "absolute",
            zIndex: 1,
          }}></div>
        <video
          ref={videoRef}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            position: "absolute",
            zIndex: 1,
            transform: "scaleX(-1)", // ✅ กลับด้านซ้าย-ขวา (Mirror)
          }}
          playsInline></video>
        
        </div>

      {/* <Footer /> */}
    </div>
  );
};

export default CameraPage;
