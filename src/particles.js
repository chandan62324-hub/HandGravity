/**
 * @file particles.js
 * @description Defines the Particle class and factory utilities for the HandGravity neon particle system.
 * Each particle has randomized position, velocity, color, size, and opacity, and supports
 * physics-based update (gravity, friction, boundary bounce) and neon glow canvas rendering.
 */
"use strict";

/**
 * Pre-defined color palettes for particles.
 */
export const THEMES = {
    cyberpunk: ["#00ffff", "#ff00ff", "#00ff88", "#ff6600", "#8800ff"],
    fire:      ["#ff3300", "#ff6600", "#ffbb00", "#ffdd33", "#ff0033"],
    ocean:     ["#00ccff", "#0088ff", "#0044ff", "#00eeff", "#ffffff"]
};

/**
 * Auto-detect particle count based on CPU core count, or load from user settings.
 * @type {number}
 */
export const PARTICLE_COUNT = localStorage.getItem('particleCount') 
    ? parseInt(localStorage.getItem('particleCount', 10)) 
    : (navigator.hardwareConcurrency < 4 ? 3000 : 8000);

/**
 * Represents a single neon particle in the HandGravity system.
 */
export class Particle {
    /**
     * Creates a new Particle at a random position within the canvas.
     * @param {number} canvasWidth - Width of the canvas
     * @param {number} canvasHeight - Height of the canvas
     * @param {string[]} colors - Array of hex colors for the theme
     */
    constructor(canvasWidth, canvasHeight, colors) {
        this.x = Math.random() * canvasWidth;
        this.y = Math.random() * canvasHeight;
        this.vx = (Math.random() - 0.5) * 4.0; // Faster initial burst
        this.vy = (Math.random() - 0.5) * 4.0;
        
        const palette = colors || THEMES.cyberpunk;
        this.color = palette[Math.floor(Math.random() * palette.length)];
        
        this.radius = 1.5 + Math.random() * 1.5; // random in [1.5, 3.0]
        this.alpha = 0.6 + Math.random() * 0.4;  // random in [0.6, 1.0]
        
        // Hologram properties
        this.isFaceMode = false;
        this.targetX = this.x;
        this.targetY = this.y;
    }

    /**
     * Updates particle physics each frame: applies gravity, friction, moves position,
     * and bounces off canvas boundaries.
     * @param {number} canvasWidth - Width of the canvas
     * @param {number} canvasHeight - Height of the canvas
     */
    update(canvasWidth, canvasHeight) {
        if (this.isFaceMode) {
            // High Energy Spring Physics towards Hologram Target
            const dx = this.targetX - this.x;
            const dy = this.targetY - this.y;
            
            // Steer aggressively towards target
            this.vx += dx * 0.15;
            this.vy += dy * 0.15;
            
            // Absolute dampening to snap instantly into place but wobble organically
            this.vx *= 0.65;
            this.vy *= 0.65;

            this.x += this.vx;
            this.y += this.vy;
            return; // completely bypass standard gravity, friction, and window bouncing
        }

        // Apply gravity
        this.vy += 0.06;

        // Apply friction
        this.vx *= 0.99;
        this.vy *= 0.99;

        // Update position
        this.x += this.vx;
        this.y += this.vy;

        // Boundary bounce on X axis
        if (this.x < 0) {
            this.x = 0;
            this.vx = -this.vx * 0.6;
        } else if (this.x > canvasWidth) {
            this.x = canvasWidth;
            this.vx = -this.vx * 0.6;
        }

        // Boundary bounce on Y axis
        if (this.y < 0) {
            this.y = 0;
            this.vy = -this.vy * 0.6;
        } else if (this.y > canvasHeight) {
            this.y = canvasHeight;
            this.vy = -this.vy * 0.6;
        }
    }

    /**
     * Renders the particle as a neon glowing circle onto the canvas.
     * @param {CanvasRenderingContext2D} ctx - The 2D canvas rendering context
     */
    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.shadowBlur = 12;
        ctx.shadowColor = this.color;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

/**
 * Creates an array of Particle instances to populate the canvas.
 * @param {number} count - Number of particles to create
 * @param {number} w - Canvas width
 * @param {number} h - Canvas height
 * @returns {Particle[]} Array of initialized Particle instances
 */
export function createParticles(count, w, h) {
    const themeName = localStorage.getItem('particleTheme') || 'cyberpunk';
    const colors = THEMES[themeName] || THEMES.cyberpunk;
    return Array.from({ length: count }, () => new Particle(w, h, colors));
}
