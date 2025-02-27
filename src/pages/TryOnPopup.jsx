import React, { useEffect, useRef } from "react";
import { FaceMesh } from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

const TryOnPopup = ({ glasses, onClose }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const camera3DRef = useRef(null);
  const glassesRef = useRef(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera3D = new THREE.PerspectiveCamera(75, 800 / 600, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true });

    camera3D.position.set(0, 0, 5);
    renderer.setSize(800, 600);
    canvasRef.current.appendChild(renderer.domElement);

    sceneRef.current = scene;
    camera3DRef.current = camera3D;
    rendererRef.current = renderer;

    const light = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(light);

    const loader = new GLTFLoader();
    loader.load(glasses.model, (gltf) => {
      const model = gltf.scene;
      glassesRef.current = model;
      scene.add(model);
      model.visible = false; // Hide initially
    });

    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera3D);
    };
    animate();
  }, [glasses]);

  useEffect(() => {
    const startCamera = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
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
          glassesRef.current.visible = false;
          return;
        }

        const landmarks = results.multiFaceLandmarks[0];
        const leftEye = landmarks[33];
        const rightEye = landmarks[263];

        const midX = (leftEye.x + rightEye.x) / 2;
        const midY = (leftEye.y + rightEye.y) / 2;

        glassesRef.current.visible = true;
        glassesRef.current.position.set((midX - 0.5) * 10, -(midY - 0.5) * 10, -5);
        glassesRef.current.scale.set(2, 2, 2);
      });

      const camera = new Camera(videoRef.current, {
        onFrame: async () => {
          await faceMesh.send({ image: videoRef.current });
        },
        width: 800,
        height: 600,
      });

      camera.start();
    };

    startCamera();
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-80 z-50">
      <div className="relative bg-white p-6 rounded-lg shadow-lg">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
          onClick={onClose}
        >
          ✖
        </button>
        <h2 className="text-xl font-bold text-center mb-4">{glasses.name} Try-On</h2>
        <div style={{ width: "800px", height: "600px", position: "relative" }}>
          <video ref={videoRef} className="absolute w-full h-full object-cover" autoPlay muted />
          <div ref={canvasRef} className="absolute w-full h-full" />
        </div>
      </div>
    </div>
  );
};

export default TryOnPopup;
