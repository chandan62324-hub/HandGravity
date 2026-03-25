/**
 * @file gestures.js
 * @description Analyzes hand tracking landmarks to classify real-time gestures. 
 * Provides static gesture classification for SWIRL, GRAB, ATTRACT, REPEL, and NONE
 * based on spatial landmark relationships.
 */
"use strict";

/**
 * Calculates the Euclidean distance between two 2D points.
 * @param {{x: number, y: number}} p1 - First point
 * @param {{x: number, y: number}} p2 - Second point
 * @returns {number} The distance between the points
 */
function getDistance(p1, p2) {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Classifies the current gesture based on hand landmarks.
 * 
 * Priority order: SWIRL > GRAB > ATTRACT > REPEL > NONE
 * 
 * @param {Array<{x: number, y: number, z: number, visibility?: number}>} landmarks - Array of 21 landmark points for a single hand
 * @param {number} totalHands - The total number of hands currently detected
 * @returns {string} The classified gesture ("SWIRL", "GRAB", "ATTRACT", "REPEL", or "NONE")
 */
export function classifyGesture(landmarks, totalHands) {
    // Safety checks for valid hand landmarks
    if (!landmarks || landmarks.length < 21) {
        return "NONE";
    }

    // Priority 1: PEACE (FaceMatrix Hologram Mode)
    const lm = landmarks;
    const isIndexUp = lm[8].y < lm[6].y && lm[6].y < lm[5].y;
    const isMiddleUp = lm[12].y < lm[10].y && lm[10].y < lm[9].y;
    const isRingDown = lm[16].y > lm[14].y;
    const isPinkyDown = lm[20].y > lm[18].y;

    if (isIndexUp && isMiddleUp && isRingDown && isPinkyDown) {
        return "PEACE";
    }

    // Priority 2: SWIRL
    if (totalHands === 2) {
        return "SWIRL";
    }

    // Priority 2: GRAB (Pinch)
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    const pinchDistance = getDistance(thumbTip, indexTip);
    
    if (pinchDistance < 0.07) {
        return "GRAB";
    }

    // Measure average extension of all 5 fingers from the wrist (landmark 0)
    const wrist = landmarks[0];
    const fingertipIndices = [4, 8, 12, 16, 20]; // Thumb, Index, Middle, Ring, Pinky
    
    let totalExtension = 0;
    for (const idx of fingertipIndices) {
        totalExtension += getDistance(wrist, landmarks[idx]);
    }
    const averageExtension = totalExtension / fingertipIndices.length;

    // Priority 3: ATTRACT (Open Palm)
    if (averageExtension > 0.25) {
        return "ATTRACT";
    }

    // Priority 4: REPEL (Fist)
    if (averageExtension < 0.12) {
        return "REPEL";
    }

    // Priority 5: NONE
    return "NONE";
}
