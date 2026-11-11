import { LitElement, html, css } from 'lit';
import './cuteness-container.js';
import './cuteness-selector.js';
import './cuteness-btn.js';

export class CutenessNavbar extends LitElement {
  static properties = {
    activeIndex: { type: Number },
  };

  constructor() {
    super();
    this.activeIndex = 0; // По умолчанию слева (0)
  }

  static styles = css`
    :host {
      display: block;
      width: 100%;
      height: 48px;
    }

    cuteness-container {
      width: 100%;
      height: 100%;
    }

    .buttons-container {
      position: absolute;
      inset: 4px;
      display: flex;
      gap: 4px;
      z-index: 1;
    }
  `;

  _handleTabChange(e) {
    this.activeIndex = e.detail.index;
  }

  render() {
    return html`
      <cuteness-container @tab-change="${this._handleTabChange}">
        <div class="buttons-container">
          <cuteness-btn 
            ?active="${this.activeIndex === 0}"
            @click="${() => this.activeIndex = 0}"
          >
            <!-- Контурная иконка счетчика (плюсик) -->
            <svg slot="icon" viewBox="0 0 24 24"><path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"/></svg>
            <span slot="label">СЧЁТЧИК</span>
          </cuteness-btn>

          <cuteness-btn 
            ?active="${this.activeIndex === 1}"
            @click="${() => this.activeIndex = 1}"
          >
            <!-- Контурная иконка магазина (сумочка) -->
            <svg slot="icon" viewBox="0 0 24 24"><path d="M12.127 21H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v5.125M14.62 17.8A2.25 2.25 0 1118 14.836a2.25 2.25 0 113.38 2.966l-2.626 2.856a.998.998 0 01-1.507 0zM16 2v3M3 9h18M8 2v3"/></svg>
            <span slot="label">ИСТОРИЯ</span>
          </cuteness-btn>
        </div>
        <cuteness-selector position="${this.activeIndex}"></cuteness-selector>
      </cuteness-container>
    `;
  }
}

customElements.define('cuteness-navbar', CutenessNavbar);