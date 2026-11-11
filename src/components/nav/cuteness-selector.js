import { LitElement, html, css } from 'lit';

export class CutenessSelector extends LitElement {
  static properties = {
    // Позиция: 0 (левая вкладка) или 1 (правая вкладка)
    position: { type: Number, reflect: true },
  };

  constructor() {
    super();
    this.position = 0; // По умолчанию на первой вкладке
  }

  static styles = css`
    :host {
      display: block;
      position: absolute;
      top: 4px;
      bottom: 4px;
      left: 4px;
      /* Явно задаем высоту по высоте навбара минус отступы сверху/снизу (48px - 8px = 40px) */
      height: calc(100% - 8px); 
      /* Ширина ровно 50% от родителя минус отступы */
      width: calc(50% - 4px);
      transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      will-change: transform;
      pointer-events: none; /* Селектор не должен перехватывать клики мимо кнопок */
      z-index: 2;
    }

    /* Если позиция 1, сдвигаем селектор вправо на 100% его ширины */
    :host([position="1"]) {
      transform: translateX(100%);
    }

    /* Сам «жидкий» бегунок */
    .selector-glass {
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.03) 100%);
      backdrop-filter: blur(12px) saturate(200%);
      -webkit-backdrop-filter: blur(12px) saturate(200%);
      border: 1px solid rgba(255, 150, 200, 0.25);
      box-shadow: 
        inset 0 1px 1px 0 rgba(255, 255, 255, 0.4),
        inset 0 -1px 2px 0 rgba(0, 0, 0, 0.3),
        0 8px 20px -4px rgba(0, 0, 0, 0.5),
        0 0 15px 0 rgba(255, 60, 120, 0.15);
      border-radius: 36px;
      box-sizing: border-box;
    }
  `;

  render() {
    return html`
      <div class="selector-glass"></div>
    `;
  }
}

customElements.define('cuteness-selector', CutenessSelector);