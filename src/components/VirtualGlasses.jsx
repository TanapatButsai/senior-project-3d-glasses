import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import * as tf from "@tensorflow/tfjs";
import * as facemesh from "@tensorflow-models/facemesh";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

const VirtualGlasses = ({ modelPath, onClose }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const sceneRef = useRef(new THREE.Scene());
  const rendererRef = useRef(null);
  const camera3DRef = useRef(null);
  const glassesRef = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const setupScene = () => {
      const scene = sceneRef.current;
      const camera3D = new THREE.PerspectiveCamera(75, 640 / 480, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({ alpha: true });

      renderer.setSize(640, 480);
      canvasRef.current.appendChild(renderer.domElement);

      camera3D.position.set(0, 0, 5);
      camera3DRef.current = camera3D;
      rendererRef.current = renderer;

      const light = new THREE.AmbientLight(0xffffff, 1.5);
      scene.add(light);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(5, 10, 7.5).normalize();
      scene.add(directionalLight);
    };

    setupScene();
  }, []);

  useEffect(() => {
    const loadGlasses = async () => {
      const loader = new GLTFLoader();
      loader.load(modelPath, (gltf) => {
        const glasses = gltf.scene;
        glassesRef.current = glasses;
        sceneRef.current.add(glasses);
        glasses.visible = false;
        setLoading(false);
      });
    };

    loadGlasses();
  }, [modelPath]);

  useEffect(() => {
    const startVideo = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
    };

    const detectFace = async () => {
      const model = await facemesh.load();
      const video = videoRef.current;

      setInterval(async () => {
        const predictions = await model.estimateFaces(video, false);
        if (predictions.length > 0) {
          const keypoints = predictions[0].scaledMesh;
          const leftEye = keypoints[33];
          const rightEye = keypoints[263];
          const noseTip = keypoints[6];

          const midX = (leftEye[0] + rightEye[0]) / 2;
          const midY = (leftEye[1] + rightEye[1]) / 2;
          const faceWidth = Math.abs(rightEye[0] - leftEye[0]);

          glassesRef.current.visible = true;
          glassesRef.current.position.set(midX / 100 - 3, -midY / 100 + 2, -faceWidth * 0.05);
          glassesRef.current.scale.set(faceWidth / 100, faceWidth / 100, faceWidth / 100);
        } else {
          glassesRef.current.visible = false;
        }
      }, 100);
    };

    startVideo();
    detectFace();
  }, []);

  return (
    <div className="popup-container">
      <video ref={videoRef} autoPlay playsInline width="640" height="480" />
      <div ref={canvasRef}></div>
      {loading && <p>Loading glasses...</p>}
      <button onClick={onClose}>Close</button>
    </div>
  );
};

export default VirtualGlasses;
