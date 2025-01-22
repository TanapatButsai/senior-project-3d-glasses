import React, { useEffect, useRef } from "react";
import * as THREE from "three";

const ThreeCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    // Create a Three.js scene
    const scene = new THREE.Scene();

    // Set up a camera
    const camera = new THREE.PerspectiveCamera(
      75,
      640 / 480, // Aspect ratio (adjust for canvas size)
      0.1,
      1000
    );
    camera.position.z = 5; // Move the camera back to fit the cube

    // Set up a renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(640, 480); // Set canvas size (width x height)
    canvasRef.current.appendChild(renderer.domElement);

    // Add a spinning cube
    const geometry = new THREE.BoxGeometry(1, 1, 1); // Smaller cube size
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Rotate the cube
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;

      renderer.render(scene, camera);
    };
    animate();

    // Clean up on component unmount
    return () => {
      renderer.dispose();
      canvasRef.current.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={canvasRef}
      style={{
        width: "640px", // Set fixed width for the canvas
        height: "480px", // Set fixed height for the canvas
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#000", // Match the app's background
      }}
    />
  );
};

export default ThreeCanvas;
