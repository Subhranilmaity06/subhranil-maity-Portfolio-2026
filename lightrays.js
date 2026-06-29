import { Renderer, Program, Triangle, Mesh } from 'https://unpkg.com/ogl@1.0.11/dist/ogl.mjs';

/**
 * LightRays Background - Vanilla JS ES Module
 * Ported from the React component to integrate with Retro OS
 */

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("lightrays-bg-container");
  if (!container) return;

  // Configuration for the light rays effect
  const config = {
    raysOrigin: 'top-center', // Try 'top-center', 'left', 'bottom-right', etc.
    raysColor: '#ff69b4',     // Using --retro-pink for a vaporwave/retro aesthetic
    raysSpeed: 1.5,
    lightSpread: 1.2,
    rayLength: 1.8,
    pulsating: false,
    fadeDistance: 1.0,
    saturation: 1.0,
    followMouse: true,
    mouseInfluence: 0.3,
    noiseAmount: 0.03,
    distortion: 0.08
  };

  const hexToRgb = (hex) => {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return m ? [parseInt(m[1], 16) / 255, parseInt(m[2], 16) / 255, parseInt(m[3], 16) / 255] : [1, 1, 1];
  };

  const getAnchorAndDir = (origin, w, h) => {
    const outside = 0.2;
    switch (origin) {
      case 'top-left':
        return { anchor: [0, -outside * h], dir: [0.7, 0.7] };
      case 'top-right':
        return { anchor: [w, -outside * h], dir: [-0.7, 0.7] };
      case 'left':
        return { anchor: [-outside * w, 0.5 * h], dir: [1, 0] };
      case 'right':
        return { anchor: [(1 + outside) * w, 0.5 * h], dir: [-1, 0] };
      case 'bottom-left':
        return { anchor: [0, (1 + outside) * h], dir: [0.7, -0.7] };
      case 'bottom-center':
        return { anchor: [0.5 * w, (1 + outside) * h], dir: [0, -1] };
      case 'bottom-right':
        return { anchor: [w, (1 + outside) * h], dir: [-0.7, -0.7] };
      default: // "top-center"
        return { anchor: [0.5 * w, -outside * h], dir: [0, 1] };
    }
  };

  // State
  let animationId = null;
  const mouse = { x: 0.5, y: 0.5 };
  const smoothMouse = { x: 0.5, y: 0.5 };

  // Mouse tracking
  if (config.followMouse) {
    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX / window.innerWidth;
      mouse.y = e.clientY / window.innerHeight;
    });
  }

  const initializeWebGL = async () => {
    const renderer = new Renderer({
      dpr: Math.min(window.devicePixelRatio, 2),
      alpha: true
    });
    
    const gl = renderer.gl;
    gl.canvas.style.width = '100%';
    gl.canvas.style.height = '100%';
    gl.canvas.style.display = 'block';

    container.appendChild(gl.canvas);

    const vert = `
      attribute vec2 position;
      varying vec2 vUv;
      void main() {
        vUv = position * 0.5 + 0.5;
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    const frag = `
      precision highp float;
      uniform float iTime;
      uniform vec2  iResolution;
      uniform vec2  rayPos;
      uniform vec2  rayDir;
      uniform vec3  raysColor;
      uniform float raysSpeed;
      uniform float lightSpread;
      uniform float rayLength;
      uniform float pulsating;
      uniform float fadeDistance;
      uniform float saturation;
      uniform vec2  mousePos;
      uniform float mouseInfluence;
      uniform float noiseAmount;
      uniform float distortion;
      varying vec2 vUv;

      float noise(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
      }

      float rayStrength(vec2 raySource, vec2 rayRefDirection, vec2 coord,
                        float seedA, float seedB, float speed) {
        vec2 sourceToCoord = coord - raySource;
        vec2 dirNorm = normalize(sourceToCoord);
        float cosAngle = dot(dirNorm, rayRefDirection);
        
        float d = distortion * sin(iTime * 1.5 + length(sourceToCoord) * 0.005);
        float distortedAngle = cosAngle + d;
        
        float spreadFactor = pow(max(distortedAngle, 0.0), 1.0 / max(lightSpread, 0.001));
        float distance = length(sourceToCoord);
        float maxDistance = max(iResolution.x, iResolution.y) * rayLength;
        float lengthFalloff = clamp((maxDistance - distance) / maxDistance, 0.0, 1.0);
        
        float fadeFactor = fadeDistance * max(iResolution.x, iResolution.y);
        float fadeFalloff = clamp((fadeFactor - distance) / fadeFactor, 0.0, 1.0);
        
        float pulse = pulsating > 0.5 ? (0.85 + 0.15 * sin(iTime * speed * 4.0)) : 1.0;
        
        float baseStrength = clamp(
          (0.5 + 0.2 * sin(distortedAngle * seedA + iTime * speed)) +
          (0.3 + 0.2 * cos(-distortedAngle * seedB + iTime * speed * 0.8)),
          0.0, 1.0
        );
        
        return baseStrength * lengthFalloff * fadeFalloff * spreadFactor * pulse;
      }

      void main() {
        vec2 fragCoord = gl_FragCoord.xy;
        vec2 coord = vec2(fragCoord.x, fragCoord.y);
        
        vec2 finalRayDir = normalize(rayDir);
        if (mouseInfluence > 0.0) {
          vec2 mouseScreenPos = mousePos * iResolution.xy;
          vec2 mouseDirection = normalize(mouseScreenPos - rayPos);
          finalRayDir = normalize(mix(finalRayDir, mouseDirection, mouseInfluence));
        }

        float r1 = rayStrength(rayPos, finalRayDir, coord, 45.2, 31.4, 0.8 * raysSpeed);
        float r2 = rayStrength(rayPos, finalRayDir, coord, 28.5, 19.8, 1.2 * raysSpeed);
        float r3 = rayStrength(rayPos, finalRayDir, coord, 12.1, 56.2, 0.5 * raysSpeed);
        
        float combined = (r1 * 0.4 + r2 * 0.4 + r3 * 0.2);
        combined = pow(combined, 0.7); // Boost mid-tones for visibility
        combined *= 1.5; // Overall intensity boost
        vec3 finalColor = raysColor * combined;
        
        if (noiseAmount > 0.0) {
          float n = noise(coord * 0.01 + iTime * 0.05);
          finalColor *= (1.0 - noiseAmount + noiseAmount * n);
        }

        if (saturation != 1.0) {
          float gray = dot(finalColor, vec3(0.299, 0.587, 0.114));
          finalColor = mix(vec3(gray), finalColor, saturation);
        }

        gl_FragColor = vec4(finalColor, combined);
      }
    `;

    const uniforms = {
      iTime: { value: 0 },
      iResolution: { value: [1, 1] },
      rayPos: { value: [0, 0] },
      rayDir: { value: [0, 1] },
      raysColor: { value: hexToRgb(config.raysColor) },
      raysSpeed: { value: config.raysSpeed },
      lightSpread: { value: config.lightSpread },
      rayLength: { value: config.rayLength },
      pulsating: { value: config.pulsating ? 1.0 : 0.0 },
      fadeDistance: { value: config.fadeDistance },
      saturation: { value: config.saturation },
      mousePos: { value: [0.5, 0.5] },
      mouseInfluence: { value: config.mouseInfluence },
      noiseAmount: { value: config.noiseAmount },
      distortion: { value: config.distortion }
    };

    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex: vert,
      fragment: frag,
      uniforms,
      transparent: true
    });
    const mesh = new Mesh(gl, { geometry, program });

    const updatePlacement = () => {
      const wCSS = window.innerWidth;
      const hCSS = window.innerHeight;
      renderer.setSize(wCSS, hCSS);
      
      const dpr = renderer.dpr;
      const w = wCSS * dpr;
      const h = hCSS * dpr;
      
      uniforms.iResolution.value = [w, h];
      const { anchor, dir } = getAnchorAndDir(config.raysOrigin, w, h);
      uniforms.rayPos.value = anchor;
      uniforms.rayDir.value = dir;
    };

    const loop = (t) => {
      uniforms.iTime.value = t * 0.001;
      
      if (config.followMouse && config.mouseInfluence > 0.0) {
        const smoothing = 0.95;
        smoothMouse.x = smoothMouse.x * smoothing + mouse.x * (1 - smoothing);
        smoothMouse.y = smoothMouse.y * smoothing + mouse.y * (1 - smoothing);
        // Note: Y is flipped for WebGL coords
        uniforms.mousePos.value = [smoothMouse.x, 1.0 - smoothMouse.y];
      }

      renderer.render({ scene: mesh });
      animationId = requestAnimationFrame(loop);
    };

    window.addEventListener('resize', updatePlacement);
    updatePlacement();
    animationId = requestAnimationFrame(loop);
  };

  initializeWebGL();
});
