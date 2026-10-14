import { LitElement, html, css } from 'lit';

export class CutenessDivider extends LitElement {
  static styles = css`
    :host {
      display: block;
      width: 60%;
      margin: 10px 0;
    }

    .line {
      width: 100%;
      height: 1px;
      background: linear-gradient(
        90deg, 
        transparent, 
        rgba(255, 100, 120, 0.4), 
        transparent
      );
    }
  `;

  render() {
    return html`<div class="line"></div>`;
  }
}

customElements.define('cuteness-divider', CutenessDivider);