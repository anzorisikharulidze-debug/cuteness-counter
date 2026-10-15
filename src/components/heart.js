import { LitElement, html, css } from 'lit';
import * as THREE from 'three';

export class CutenessHeart extends LitElement {
  static styles = css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
      min-width: 100px;
      min-height: 100px;
    }

    .canvas-container {
      width: 100%;
      height: 100%;
      position: relative;
    }

    canvas {
      width: 100% !important;
      height: 100% !important;
      display: block;
    }
  `;

  render() {
    return html`
      <div class="canvas-container" id="canvas-container"></div>
    `;
  }

  firstUpdated() {
    // Небольшая задержка или дождаться следующего кадра, 
    // чтобы контейнер успел получить реальные размеры из DOM
    requestAnimationFrame(() => {
      this.initThree();
    });
  }

  initThree() {
    const container = this.shadowRoot.getElementById('canvas-container');
    let width = container.clientWidth;
    let height = container.clientHeight;

    // Страховка на случай, если размеры всё еще 0
    if (width === 0 || height === 0) {
      width = 300;
      height = 300;
    }

    const scene = new THREE.Scene();
    
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 100);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // --- Освещение ---
    const ambientLight = new THREE.AmbientLight(0x2a080d, 2.2);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0x7a1222, 3.0);
    mainLight.position.set(10, 40, 30);
    scene.add(mainLight);

    // --- Геометрия сердца ---
    const heartShape = new THREE.Shape();
    const x = 0, y = 0;
    
    heartShape.moveTo(x + 5, y + 5);
    heartShape.bezierCurveTo(x + 5, y + 5, x + 4, y, x, y);
    heartShape.bezierCurveTo(x - 6, y, x - 6, y + 7, x - 6, y + 7);
    heartShape.bezierCurveTo(x - 6, y + 11, x - 2, y + 15.5, x + 5, y + 20);
    heartShape.bezierCurveTo(x + 12, y + 15.5, x + 16, y + 11, x + 16, y + 7);
    heartShape.bezierCurveTo(x + 16, y + 7, x + 16, y, x + 10, y);
    heartShape.bezierCurveTo(x + 6, y, x + 5, y + 5, x + 5, y + 5);

    const extrudeSettings = {
      depth: 1,
      bevelEnabled: true,
      bevelSegments: 12,
      steps: 2,
      bevelSize: 8,
      bevelThickness: 8,
    };

    const geometry = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
    geometry.center();

    // --- Материал ---
    const material = new THREE.MeshPhysicalMaterial({
      color: 0xb51010,
      emissive: 0x4a0018,
      metalness: 0.1,
      roughness: 0.35,
      transmission: 0.2,
      thickness: 2.0,
      transparent: false,
      opacity: 0.98,
      ior: 1.4
    });

    const heartMesh = new THREE.Mesh(geometry, material);
    heartMesh.rotation.x = Math.PI; 
    scene.add(heartMesh);

    // Используем современный THREE.Timer вместо устаревшего Clock
    const timer = new THREE.Timer();

    const animate = (timestamp) => {
      requestAnimationFrame(animate);
      
      timer.update(timestamp);
      const elapsedTime = timer.getElapsed();
      
      heartMesh.rotation.y = elapsedTime * 0.4;
      
      const pulse = 1 + Math.sin(elapsedTime * 1.5) * 0.015;
      heartMesh.scale.set(pulse, pulse, pulse);

      renderer.render(scene, camera);
    };

    requestAnimationFrame(animate);

    // --- ResizeObserver для адаптивности ---
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const newWidth = entry.contentRect.width;
        const newHeight = entry.contentRect.height;
        
        if (newWidth > 0 && newHeight > 0) {
          camera.aspect = newWidth / newHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(newWidth, newHeight);
        }
      }
    });

    resizeObserver.observe(container);
  }
}

customElements.define('cuteness-heart', CutenessHeart);