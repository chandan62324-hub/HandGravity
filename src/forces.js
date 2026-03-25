/**
 * @file forces.js
 * @description Applies gesture-based physical forces (attract, repel, grab, swirl) to particles 
 * based on hand locations and classified gestures.
 */
"use strict";

import { classifyGesture } from './gestures.js';

/**
 * Iterates through active particles and applies forces depending on the hand gestures.
 * 
 * @param {Array<Object>} particles - Array of particle instances
 * @param {Array<Object>} hands - Array of tracked hands with landmarks and palmCenter
 * @param {number} canvasWidth - Width of the rendering canvas
 * @param {number} canvasHeight - Height of the rendering canvas
 */
export function applyForces(particles, hands, canvasWidth, canvasHeight) {
    if (!particles || !hands || hands.length === 0) return;

    const totalHands = hands.length;
    let isSwirl = (totalHands === 2);
    let gesture = "NONE";
    
    let midX = 0, midY = 0;
    let palmX = 0, palmY = 0;

    // Calculate main interaction points depending on hand count
    if (isSwirl) {
        gesture = "SWIRL";
        const p1x = hands[0].palmCenter.x * canvasWidth;
        const p1y = hands[0].palmCenter.y * canvasHeight;
        const p2x = hands[1].palmCenter.x * canvasWidth;
        const p2y = hands[1].palmCenter.y * canvasHeight;
        midX = (p1x + p2x) / 2;
        midY = (p1y + p2y) / 2;
    } else {
        const hand = hands[0];
        // Use pre-classified gesture or calculate it live
        gesture = hand.gesture || classifyGesture(hand.landmarks, totalHands);
        palmX = hand.palmCenter.x * canvasWidth;
        palmY = hand.palmCenter.y * canvasHeight;
    }

    if (gesture === "NONE") return;

    // Apply forces to particles
    for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (gesture === "SWIRL") {
            // SWIRL (two hands) — within 250px of midpoint
            const dx = p.x - midX;
            const dy = p.y - midY;
            const distStr = Math.sqrt(dx * dx + dy * dy);
            const dist = distStr === 0 ? 0.001 : distStr;

            if (dist < 400) {
                const angle = Math.atan2(p.y - midY, p.x - midX);
                p.vx += -Math.sin(angle) * 3.5;
                p.vy += Math.cos(angle) * 3.5;
            }
        } else {
            // Single hand interactions
            const dx = palmX - p.x;
            const dy = palmY - p.y;
            const distStr = Math.sqrt(dx * dx + dy * dy);
            const dist = distStr === 0 ? 0.001 : distStr;

            if (gesture === "ATTRACT") {
                // ATTRACT (open palm) — within 400px
                if (dist < 400) {
                    const F = 2.5 * (1 - dist / 400);
                    p.vx += (dx / dist) * F;
                    p.vy += (dy / dist) * F;
                }
            } else if (gesture === "REPEL") {
                // REPEL (fist) — within 500px (Huge blast)
                if (dist < 500) {
                    const F = 10.0 * (1 - dist / 500);
                    p.vx -= (dx / dist) * F + (Math.random() - 0.5); // Add kinetic jitter
                    p.vy -= (dy / dist) * F + (Math.random() - 0.5);
                }
            } else if (gesture === "GRAB") {
                // GRAB (pinch) — within 120px
                if (dist < 120) {
                    p.vx = dx * 0.25; // Snappier stick
                    p.vy = dy * 0.25;
                }
            }
        }
    }
}
