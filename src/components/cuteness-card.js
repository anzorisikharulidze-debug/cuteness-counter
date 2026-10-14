import { LitElement, html, css } from 'lit';

export class CutenessCard extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .glass-card {
      width: clamp(280px, 86vw, 360px);
      height: clamp(380px, 78vh, 460px);

      background: rgba(35, 25, 28, 0.15);
      backdrop-filter: blur(25px);
      -webkit-backdrop-filter: blur(25px);
      
      border: 1px solid rgba(255, 100, 120, 0.12);
      border-radius: 32px;

      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      padding: 32px 20px;
      box-sizing: border-box;

      box-shadow: 0 24px 48px rgba(0, 0, 0, 0.5),
                  inset 0 1px 1px rgba(255, 255, 255, 0.15);
    }
  `;

  render() {
    return html`
      <div class="glass-card">
        <slot></slot>
      </div>
    `;
  }
}

customElements.define('cuteness-card', CutenessCard);