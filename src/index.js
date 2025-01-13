import faceDetectionModule from '@mediapipe/face_detection';

const { FaceDetection } = faceDetectionModule;

// Test MediaPipe FaceDetection
const faceDetection = new FaceDetection({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`,
});

faceDetection.setOptions({
  model: 'short', // Options: 'short', 'full'
  minDetectionConfidence: 0.5,
});

console.log('MediaPipe FaceDetection initialized successfully!');

