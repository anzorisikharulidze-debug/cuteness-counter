import { LitElement, html, css } from 'lit';

export class CutenessBtn extends LitElement {
  static properties = {
    active: { type: Boolean, reflect: true }
  };

  constructor() {
    super();
    this.active = false;
  }

  static styles = css`
    :host {
      display: flex;
      flex: 1;
      height: 100%;
      box-sizing: border-box;
    }

    button {
      width: 100%;
      height: 100%;
      background: transparent;
      border: none;
      border-radius: 18px;
      display: flex;
      flex-direction: column; /* <--- Вот оно: выстраиваем по вертикали (Y) */
      align-items: center;
      justify-content: center;
      gap: 2px; /* Отступ между иконкой и текстом */
      cursor: pointer;
      padding: 0;
      margin: 0;
      box-sizing: border-box;
      outline: none;
      color: rgba(255, 140, 163, 0.5);
      opacity: 0.7;
      font-family: inherit;
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.5px;
      z-index: 1;
      pointer-events: auto;
      transition: color 0.3s ease, opacity 0.3s ease, transform 0.3s ease;
    }

    /* Когда кнопка активна, текст и обводка иконки становятся ярче */
    :host([active]) button {
      color: #ff5c8a;
      opacity: 1;
    }

    ::slotted(svg) {
      width: 18px;
      height: 18px;
      fill: none; /* Убираем заливку, оставляем только контур */
      stroke: currentColor; /* Наследует цвет от кнопки (меняется автоматически) */
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), filter 0.3s ease;
    }

    :host([active]) ::slotted(svg) {
      transform: scale(1.1);
      filter: drop-shadow(0 0 6px rgba(255, 92, 138, 0.6));
    }
  `;

  render() {
    return html`
      <button>
        <slot name="icon"></slot>
        <slot name="label"></slot>
      </button>
    `;
  }
}

customElements.define('cuteness-btn', CutenessBtn);