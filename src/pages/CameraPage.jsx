import React, { useRef, useEffect, useState } from "react";
import { FaceMesh } from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as THREE from "three";
import Navbar from "../components/Navbar";
import "./CameraPage.css";
import { useNavigate, useLocation } from "react-router-dom"; // ✅ Import useNavigate
const CameraPage = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const camera3DRef = useRef(null);
  const glassesRef = useRef(null);
  const [cameraError, setCameraError] = useState(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const [showPermissionPopup, setShowPermissionPopup] = useState(true);
  const [isCameraAllowed, setIsCameraAllowed] = useState(false);
  const navigate = useNavigate(); // ✅ Initialize navigate
  const location = useLocation();
  const selectedModel = location.state?.selectedModel || null;
  
  if (!selectedModel) {
    console.error("❌ No model data received!");
  }

  let noFaceFrames = 0;
  const NO_FACE_THRESHOLD = 5;

  const loadGlassesModel = (scene) => {
    const loader = new GLTFLoader();
    const modelURL = `http://localhost:5050/models/${selectedModel.model_file}`;
    loader.load(
      modelURL,
      (gltf) => {
        const glasses = gltf.scene;
        glassesRef.current = glasses;
        scene.add(glasses);
        glasses.visible = false;
      },
      undefined,
      (error) => {
        console.error("Failed to load model:", error);
      }
    );
      // ✅ Create "+" Mark using simple lines
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 2 });
    
    const crossShape = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      // Horizontal line
      -0.2, 0, 0,
      0.2, 0, 0,
      // Vertical line
      0, -0.2, 0,
      0,  0.2, 0
    ]);

    crossShape.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
  
    const crossLine = new THREE.LineSegments(crossShape, lineMaterial);
    crossLine.position.set(0, 0.5, -4.5); // ✅ Slightly above the nose (Y-axis)
    
    scene.add(crossLine);
  };

  useEffect(() => {
    if (!isCameraAllowed) return;

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
  }, [isCameraAllowed]);

  useEffect(() => {
    if (!isCameraAllowed) return;

    const checkCameraAccess = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 800, height: 600 } });
        videoRef.current.srcObject = stream;

        const faceMesh = new FaceMesh({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
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

          const leftEye = landmarks[33];
          const rightEye = landmarks[263];
          const noseTip = landmarks[1];
          const leftEar = landmarks[234];
          const rightEar = landmarks[454];

          const midX = (leftEye.x + rightEye.x) / 2;
          const midY = (leftEye.y + rightEye.y) / 2;

          const eyeDistance = Math.sqrt(
            Math.pow(rightEye.x - leftEye.x, 2) +
            Math.pow(rightEye.y - leftEye.y, 2) +
            Math.pow(rightEye.z - leftEye.z, 2)
          );

          // ✅ Adjust Glasses Position
          const noseX = -(noseTip.x - 0.5) * 10;
          const noseY = -(midY - 0.5) * 10 + 0.5;
          const noseZ = -5;

          glassesRef.current.position.set(
            THREE.MathUtils.lerp(glassesRef.current.position.x, noseX, 0.2),
            THREE.MathUtils.lerp(glassesRef.current.position.y, noseY, 0.2),
            THREE.MathUtils.lerp(glassesRef.current.position.z, noseZ, 0.2)
          );

          // ✅ Improved Yaw (Turning Left & Right)
          const yaw = Math.atan2(rightEar.y - leftEar.y, rightEar.x - leftEar.x) * 2.0; // Increased sensitivity
          const stableMidY = (leftEye.y + rightEye.y + landmarks[152].y) / 3; // คำนวณจาก 3 จุด
          const pitch = Math.atan2(noseTip.y - stableMidY, eyeDistance) * 0.6;
          const roll = -yaw * 0.6; // Adjust roll factor

          glassesRef.current.rotation.set(
            THREE.MathUtils.lerp(glassesRef.current.rotation.x, pitch, 0.2),
            THREE.MathUtils.lerp(glassesRef.current.rotation.y, yaw, 0.3), // Faster turning
            THREE.MathUtils.lerp(glassesRef.current.rotation.z, roll,  0.2)
          );

          // ✅ Improved Glasses Scaling
          const glassesScale = Math.max(Math.min(eyeDistance * 18, 5), 2);
          glassesRef.current.scale.set(glassesScale, glassesScale, glassesScale);
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
  }, [isCameraAllowed]);

  return (
    <div className="camera-container">
      <Navbar />

      {showPermissionPopup && (
        <div className="camera-popup">
          <div className="camera-popup-content">
            <h2>Enable Camera Access</h2>
            <p>To experience our **Virtual Try-On**, we need access to your camera.</p>
            <div className="popup-guide">
              <div className="crosshair-mark">+</div>
              <p className="popup-text">
                **Align your nose** with the **red cross** on the screen to get the most accurate fit.
                <br />Make sure your face is well-lit and centered.
              </p>
            </div>
            <div className="popup-buttons">
              <button onClick={() => {
                setShowPermissionPopup(false);
                setIsCameraAllowed(true);
              }}>
                Proceed
              </button>
              <button onClick={() => navigate("/")}>Cancel</button> {/* ✅ Redirect to home */}
            </div>
          </div>
        </div>
      )}

      {isCameraAllowed && (
        <div className="video-container">
          <video ref={videoRef} className="video-stream" playsInline></video>
          <div ref={canvasRef} className="canvas-container"></div>
        </div>
      )}
    </div>
  );
};

export default CameraPage;
