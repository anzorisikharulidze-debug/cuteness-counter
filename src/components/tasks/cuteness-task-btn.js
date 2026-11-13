import { LitElement, html, css } from 'lit';

export class CutenessTaskBtn extends LitElement {
  static styles = css`
    :host {
      display: inline-block;
      cursor: pointer;
      user-select: none;
      -webkit-tap-highlight-color: transparent;
    }

    .round-btn {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      position: relative;
      overflow: hidden;
      box-sizing: border-box;

      /* Точный стиль Liquid Glass */
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.015) 100%);
      backdrop-filter: blur(28px) saturate(190%);
      -webkit-backdrop-filter: blur(28px) saturate(190%);
      border: 1px solid rgba(255, 130, 180, 0.12);

      box-shadow: 
        inset 0 1px 1px 0 rgba(255, 255, 255, 0.25),
        inset 0 -1px 2px 0 rgba(0, 0, 0, 0.4),
        0 8px 20px -4px rgba(0, 0, 0, 0.6),
        0 0 15px 0 rgba(255, 40, 100, 0.08);

      /* Более медленная и плавная кривая анимации для нажатия */
      transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1),
                  box-shadow 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    }

    /* Шим */
    .shimmer {
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(255, 50, 110, 0.05) 0%, transparent 50%, rgba(255, 255, 255, 0.05) 100%);
      pointer-events: none;
    }

    /* Обертка для содержимого: абсолютное позиционирование для идеальной регулировки */
    .content-wrapper {
      position: absolute;
      top: 50%;
      left: 50%;
      /* Сдвигаем на -50% для центрирования, а последнее число (например, -2px) поднимает выше или ниже */
      transform: translate(-50%, -54%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 3px;
      width: 100%;
    }

    /* Иконка */
    .round-btn svg {
      width: 16px;
      height: 16px;
      fill: none;
      stroke: #ff8ca3;
      stroke-width: 2.5;
      stroke-linecap: round;
      stroke-linejoin: round;
      filter: drop-shadow(0 0 3px rgba(255, 120, 160, 0.5));
    }

    /* Текст */
    .btn-label {
      color: #ff8ca3;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 7px;
      font-weight: 730;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      line-height: 1;
    }

    /* Плавное мягкое нажатие */
    :host(:active) .round-btn {
      transform: scale(0.92);
      box-shadow: 
        inset 0 1px 1px 0 rgba(255, 255, 255, 0.15),
        0 3px 8px -2px rgba(0, 0, 0, 0.5),
        0 0 8px 0 rgba(255, 40, 100, 0.04);
    }
  `;

  _handleClick() {
    this.dispatchEvent(new CustomEvent('open-tasks', {
      detail: {},
      bubbles: true,
      composed: true
    }));
  }

  render() {
    return html`
      <div class="round-btn" @click="${this._handleClick}">
        <div class="shimmer"></div>
        <div class="content-wrapper">
          <svg viewBox="0 0 24 24">
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
          <span class="btn-label">ЗАДАНИЯ</span>
        </div>
      </div>
    `;
  }
}

customElements.define('cuteness-task-btn', CutenessTaskBtn);