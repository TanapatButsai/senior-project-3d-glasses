import React, { useRef, useEffect, useState } from "react";
import { FaceMesh } from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as THREE from "three";
import Navbar from "../components/Navbar";
import "./CameraPage.css";

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

  let noFaceFrames = 0;
  const NO_FACE_THRESHOLD = 5;

  const loadGlassesModel = (scene) => {
    const loader = new GLTFLoader();
    loader.load(
      "/models/gl.glb",
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
  };

  // ✅ คำนวณมุมศีรษะ (Head Pose Estimation)
  const computeHeadPose = (landmarks) => {
    const leftEar = new THREE.Vector3(landmarks[234].x, landmarks[234].y, landmarks[234].z);
    const rightEar = new THREE.Vector3(landmarks[454].x, landmarks[454].y, landmarks[454].z);
    const noseTip = new THREE.Vector3(landmarks[1].x, landmarks[1].y, landmarks[1].z);

    const headDirection = new THREE.Vector3().subVectors(rightEar, leftEar).normalize();
    const faceDirection = new THREE.Vector3().subVectors(noseTip, leftEar).normalize();

    const yaw = Math.atan2(headDirection.y, headDirection.x);
    const pitch = Math.atan2(faceDirection.z, faceDirection.y);

    return { yaw, pitch };
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

          // ✅ คำนวณขนาดแว่นจากความกว้างใบหน้าแทนระยะตา
          const leftEar = landmarks[234];
          const rightEar = landmarks[454];
          const noseTip = landmarks[1];

          const faceWidth = Math.sqrt(
            Math.pow(rightEar.x - leftEar.x, 2) +
            Math.pow(rightEar.y - leftEar.y, 2) +
            Math.pow(rightEar.z - leftEar.z, 2)
          );

          // ✅ ปรับขนาดแว่นตามขนาดใบหน้า
          const glassesScale = faceWidth * 1.1;
          glassesRef.current.scale.set(glassesScale, glassesScale, glassesScale);

          // ✅ ปรับตำแหน่งให้พอดีขึ้น
          const noseX = -(noseTip.x - 0.5) * 10;
          const noseY = -(noseTip.y - 0.5) * 10 + 1.0; // 🔹 ลดค่าความสูงของแว่นลง
          const noseZ = -faceWidth * 1.5;

          glassesRef.current.position.set(
            THREE.MathUtils.lerp(glassesRef.current.position.x, noseX, 0.2),
            THREE.MathUtils.lerp(glassesRef.current.position.y, noseY, 0.2),
            THREE.MathUtils.lerp(glassesRef.current.position.z, noseZ, 0.2)
          );

          // ✅ ปรับการหมุนของแว่นให้สมจริงขึ้น
          const { yaw, pitch } = computeHeadPose(landmarks);

          glassesRef.current.rotation.set(
            THREE.MathUtils.lerp(glassesRef.current.rotation.x, pitch * 0.5, 0.2),
            THREE.MathUtils.lerp(glassesRef.current.rotation.y, yaw * 0.8, 0.2),
            0
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
  }, [isCameraAllowed]);

  return (
    <div className="camera-container">
      <Navbar />

      {showPermissionPopup && (
        <div className="camera-popup">
          <div className="camera-popup-content">
            <h2>Allow Camera Access</h2>
            <p>To use the Virtual Try-On feature, we need access to your camera.</p>
            <div className="popup-buttons">
              <button onClick={() => {
                setShowPermissionPopup(false);
                setIsCameraAllowed(true);
              }}>
                Proceed
              </button>
              <button onClick={() => setShowPermissionPopup(true)}>Cancel</button>
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
