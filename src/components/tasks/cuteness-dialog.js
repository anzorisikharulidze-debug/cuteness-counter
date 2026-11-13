import { LitElement, html, css } from 'lit';
import './cuteness-adult-btn.js';
import './cuteness-task-box.js';

export class CutenessDialog extends LitElement {
  static properties = {
    isOpen: { type: Boolean, reflect: true, attribute: 'is-open' },
    tasks: { type: Array },
    _showTopGlow: { type: Boolean },
    _showBottomGlow: { type: Boolean }
  };

  constructor() {
    super();
    this.isOpen = false;
    this._showTopGlow = false;
    this._showBottomGlow = false;
    this.tasks = [];
  }

  static styles = css`
    :host {
      display: block;
    }

    /* Оверлей фона (затемнение с размытием) */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(5, 1, 3, 0.65);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      box-sizing: border-box;

      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    /* Когда попап открыт */
    :host([is-open]) .modal-backdrop {
      opacity: 1;
      pointer-events: auto;
    }

    /* Само модальное окно в стиле Liquid Glass */
    .modal-content {
      width: 100%;
      max-width: 420px;
      max-height: 80vh;
      border-radius: 36px;
      box-sizing: border-box;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;

      background: linear-gradient(135deg, rgba(255, 255, 255, 0.07) 0%, rgba(255, 255, 255, 0.02) 100%);
      backdrop-filter: blur(28px) saturate(190%);
      -webkit-backdrop-filter: blur(28px) saturate(190%);
      border: 1px solid rgba(255, 130, 180, 0.15);

      box-shadow: 
        inset 0 1px 1px 0 rgba(255, 255, 255, 0.25),
        inset 0 -1px 2px 0 rgba(0, 0, 0, 0.4),
        0 25px 60px -15px rgba(0, 0, 0, 0.8),
        0 0 40px 0 rgba(255, 40, 100, 0.1);

      transform: translateY(20px) scale(0.95);
      transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    }

    :host([is-open]) .modal-content {
      transform: translateY(0) scale(1);
    }

    /* Шим */
    .shimmer {
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(255, 50, 110, 0.05) 0%, transparent 50%, rgba(255, 255, 255, 0.05) 100%);
      pointer-events: none;
      z-index: 1;
    }

    /* Партиклы разбросанные по окну */
    .particle {
      position: absolute;
      pointer-events: none;
      z-index: 2;
      opacity: 0.5;
      filter: drop-shadow(0 0 4px rgba(255, 120, 180, 0.3));
    }

    /* 1. Верхняя группа (около шапки) */
    .p-1  { top: 20px; right: 55px; width: 7px; height: 7px; fill: rgba(255, 140, 190, 0.6); transform: rotate(15deg); }
    .p-6  { top: 42px; left: 20%;     width: 8px; height: 8px; fill: rgba(255, 160, 210, 0.45); transform: rotate(40deg); }
    .p-2  { top: 42%;  left: 17px;  width: 6px; height: 6px; fill: rgba(255, 110, 160, 0.55); transform: rotate(-25deg); }

    /* 2. Средняя группа (плавающие в зоне контента) */
    .p-3  { top: 52%;  right: 14px; width: 8px; height: 8px; fill: rgba(255, 150, 200, 0.45); transform: rotate(35deg); }
    .p-7  { bottom: 50%; left: 16px;  width: 5px; height: 5px; fill: rgba(255, 130, 180, 0.4); transform: rotate(12deg); }
    .p-4  { bottom: 35px; left: 10px; width: 6px; height: 6px; fill: rgba(255, 120, 170, 0.5); transform: rotate(-10deg); }

    /* 3. Нижняя группа (прибитые к низу) */
    .p-5  { bottom: 10px; right: 38px; width: 7px; height: 7px; fill: rgba(255, 100, 150, 0.55); transform: rotate(20deg); }

    /* Шапка модалки */
    .modal-header {
      display: flex;
      align-items: center;
      justify-content: center; /* Центрируем заголовок */
      padding: 24px 24px 16px 24px;
      border-bottom: 1px solid rgba(255, 140, 180, 0.1);
      position: relative;
      z-index: 3;
    }

    .modal-title {
      color: #ffd1dc;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 16px;
      font-weight: 700;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin: 0;
      text-shadow: 0 0 10px rgba(255, 120, 160, 0.4);
      text-align: center;
    }

    /* Кнопка закрытия (крестик) — фиксируем справа в шапке */
    .close-btn {
      position: absolute;
      right: 20px;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 1px solid rgba(255, 140, 180, 0.2);
      background: rgba(255, 255, 255, 0.03);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background 0.2s ease, border-color 0.2s ease;
      -webkit-tap-highlight-color: transparent;
    }

    .close-btn svg {
      width: 14px;
      height: 14px;
      stroke: #ff8ca3;
      stroke-width: 2.5;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .close-btn:active {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 140, 180, 0.4);
    }

    .header-left-btn {
      position: absolute;
      left: 20px;
      display: flex;
      align-items: center;
      transform: scale(0.68);
      transform-origin: left center;
    }

    /* Тело модалки со скроллом для списка заданий */
    .modal-body {
      padding: 20px 24px;
      overflow-y: auto;
      position: relative;
      z-index: 3;
      display: flex;
      flex-direction: column;
      gap: 12px;
      flex-grow: 1;
    }

    /* Кастомный красивый скроллбар */
    .modal-body::-webkit-scrollbar {
      width: 4px;
    }
    .modal-body::-webkit-scrollbar-track {
      background: transparent;
    }
    .modal-body::-webkit-scrollbar-thumb {
      background: rgba(255, 140, 180, 0.2);
      border-radius: 4px;
    }

    /* Заглушка для будущих квестов */
    .quest-placeholder {
      padding: 24px;
      text-align: center;
      color: rgba(255, 209, 220, 0.5);
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 13px;
      letter-spacing: 0.5px;
      background: rgba(255, 255, 255, 0.02);
      border: 1px dashed rgba(255, 140, 180, 0.15);
      border-radius: 20px;
    }

    .scroll-glow-top {
      position: absolute;
      top: 65px; /* сразу под шапкой модального окна */
      left: 0;
      right: 0;
      height: 40px;
      background: linear-gradient(to bottom, rgba(10, 5, 10, 0.95) 0%, rgba(10, 5, 10, 0) 100%);
      pointer-events: none;
      z-index: 4;
      opacity: 1;
      transition: opacity 0.3s ease;
    }

    .scroll-glow-top.hidden {
      opacity: 0;
    }

    .scroll-glow-bottom {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 50px;
      background: linear-gradient(to top, rgba(10, 5, 10, 0.95) 0%, rgba(10, 5, 10, 0) 100%);
      pointer-events: none;
      z-index: 4;
      border-radius: 0;
      opacity: 1;
      transition: opacity 0.3s ease;
    }

    .scroll-glow-bottom.hidden {
      opacity: 0;
    }
  `;

  // Закрытие по клику на подложку
  _handleBackdropClick(e) {
    if (e.target.classList.contains('modal-backdrop')) {
      this.close();
    }
  }

  open() {
    this.isOpen = true;
    this.dispatchEvent(new CustomEvent('modal-open', { bubbles: true, composed: true }));
  }

  close() {
    this.isOpen = false;
    this.dispatchEvent(new CustomEvent('modal-close', { bubbles: true, composed: true }));
  }

  updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has('isOpen') && this.isOpen) {
      this._checkScrollNeed();
    }
  }

  _checkScrollNeed() {
    setTimeout(() => {
      const body = this.shadowRoot.querySelector('.modal-body');
      if (body) {
        const hasScroll = body.scrollHeight > body.clientHeight + 5;
        const isAtTop = body.scrollTop < 5;
        const isAtBottom = body.scrollHeight - body.scrollTop - body.clientHeight < 5;

        this._showTopGlow = hasScroll && !isAtTop;
        this._showBottomGlow = hasScroll && !isAtBottom;
        this.requestUpdate();
      }
    }, 50);
  }

  _handleScroll(e) {
    const el = e.target;
    const hasScroll = el.scrollHeight > el.clientHeight + 5;
    const isAtTop = el.scrollTop < 5;
    const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 5;

    const showTop = hasScroll && !isAtTop;
    const showBottom = hasScroll && !isAtBottom;

    if (showTop !== this._showTopGlow || showBottom !== this._showBottomGlow) {
      this._showTopGlow = showTop;
      this._showBottomGlow = showBottom;
      this.requestUpdate();
    }
  }

  render() {
    return html`
      <div class="modal-backdrop" @click="${this._handleBackdropClick}">
        <div class="modal-content">
          <div class="shimmer"></div>
          
          <svg class="particle p-1" viewBox="0 0 24 24"><path d="M12 0l3.5 8.5L24 12l-8.5 3.5L12 24l-3.5-8.5L0 12l8.5-3.5z"/></svg>
          <svg class="particle p-6" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          <svg class="particle p-2" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>

          <div class="modal-header">
            <div class="header-left-btn">
              <cuteness-adult-btn></cuteness-adult-btn>
            </div>
            <h3 class="modal-title">Задания</h3>
            <button class="close-btn" @click="${this.close}">
              <svg viewBox="0 0 24 24">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="scroll-glow-top ${this._showTopGlow ? '' : 'hidden'}"></div>

          <div class="modal-body" @scroll="${this._handleScroll}">

            <svg class="particle p-3" viewBox="0 0 24 24"><path d="M12 0l3.5 8.5L24 12l-8.5 3.5L12 24l-3.5-8.5L0 12l8.5-3.5z"/></svg>
            <svg class="particle p-7" viewBox="0 0 24 24"><path d="M12 0l3.5 8.5L24 12l-8.5 3.5L12 24l-3.5-8.5L0 12l8.5-3.5z"/></svg>
            <svg class="particle p-4" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>

            ${this.tasks.length > 0 
              ? html`
                  ${this.tasks.map(task => html`
                    <cuteness-task-box 
                      title="${task.title}" 
                      reward="${task.reward}" 
                      ?completed="${task.completed}">
                    </cuteness-task-box>
                  `)}
                `
              : html`
                  <div class="quest-placeholder">
                    Здесь скоро появятся твои задания! ✨
                  </div>
                `
            }
          </div>
          
          <svg class="particle p-5" viewBox="0 0 24 24"><path d="M12 0l3.5 8.5L24 12l-8.5 3.5L12 24l-3.5-8.5L0 12l8.5-3.5z"/></svg>

          <div class="scroll-glow-bottom ${this._showBottomGlow ? '' : 'hidden'}"></div>
        </div>
      </div>
    `;
  }
}

customElements.define('cuteness-dialog', CutenessDialog);