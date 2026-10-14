import { LitElement, html, css } from 'lit';
import * as THREE from 'three';

export class AppSphere extends LitElement {
  static properties = {
    scale: { type: Number },
    activeState: { type: String }
  };

  static styles = css`
    :host {
      display: block;
      width: 300px;
      height: 300px;
      position: relative;
    }
    canvas {
      width: 100%;
      height: 100%;
      display: block;
    }
  `;

  render() {
    return html`
      <canvas id="webgl-canvas"></canvas>
    `;
  }

  firstUpdated() {
    this.initThree();
  }

  initThree() {
    const canvas = this.shadowRoot.getElementById('webgl-canvas');
    
    // 1. Сцена, камера, рендерер
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    this.camera.position.z = 5;

    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 2. Внешняя прозрачная оболочка (граница сферы)
    const boundsGeometry = new THREE.SphereGeometry(1.8, 32, 32);
    const boundsMaterial = new THREE.MeshBasicMaterial({
      color: 0x4a90e2,
      transparent: true,
      opacity: 0.15,
      wireframe: true
    });
    this.boundsMesh = new THREE.Mesh(boundsGeometry, boundsMaterial);
    this.scene.add(this.boundsMesh);

    // 3. Центральное твердое тело (ядро)
    const coreGeometry = new THREE.IcosahedronGeometry(0.7, 1);
    const coreMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x61dafb, 
      roughness: 0.3, 
      metalness: 0.8,
      wireframe: true 
    });
    this.coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
    this.scene.add(this.coreMesh);

    // 4. Свет
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    this.scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 2);
    pointLight.position.set(5, 5, 5);
    this.scene.add(pointLight);

    // 5. Частицы СТРОГО ВНУТРИ сферы (между ядром [0.7] и границей [1.8])
    const particleCount = 80;
    const particlesGeometry = new THREE.BufferGeometry();
    this.particleData = []; // Для кастомной логики движения внутри
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      // Случайное распределение внутри сферы
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      
      // Радиус строго между ядром и внешней оболочкой
      const r = 0.8 + Math.random() * 0.8; 

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Сохраняем исходные параметры для анимации вихря
      this.particleData.push({ r, theta, phi, speed: 0.005 + Math.random() * 0.01 });
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      color: 0xa1c4fd,
      size: 0.12,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending
    });

    this.particles = new THREE.Points(particlesGeometry, particlesMaterial);
    this.scene.add(this.particles);

    this.animate();
  }

  animate = () => {
    this.animationFrameId = requestAnimationFrame(this.animate);

    // Вращение ядра ТОЛЬКО вокруг оси Y в одну сторону
    if (this.coreMesh) {
      this.coreMesh.rotation.y += 0.007;
    }

    // Внешняя оболочка может чуть-чуть крутиться в другую сторону для объема
    if (this.boundsMesh) {
      this.boundsMesh.rotation.y -= 0.002;
    }

    // Оживляем частицы внутри: заставляем их циркулировать вокруг ядра
    if (this.particles) {
      const positions = this.particles.geometry.attributes.position.array;
      
      for (let i = 0; i < this.particleData.length; i++) {
        let p = this.particleData[i];
        p.theta += p.speed; // вращаем по кругу

        // Пересчитываем координаты, удерживая их внутри сферы
        positions[i * 3] = p.r * Math.sin(p.phi) * Math.cos(p.theta);
        positions[i * 3 + 1] = p.r * Math.sin(p.phi) * Math.sin(p.theta);
        positions[i * 3 + 2] = p.r * Math.cos(p.phi);
      }
      
      this.particles.geometry.attributes.position.needsUpdate = true;
    }

    this.renderer.render(this.scene, this.camera);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    cancelAnimationFrame(this.animationFrameId);
    this.renderer.dispose();
  }
}

customElements.define('app-sphere', AppSphere);