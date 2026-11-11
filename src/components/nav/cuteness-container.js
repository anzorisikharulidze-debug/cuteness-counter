import { LitElement, html, css } from 'lit';

export class CutenessContainer extends LitElement {
  static styles = css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }

    .liquid-glass-container {
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.015) 100%);
      backdrop-filter: blur(28px) saturate(190%);
      -webkit-backdrop-filter: blur(28px) saturate(190%);
      border: 1px solid rgba(255, 130, 180, 0.12);
      box-shadow: 
        inset 0 1px 1px 0 rgba(255, 255, 255, 0.25),
        inset 0 -1px 2px 0 rgba(0, 0, 0, 0.4),
        0 20px 50px -10px rgba(0, 0, 0, 0.7),
        0 0 40px 0 rgba(255, 40, 100, 0.08);
      border-radius: 36px;
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
      overflow: hidden;
      box-sizing: border-box;
    }

    /* Shimmer Inner Overlay */
    .shimmer {
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(255, 50, 110, 0.05) 0%, transparent 50%, rgba(255, 255, 255, 0.05) 100%);
      pointer-events: none;
    }
  `;

  _handleClick(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const isRightSide = clickX > rect.width / 2;
    const selectedIndex = isRightSide ? 1 : 0;

    // Кидаем кастомное событие наверх родителю
    this.dispatchEvent(new CustomEvent('tab-change', {
      detail: { index: selectedIndex },
      bubbles: true,
      composed: true // Обязательно для проброса сквозь Shadow DOM
    }));
  }

  render() {
    return html`
      <div class="liquid-glass-container" @click="${this._handleClick}">
        <div class="shimmer"></div>
        <slot></slot>
      </div>
    `;
  }
}

customElements.define('cuteness-container', CutenessContainer);