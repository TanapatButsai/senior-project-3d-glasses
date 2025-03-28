import React, { useRef, useEffect, useState } from "react";
import { FaceMesh } from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as THREE from "three";
import Navbar from "../components/Navbar";
import "./CameraPage.css";
import { useNavigate, useLocation } from "react-router-dom"; 

const CameraPage = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const camera3DRef = useRef(null);
  const glassesRef = useRef(null);
  const prevLandmarks = useRef(null);
  const [cameraError, setCameraError] = useState(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const [showPermissionPopup, setShowPermissionPopup] = useState(true);
  const [isCameraAllowed, setIsCameraAllowed] = useState(false);
  const navigate = useNavigate();
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

    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 2 });
    const crossShape = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      -0.2, 0, 0, 0.2, 0, 0,
      0, -0.2, 0, 0, 0.2, 0
    ]);
    crossShape.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
    const crossLine = new THREE.LineSegments(crossShape, lineMaterial);
    crossLine.position.set(0, 0.5, -4.5);
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
            noFaceFrames++;
            if (noFaceFrames >= NO_FACE_THRESHOLD) {
              glassesRef.current.visible = false;
              setFaceDetected(false);
            }
            return;
          }

          const landmarks = results.multiFaceLandmarks[0];
          if (!prevLandmarks.current) {
            prevLandmarks.current = landmarks.map(p => ({ ...p }));
          } else {
            landmarks.forEach((pt, i) => {
              prevLandmarks.current[i].x = THREE.MathUtils.lerp(prevLandmarks.current[i].x, pt.x, 0.2);
              prevLandmarks.current[i].y = THREE.MathUtils.lerp(prevLandmarks.current[i].y, pt.y, 0.2);
              prevLandmarks.current[i].z = THREE.MathUtils.lerp(prevLandmarks.current[i].z, pt.z, 0.2);
            });
          }

          const smoothLandmarks = prevLandmarks.current;
          const leftEye = smoothLandmarks[33];
          const rightEye = smoothLandmarks[263];
          const noseTip = smoothLandmarks[1];
          const leftEar = smoothLandmarks[234];
          const rightEar = smoothLandmarks[454];
          const chin = smoothLandmarks[152];

          const eyeCenter = new THREE.Vector3(
            (leftEye.x + rightEye.x) / 2,
            (leftEye.y + rightEye.y) / 2,
            (leftEye.z + rightEye.z) / 2
          );

          const posX = -(eyeCenter.x - 0.5) * 10;
          const posY = -(eyeCenter.y - 0.5) * 10;
          const posZ = -5;

          glassesRef.current.position.set(
            THREE.MathUtils.lerp(glassesRef.current.position.x, posX, 0.2),
            THREE.MathUtils.lerp(glassesRef.current.position.y, posY, 0.2),
            THREE.MathUtils.lerp(glassesRef.current.position.z, posZ, 0.2)
          );

          const earVec = new THREE.Vector3(
            rightEar.x - leftEar.x,
            rightEar.y - leftEar.y,
            rightEar.z - leftEar.z
          );

          const faceVec = new THREE.Vector3(
            chin.x - noseTip.x,
            chin.y - noseTip.y,
            chin.z - noseTip.z
          );

          const forward = new THREE.Vector3().crossVectors(earVec, faceVec).normalize();
          const right = earVec.clone().normalize();
          const up = new THREE.Vector3().crossVectors(forward, right).normalize();

          const rotationMatrix = new THREE.Matrix4().makeBasis(right, up, forward);
          const targetQuaternion = new THREE.Quaternion().setFromRotationMatrix(rotationMatrix);

          glassesRef.current.quaternion.slerp(targetQuaternion, 0.2);

          const eyeDistance = earVec.length();
          const targetScale = Math.max(Math.min(eyeDistance * 15, 4.5), 2.5);
          glassesRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.2);

          glassesRef.current.visible = true;
          setFaceDetected(true);
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
            <p>To experience our <strong>Virtual Try-On</strong>, we need access to your camera.</p>
            <div className="popup-guide">
              <div className="crosshair-mark">+</div>
              <p className="popup-text">
                <strong>Align your nose</strong> with the <strong>red cross</strong> on the screen to get the most accurate fit.
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
              <button onClick={() => navigate("/")}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {isCameraAllowed && (
        <div className="video-container">
          <video ref={videoRef} className="video-stream" playsInline autoPlay muted></video>
          <div ref={canvasRef} className="canvas-container"></div>
        </div>
      )}
    </div>
  );
};

export default CameraPage;
