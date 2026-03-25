<div align="center">

![HandGravity Hero](./assets/hero_banner.png)

# HandGravity 🌌

**Transform your webcam into a physical interaction field with high-energy neon particles.**

[![Demo Status](https://img.shields.io/badge/Status-Beta-brightgreen.svg)]()
[![License](https://img.shields.io/badge/License-MIT-blue.svg)]()
[![MediaPipe](https://img.shields.io/badge/Engine-MediaPipe_Holistic-FF6F00.svg)]()
[![Language](https://img.shields.io/badge/Language-Vanilla_JS-F7DF1E.svg)]()
[![Style](https://img.shields.io/badge/Styling-CSS_Glassmorphism-239120.svg)]()

</div>

---

HandGravity is a premium, real-time holographic particle system controlled entirely by hand gestures. Powered by **MediaPipe Holistic** and **HTML5 Canvas**, it transforms your webcam into a physical interaction field where thousands of neon particles react to your movements with fluid, high-energy physics.

The centerpiece of the experience is the **FaceMatrix Hologram**, a feature that maps the entire particle field into a real-time 3D tracking of your face.

---

## ✨ Key Features

- **🧬 FaceMatrix Hologram Mapping**: Snap 15,000 particles into a 468-point 3D mesh of your face in real-time.
- **✋ Gesture-Driven Physics**: Five distinct interaction states (Attract, Repel, Grab, Swirl, and Peace).
- **🚀 High-Performance Rendering**: Sustained 60 FPS performance using optimized 2D Canvas loops and physics vector math.
- **🎨 Customizable Aesthetics**: Choose between *Cyberpunk*, *Magma*, and *Deep Ocean* themes.
- **🛠️ Persistent UI Settings**: Modern glassmorphism navbar and context menus that save your preferences to `localStorage`.
- **🎥 Dynamic Webcam UI**: Right-click the webcam preview to resize and reposition it to any corner.

---

> [!IMPORTANT]
> **Privacy Note**: All hand and face tracking is processed **locally** in your browser via WASM. No video data is ever sent to a server.

---

## 🎮 Interaction Guide

| Gesture | Interaction | Technical Rule |
| :--- | :--- | :--- |
| **Peace Sign** | `FaceMatrix` | **HOLOGRAPHIC MODE**: Particles snap into a 3D face mesh. |
| **Open Palm** | `ATTRACT` | Particles move toward your palm center via gravitational pull. |
| **Fist** | `REPEL` | **EXPLOSION**: A high-velocity kinetic blast pushes particles away. |
| **Pinch** | `GRAB` | **STILLNESS**: Particles stick to your fingertips for precision control. |
| **Two Hands** | `SWIRL` | **VORTEX**: Creates a whirlpool between your two active palms. |
| **No Hand** | `DRIFT` | **GRAVITY**: Particles drift slowly downward with low friction. |

---

## 🛠️ Getting Started (After Cloning)

Setting up HandGravity locally is designed to be **instant and dependency-free**. Because everything is powered by standard Web CDNs and Vanilla JS, you do not need to run `npm install`.

### 1. Prerequisites
- **Webcam**: Essential for interaction.
- **Chrome/Edge**: Optimized for MediaPipe WASM acceleration.

### 2. Step-by-Step Installation
Follow these steps once you have cloned the repository:

1. **Open the Project Folder**:
   ```bash
   cd HandGravity
   ```

2. **No Dependencies Needed**: 
   Since we use **MediaPipe via CDN**, you can ignore running `npm install`. All libraries load directly in the browser.

3. **Serve the Project**:
   For security reasons, browsers block webcam access for local files (`file://`). You **must** serve the folder through a local server:
   - **VS Code**: Use the **Live Server** extension.
   - **Python**: Run `python -m http.server 8000`.
   - **Node.js**: Run `npx http-server .`.

4. **Launch & Permissions**: Navigate to `http://localhost:8000`, click **Allow** camera access, and wait for initialization.

---

## ⚙️ Configuration & Customization

### 🧬 Settings Modal (⚙)
Adjust **Particle Density** (1,000–15,000) and switch between vibrant **Color Themes**.

### 🎥 Webcam Layout (Right-Click)
Access the contextual menu to change window **Size** and snap it to any of the 4 screen **Positions**.

---

## 🏗️ Technical Architecture

> [!TIP]
> **Performance Tip**: If the FPS drops below 60, try reducing the particle density in the Settings menu toggle.

- **`tracking.js`**: Orchestrates **MediaPipe Holistic**. Extracts simultaneous hand landmarks and facial geometry.
- **`gestures.js`**: Hand-landmark analysis engine for classifying high-level interaction states.
- **`particles.js`**: Core physics engine. Manages velocity vectors, gravity ($g = 0.06$), friction ($f = 0.99$), and "FaceMode" spring targets.
- **`forces.js`**: Vector math implementation for directional interaction forces ($F = G \frac{m_1 m_2}{r^2}$).
- **`renderer.js`**: The main `requestAnimationFrame` driver. Manages the trail-fade effect ($\alpha = 0.15$) and the dynamic HUD.

---

## 🛡️ Support & Future Roadmap
- [ ] **Sonic Gravity**: Web Audio API integration for motion-synth textures.
- [ ] **Chromatic Aberration**: Post-processing on high-energy blasts.
- [ ] **Custom Palettes**: Hexadecimal color theme selection.

Optimized for Chromium-based browsers. Created with ❤️ for interactive art. 🌌
