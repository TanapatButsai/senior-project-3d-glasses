import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import Header from "../components/Header";
import Footer from "../components/Footer";

const ModelViewerPage = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    // Create a Three.js scene
    const scene = new THREE.Scene();

    // Set up a camera
    const camera = new THREE.PerspectiveCamera(75, 640 / 480, 0.1, 1000);
    camera.position.z = 5; // Move the camera back to see the model

    // Set up a renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(640, 480); // Set canvas size
    canvasRef.current.appendChild(renderer.domElement);

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5); // Bright ambient light
    scene.add(ambientLight);

    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7.5).normalize();
    scene.add(directionalLight);

    // Load the 3D model
    const loader = new GLTFLoader();
    let model;

    console.log("Loading the 3D model...");
    loader.load(
      "/models/cartoon_glasses.glb", // Update with the path to your .glb file
      (gltf) => {
        model = gltf.scene;

        // Scale and position the model
        model.scale.set(1, 1, 1); // Adjust model scale
        model.position.set(0, 0, 0); // Center the model
        scene.add(model);

        console.log("3D model loaded successfully!", model);
      },
      undefined,
      (error) => {
        console.error("Error loading 3D model:", error);
      }
    );

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Optional: Rotate the model for better visualization
      if (model) {
        model.rotation.y += 0.01; // Rotate around Y-axis
      }

      renderer.render(scene, camera);
    };
    animate();

    // Cleanup on component unmount
    return () => {
      renderer.dispose();
      if (canvasRef.current) {
        canvasRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        width: "100vw",
        backgroundColor: "#326a72", // Dark background for contrast
      }}
    >
      
      <div
        ref={canvasRef}
        style={{
          width: "640px", // Set fixed canvas width
          height: "480px", // Set fixed canvas height
          border: "2px solid #1DB954", // Green border for visibility
          borderRadius: "8px",
        }}
      />
    <Footer/>
    </div>
  );
};

export default ModelViewerPage;
