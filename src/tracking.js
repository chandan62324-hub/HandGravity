/**
 * @file tracking.js
 * @description Manages webcam access, streams video to the UI element,
 * initializes MediaPipe Hands, extracts landmarks, populates handData,
 * and renders a diagnostic skeleton overlay on the webcam preview.
 */
"use strict";

export const handData = {
    hands: [],
    face: null
};

// Hand skeleton connection pairs
const CONNECTIONS = [
    [0, 1], [1, 2], [2, 3], [3, 4],       // Thumb
    [0, 5], [5, 6], [6, 7], [7, 8],       // Index
    [5, 9], [9, 10], [10, 11], [11, 12],  // Middle
    [9, 13], [13, 14], [14, 15], [15, 16], // Ring
    [13, 17], [17, 18], [18, 19], [19, 20], // Pinky
    [0, 17]                                // Wrist to Pinky base
];

export async function initTracking() {
    const videoElement = document.getElementById('webcamVideo');
    const skeletonCanvas = document.getElementById('skeletonCanvas');
    const skeletonCtx = skeletonCanvas.getContext('2d');
    
    // Size the skeleton canvas to match the preview container perfectly
    skeletonCanvas.width = 160;
    skeletonCanvas.height = 120;

    // We let this naturally throw if permission is denied, so main.js can properly show the #error screen
    const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 }
    });
    
    videoElement.srcObject = stream;
    
    await new Promise((resolve) => {
        videoElement.onloadedmetadata = () => {
            videoElement.play();
            resolve();
        };
    });

    const holistic = new window.Holistic({
        locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`;
        }
    });

    holistic.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        refineFaceLandmarks: false,
        minDetectionConfidence: 0.6,
        minTrackingConfidence: 0.6
    });

    holistic.onResults((results) => {
        handData.hands = [];
        handData.face = null;
        
        skeletonCtx.clearRect(0, 0, skeletonCanvas.width, skeletonCanvas.height);

        // --- Extrapolate Face Data ---
        if (results.faceLandmarks) {
            handData.face = results.faceLandmarks.map(p => ({
                x: 1 - p.x, // Mirror X
                y: p.y,
                z: p.z
            }));
        }

        // --- Extrapolate Hand Data ---
        const processHand = (landmarks) => {
            if (!landmarks) return;
            
            const mirroredLandmarks = landmarks.map(landmark => ({
                ...landmark,
                x: 1 - landmark.x
            }));

            const palmIndices = [0, 5, 9, 13, 17];
            let palmX = 0, palmY = 0;

            for (const idx of palmIndices) {
                palmX += mirroredLandmarks[idx].x;
                palmY += mirroredLandmarks[idx].y;
            }

            handData.hands.push({
                landmarks: mirroredLandmarks,
                palmCenter: {
                    x: palmX / palmIndices.length,
                    y: palmY / palmIndices.length
                }
            });

            // Draw skeleton HUD
            skeletonCtx.lineWidth = 1;
            skeletonCtx.strokeStyle = '#00ffff';

            for (const pair of CONNECTIONS) {
                const p1 = landmarks[pair[0]];
                const p2 = landmarks[pair[1]];
                const x1 = (1 - p1.x) * skeletonCanvas.width;
                const y1 = p1.y * skeletonCanvas.height;
                const x2 = (1 - p2.x) * skeletonCanvas.width;
                const y2 = p2.y * skeletonCanvas.height;

                skeletonCtx.beginPath();
                skeletonCtx.moveTo(x1, y1);
                skeletonCtx.lineTo(x2, y2);
                skeletonCtx.stroke();
            }

            skeletonCtx.fillStyle = '#ff00ff';
            for (const p of landmarks) {
                const x = (1 - p.x) * skeletonCanvas.width;
                const y = p.y * skeletonCanvas.height;
                skeletonCtx.beginPath();
                skeletonCtx.arc(x, y, 2, 0, 2 * Math.PI);
                skeletonCtx.fill();
            }
        };

        processHand(results.leftHandLandmarks);
        processHand(results.rightHandLandmarks);
    });

    let isProcessing = false;

    const processVideoFrame = async () => {
        if (!isProcessing && videoElement.readyState >= 2) {
            isProcessing = true;
            try {
                await holistic.send({ image: videoElement });
            } catch (err) {
                console.error(err);
            }
            isProcessing = false;
        }
        requestAnimationFrame(processVideoFrame);
    };

    processVideoFrame();
}
