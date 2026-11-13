import { LitElement, html, css } from 'lit';

export class CutenessAdultBtn extends LitElement {
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

      /* Более прозрачный фон в стиле Liquid Glass */
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.035) 0%, rgba(255, 255, 255, 0.008) 100%);
      backdrop-filter: blur(28px) saturate(190%);
      -webkit-backdrop-filter: blur(28px) saturate(190%);
      border: 1px solid rgba(255, 130, 180, 0.12);

      box-shadow: 
        inset 0 1px 1px 0 rgba(255, 255, 255, 0.25),
        inset 0 -1px 2px 0 rgba(0, 0, 0, 0.4),
        0 8px 20px -4px rgba(0, 0, 0, 0.6),
        0 0 15px 0 rgba(255, 40, 100, 0.08);

      transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1),
                  box-shadow 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .shimmer {
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(255, 50, 110, 0.05) 0%, transparent 50%, rgba(255, 255, 255, 0.05) 100%);
      pointer-events: none;
    }

    /* Точно центрируем текст с небольшим оптическим смещением вверх */
    .content-wrapper {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-51%, -50%);
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      z-index: 1;
    }

    /* Крупный и четкий текст +18 */
    .adult-text {
      color: #ff8ca3;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 20px;
      font-weight: 500;
      letter-spacing: 0.2px;
      text-shadow: 0 0 6px rgba(255, 120, 160, 0.4);
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
    this.dispatchEvent(new CustomEvent('open-adult', {
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
          <span class="adult-text">+18</span>
        </div>
      </div>
    `;
  }
}

customElements.define('cuteness-adult-btn', CutenessAdultBtn);