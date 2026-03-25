/**
 * @file renderer.js
 * @description Drives the main animation loop for the HandGravity particle system.
 * Each frame: applies a trail fade effect, updates gesture classifications,
 * applies hand forces to particles, updates and draws all particles,
 * and renders a HUD overlay showing gesture, particle count, and live FPS.
 */
"use strict";

/**
 * Starts the main render loop.
 *
 * @param {HTMLCanvasElement} canvas - The canvas element to render to
 * @param {Array<Object>} particles - Array of Particle instances
 * @param {{ hands: Array<{ landmarks: Array, palmCenter: {x:number, y:number}, gesture?: string }> }} handData - Shared hand tracking state
 * @param {function} classifyGesture - Function to classify a gesture from landmarks
 * @param {function} applyForces - Function to apply hand forces to particles
 */
export function startRenderLoop(canvas, particles, handData, classifyGesture, applyForces) {
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    /** @type {number[]} Rolling window of frame timestamps for FPS calculation */
    const timestamps = [];

    /**
     * Calculates the current FPS from the timestamps rolling window.
     * @returns {number} Rounded FPS value
     */
    function calculateFPS() {
        if (timestamps.length < 2) return 0;
        const first = timestamps[0];
        const last = timestamps[timestamps.length - 1];
        const count = timestamps.length - 1;
        return Math.round(1000 / ((last - first) / count));
    }

    /**
     * Renders a single frame.
     */
    function frame() {
        // 1. TRAIL EFFECT — semi-transparent black overlay instead of clearing
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.fillRect(0, 0, w, h);

        // 2. Update gesture for each tracked hand
        const totalHands = handData.hands.length;
        for (const hand of handData.hands) {
            hand.gesture = classifyGesture(hand.landmarks, totalHands);
        }

        const activeGesture = (handData.hands.length > 0 && handData.hands[0].gesture)
            ? handData.hands[0].gesture
            : 'NONE';

        let faceModeActive = false;
        if (activeGesture === "PEACE" && handData.face) {
            faceModeActive = true;
        }

        // 3. Apply standard forces OR Map Face Matrix Hologram
        if (!faceModeActive) {
            applyForces(particles, handData.hands, w, h);
            for (let i = 0; i < particles.length; i++) {
                // If it was just in FaceMode, shatter organic cloudburst on release
                if (particles[i].isFaceMode) {
                    particles[i].isFaceMode = false;
                    particles[i].vx += (Math.random() - 0.5) * 8.0;
                    particles[i].vy += (Math.random() - 0.5) * 8.0;
                }
            }
        } else {
            const facePoints = handData.face;
            const len = facePoints.length;
            const C = (Math.min(w, h) / 480) * 0.85; 

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                const fp = facePoints[i % len];
                const dxReal = fp.x - 0.5;
                const dyReal = fp.y - 0.5;

                p.targetX = w/2 + dxReal * 640 * C + (Math.random() - 0.5) * 6;
                p.targetY = h/2 + dyReal * 480 * C + (Math.random() - 0.5) * 6;
                p.isFaceMode = true;
            }
        }

        // 4. Update physics and draw each particle
        for (const particle of particles) {
            particle.update(w, h);
            particle.draw(ctx);
        }

        // 5. FPS tracking — rolling last 60 timestamps
        const now = performance.now();
        timestamps.push(now);
        if (timestamps.length > 60) timestamps.shift();
        const fps = calculateFPS();

        // 6. Draw HUD overlay

        // Draw large "No Hand Detected" warning in center of canvas
        if (handData.hands.length === 0) {
            ctx.save();
            ctx.globalAlpha = 0.5; // Slightly transparent neon look
            ctx.fillStyle = '#00ffff';
            ctx.font = 'bold 32px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowBlur = 24;
            ctx.shadowColor = '#00ffff';
            if (typeof ctx.letterSpacing !== 'undefined') {
                ctx.letterSpacing = "4px";
            }
            ctx.fillText('NO HAND DETECTED', w / 2, h / 2);
            ctx.restore();
        }

        ctx.save();
        ctx.globalAlpha = 0.85;
        ctx.fillStyle = '#00ffff';
        ctx.font = '13px monospace';
        // Shifted Y positions from ~20px to ~80px to clear the 54px modern Navbar
        ctx.fillText('GESTURE: ' + activeGesture, 16, 80);
        ctx.fillText('PARTICLES: ' + particles.length, 16, 100);
        ctx.fillText('FPS: ' + fps, 16, 120);
        ctx.restore();

        requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
}
