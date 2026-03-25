/**
 * @file main.js
 * @description Entry point for HandGravity. Wires together webcam tracking, gesture
 * classification, particle creation, force application, and the render loop.
 * Handles loading states, error display, and canvas resize.
 */
"use strict";

import { initTracking, handData } from './tracking.js';
import { classifyGesture } from './gestures.js';
import { createParticles, PARTICLE_COUNT } from './particles.js';
import { applyForces } from './forces.js';
import { startRenderLoop } from './renderer.js';

document.addEventListener('DOMContentLoaded', async () => {
    const canvas  = document.getElementById('particleCanvas');
    const loading = document.getElementById('loading');
    const errorEl = document.getElementById('error');

    try {
        // a. Size canvas to viewport
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;

        // b. Create particle system
        const particles = createParticles(PARTICLE_COUNT, canvas.width, canvas.height);

        // --- UI & SETTINGS LOGIC ---
        const settingsBtn = document.getElementById('settingsBtn');
        const settingsModal = document.getElementById('settingsModal');
        const closeSettingsBtn = document.getElementById('closeSettingsBtn');
        const saveSettingsBtn = document.getElementById('saveSettingsBtn');
        const particleInput = document.getElementById('particleCountInput');
        const particleValue = document.getElementById('particleCountValue');
        const themeSelect = document.getElementById('colorThemeSelect');

        particleInput.value = particles.length;
        particleValue.textContent = particleInput.value;
        themeSelect.value = localStorage.getItem('particleTheme') || 'cyberpunk';

        settingsBtn.addEventListener('click', () => {
            settingsModal.classList.remove('hidden');
        });

        closeSettingsBtn.addEventListener('click', () => {
            settingsModal.classList.add('hidden');
            // reset visual elements back to actual saved state
            particleInput.value = particles.length; 
            particleValue.textContent = particleInput.value;
            themeSelect.value = localStorage.getItem('particleTheme') || 'cyberpunk';
        });

        particleInput.addEventListener('input', () => {
            particleValue.textContent = particleInput.value;
        });

        saveSettingsBtn.addEventListener('click', () => {
            const count = parseInt(particleInput.value, 10);
            const theme = themeSelect.value;

            localStorage.setItem('particleCount', count);
            localStorage.setItem('particleTheme', theme);
            
            settingsModal.classList.add('hidden');
            
            // Re-initialize particles smoothly in place with new counts and/or colors
            particles.length = 0;
            const newParticles = createParticles(count, canvas.width, canvas.height);
            for (const p of newParticles) particles.push(p);
        });

        // --- WEBCAM CONTEXT MENU LOGIC ---
        const webcamContainer = document.getElementById('webcamContainer');
        const contextMenu = document.getElementById('webcamContextMenu');

        // Apply saved preferences immediately
        const savedSize = localStorage.getItem('webcamSize') || 'medium';
        const savedPos = localStorage.getItem('webcamPos') || 'bottom-right';
        applyWebcamStyle(savedSize, savedPos);

        webcamContainer.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            
            // Keep menu nicely within window bounds
            const menuWidth = 160;
            const menuHeight = 280;
            let left = e.pageX;
            let top = e.pageY;
            
            if (left + menuWidth > window.innerWidth) left = window.innerWidth - menuWidth - 10;
            if (top + menuHeight > window.innerHeight) top = window.innerHeight - menuHeight - 10;

            contextMenu.style.left = `${left}px`;
            contextMenu.style.top = `${top}px`;
            contextMenu.classList.remove('hidden');
        });

        // Hide menu on outside click
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#webcamContextMenu')) {
                contextMenu.classList.add('hidden');
            }
        });

        contextMenu.addEventListener('click', (e) => {
            if (e.target.classList.contains('menu-item')) {
                const action = e.target.getAttribute('data-action');
                const val = e.target.getAttribute('data-value');
                
                let currentSize = localStorage.getItem('webcamSize') || 'medium';
                let currentPos = localStorage.getItem('webcamPos') || 'bottom-right';

                if (action === 'resize') currentSize = val;
                if (action === 'move') currentPos = val;

                localStorage.setItem('webcamSize', currentSize);
                localStorage.setItem('webcamPos', currentPos);
                
                applyWebcamStyle(currentSize, currentPos);
                contextMenu.classList.add('hidden');
            }
        });

        function applyWebcamStyle(size, pos) {
            // Apply Box Size
            if (size === 'small') {
                webcamContainer.style.width = '120px';
                webcamContainer.style.height = '90px';
            } else if (size === 'large') {
                webcamContainer.style.width = '240px';
                webcamContainer.style.height = '180px';
            } else { // medium
                webcamContainer.style.width = '160px';
                webcamContainer.style.height = '120px';
            }

            // Apply Box Position
            webcamContainer.style.top = 'auto';
            webcamContainer.style.bottom = 'auto';
            webcamContainer.style.left = 'auto';
            webcamContainer.style.right = 'auto';

            if (pos === 'top-left') {
                webcamContainer.style.top = '66px'; // just below the 50px navbar + padding
                webcamContainer.style.left = '16px';
            } else if (pos === 'top-right') {
                webcamContainer.style.top = '66px';
                webcamContainer.style.right = '16px';
            } else if (pos === 'bottom-left') {
                webcamContainer.style.bottom = '16px';
                webcamContainer.style.left = '16px';
            } else { // bottom-right
                webcamContainer.style.bottom = '16px';
                webcamContainer.style.right = '16px';
            }
        }

        // c. Start webcam + MediaPipe tracking
        await initTracking();

        // d. Start render loop
        startRenderLoop(canvas, particles, handData, classifyGesture, applyForces);

        // e. Fade out loading screen
        loading.style.opacity = '0';
        setTimeout(() => { loading.style.display = 'none'; }, 500);

        // f. Handle window resize
        window.addEventListener('resize', () => {
            canvas.width  = window.innerWidth;
            canvas.height = window.innerHeight;
        });

    } catch (err) {
        // g. Show error message on failure
        console.error('HandGravity init failed:', err);
        errorEl.style.display = 'block';
        errorEl.textContent   = '⚠ ' + (err.message || 'Failed to initialize. Check webcam permissions.');
        loading.style.display = 'none';
    }
});
