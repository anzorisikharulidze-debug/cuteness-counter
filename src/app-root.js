import { LitElement, html, css } from 'lit';
import './components/heart.js';
import './components/cuteness-card.js';
import './components/cuteness-divider.js';

export class AppRoot extends LitElement {
  static properties = {
    balance: { type: Number },
  };

  constructor() {
    super();
    this.balance = 0; // Изначальное значение до ответа сервера
  }

  connectedCallback() {
    super.connectedCallback();
    this.fetchState();
  }

  async fetchState() {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      const response = await fetch(`${API_URL}/api/state`);
      const data = await response.json();
      this.balance = data.balance; // Обновляем баланс данными из бэкенда
    } catch (error) {
      console.error('Ошибка при получении данных сервера:', error);
    }
  }

  static styles = css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
      background-color: #0d0204;
    }

    .card-container {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    .heart-wrapper {
      width: 220px;
      height: 220px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .content-footer {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      margin-bottom: 15px;
      font-family: system-ui, -apple-system, sans-serif;
    }

    .counter-value {
      color: #ffd1dc;
      font-size: 32px;
      font-weight: 300;
      letter-spacing: 2px;

      overflow: hidden;
      display: inline-block;
      height: 40px;
      line-height: 40px;
    }

    @keyframes rollUp {
      0% {
        opacity: 0;
        transform: translateY(15px);
      }
      100% {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .rolling-digit {
      display: inline-block;
      animation: rollUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    .counter-label {
      color: rgba(255, 209, 220, 0.5);
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 2px;
    }

    .screen-footer {
      position: absolute;
      bottom: 10px;
      left: 50%;
      transform: translateX(-50%);
      width: 85%;
      max-width: 320px;
      display: flex;
      flex-direction: column;
      text-align: center;
      gap: 6px;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 12px;
      font-weight: 400;
      color: rgba(255, 255, 255, 0.25); /* Тёмно-серый полупрозрачный, неброский */
      letter-spacing: 0.5px;
      pointer-events: none; /* Чтобы текст случайно не перекрывал клики */
    }
  `;

  render() {
    return html`
      <div class="card-container">
        <cuteness-card>
          
          <div class="heart-wrapper">
            <cuteness-heart></cuteness-heart>
          </div>

          <cuteness-divider></cuteness-divider>

          <div class="content-footer">
          <div class="counter-label">Очки милоты</div>
            <div class="counter-value">
              <span class="rolling-digit" .key="${this.balance}">${this.balance}</span>
            </div>
          </div>

        </cuteness-card>
      </div>

      <div class="screen-footer">
        <div class="footer-line">Ваши очки милоты начисляются за милые слова,<br>поступки или улыбки - как в чате,<br>так и в реальной жизни.</div>
        <div class="footer-line" style="font-size: 10px; opacity: 0.8;">Наслаждайтесь!</div>
      </div>
    `;
  }
}

customElements.define('app-root', AppRoot);