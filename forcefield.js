// Force Field Background - Vanilla JS Implementation
// Ported from React component to integrate with Retro OS

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("p5-bg-container");
  if (!container) return;

  // Global mouse tracking since the container has pointer-events: none
  let globalMouseX = window.innerWidth / 2;
  let globalMouseY = window.innerHeight / 2;
  
  window.addEventListener('mousemove', (e) => {
    globalMouseX = e.clientX;
    globalMouseY = e.clientY;
  });

  const sketch = (p) => {
    // Hardcoded config matching the retro aesthetic
    const config = {
      imageUrl: "assets/retro-floppy.png",
      hue: 240,         // Blue hue matching --retro-blue
      saturation: 100,
      threshold: 200,   // Adjust threshold depending on image brightness
      minStroke: 2,
      maxStroke: 6,
      spacing: 8,       // Slightly tighter for blocky pixel feel
      noiseScale: 0,    // 0 noise to keep pixel grid perfect
      density: 2.0,     
      invertImage: false,
      invertWireframe: true,
      magnifierEnabled: true,
      magnifierRadius: 150,
      forceStrength: 10,
      friction: 0.9,
      restoreSpeed: 0.05
    };

    let originalImg;
    let img;
    let palette = [];
    let points = [];
    
    let magnifierX = 0;
    let magnifierY = 0;
    let magnifierInertia = 0.1;

    p.preload = () => {
      originalImg = p.loadImage(config.imageUrl, () => {
        console.log("Retro image loaded");
      }, (err) => {
        console.error("Failed to load retro image", err);
      });
    };

    p.setup = () => {
      if (!originalImg) return;
      
      p.createCanvas(window.innerWidth, window.innerHeight);
      
      magnifierX = p.width / 2;
      magnifierY = p.height / 2;

      processImage();
      generatePalette(config.hue, config.saturation);
      generatePoints();
    };

    p.windowResized = () => {
      p.resizeCanvas(window.innerWidth, window.innerHeight);
      processImage();
      generatePoints();
    };

    function processImage() {
      if (!originalImg) return;
      img = originalImg.get();
      
      // Calculate aspect ratio to fit image beautifully in center
      let imgRatio = img.width / img.height;
      let canvasRatio = p.width / p.height;
      let drawW, drawH;

      // Scale to fit 70% of the screen
      if (canvasRatio > imgRatio) {
        drawH = p.height * 0.7;
        drawW = drawH * imgRatio;
      } else {
        drawW = p.width * 0.7;
        drawH = drawW / imgRatio;
      }

      // Create a temporary canvas matching our screen size to draw the centered image onto
      let pg = p.createGraphics(p.width, p.height);
      pg.background(0); // Black background
      pg.imageMode(p.CENTER);
      pg.image(img, p.width/2, p.height/2, drawW, drawH);
      
      // Extract the drawn image to process
      img = pg.get();
      img.filter(p.GRAY);

      if (config.invertImage) {
        img.loadPixels();
        for (let i = 0; i < img.pixels.length; i += 4) {
          img.pixels[i] = 255 - img.pixels[i];
          img.pixels[i + 1] = 255 - img.pixels[i + 1];
          img.pixels[i + 2] = 255 - img.pixels[i + 2];
        }
        img.updatePixels();
      }
    }

    function generatePalette(h, s) {
      palette = [];
      p.push();
      p.colorMode(p.HSL);
      for (let i = 0; i < 12; i++) {
        let lightness = p.map(i, 0, 11, 95, 5);
        palette.push(p.color(h, s, lightness));
      }
      p.pop();
    }

    function generatePoints() {
      if (!img) return;
      points = [];
      const { spacing, density, noiseScale } = config;
      
      const safeSpacing = Math.max(2, spacing); 

      for (let y = 0; y < img.height; y += safeSpacing) {
        for (let x = 0; x < img.width; x += safeSpacing) {
          if (p.random() > density) continue;
          
          let nx = p.noise(x * noiseScale, y * noiseScale) - 0.5;
          let ny = p.noise((x + 500) * noiseScale, (y + 500) * noiseScale) - 0.5;
          let px = x + nx * safeSpacing;
          let py = y + ny * safeSpacing;
          
          points.push({
            pos: p.createVector(px, py),
            originalPos: p.createVector(px, py),
            vel: p.createVector(0, 0)
          });
        }
      }
    }

    function applyForceField(mx, my) {
      if (!config.magnifierEnabled) return;

      for (let pt of points) {
        let dir = p5.Vector.sub(pt.pos, p.createVector(mx, my));
        let d = dir.mag();
        
        if (d < config.magnifierRadius) {
          dir.normalize();
          let force = dir.mult(config.forceStrength / Math.max(1, d));
          pt.vel.add(force);
        }
        
        pt.vel.mult(config.friction);
        
        let restore = p5.Vector.sub(pt.pos, pt.originalPos).mult(-config.restoreSpeed);
        pt.vel.add(restore);
        
        pt.pos.add(pt.vel);
      }
    }

    p.draw = () => {
      if (!img) return;
      // Clear instead of background(0) so the CSS grid underneath shines through!
      p.clear();

      // Mouse interaction using global coordinates
      magnifierX = p.lerp(magnifierX, globalMouseX, magnifierInertia);
      magnifierY = p.lerp(magnifierY, globalMouseY, magnifierInertia);

      applyForceField(magnifierX, magnifierY);

      img.loadPixels();
      p.noFill();

      for (let pt of points) {
        let x = pt.pos.x;
        let y = pt.pos.y;
        let d = p.dist(x, y, magnifierX, magnifierY);
        
        let px = p.constrain(p.floor(x), 0, img.width - 1);
        let py = p.constrain(p.floor(y), 0, img.height - 1);
        
        let index = (px + py * img.width) * 4;
        let brightness = img.pixels[index]; 
        
        if (brightness === undefined) continue;

        let condition = config.invertWireframe
          ? brightness < config.threshold
          : brightness > config.threshold;

        if (condition) {
          let shadeIndex = Math.floor(p.map(brightness, 0, 255, 0, palette.length - 1));
          shadeIndex = p.constrain(shadeIndex, 0, palette.length - 1);
          
          let strokeSize = p.map(brightness, 0, 255, config.minStroke, config.maxStroke);
          
          if (config.magnifierEnabled && d < config.magnifierRadius) {
            let factor = p.map(d, 0, config.magnifierRadius, 2, 1);
            strokeSize *= factor;
          }
          
          if (palette[shadeIndex]) {
            p.stroke(palette[shadeIndex]);
            p.strokeWeight(strokeSize);
            p.point(x, y);
          }
        }
      }
    };
  };

  new p5(sketch, container);
});
