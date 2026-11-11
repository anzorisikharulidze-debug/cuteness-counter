import { LitElement, html, css } from 'lit';
import './components/heart.js';
import './components/cuteness-card.js';
import './components/cuteness-divider.js';

import './components/nav/cuteness-navbar.js';
import './components/views/cuteness-history.js';

export class AppRoot extends LitElement {
  static properties = {
    balance: { type: Number },
    activeIndex: { type: Number },
  };

  constructor() {
    super();
    this.balance = 0;
    this.activeIndex = 0;
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
      this.balance = data.balance;
    } catch (error) {
      console.error('Ошибка при получении данных сервера:', error);
    }
  }

  _handleTabChange(e) {
    this.activeIndex = e.detail.index;
  }

  static styles = css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
      background-color: #0d0204;
      overflow: hidden; /* Прячем то, что выезжает за границы экрана */
      position: relative;
    }

    /* Общая лента экранов: ширина 200%, экраны стоят рядом друг с другом */
    .screens-track {
      display: flex;
      width: 200%;
      height: calc(100% - 70px); /* Оставляем место под навбар снизу */
      transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
      will-change: transform;
    }

    /* Каждый экран занимает ровно 50% от ленты (что равно 100% ширины экрана) */
    .screen-pane {
      width: 50%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      box-sizing: border-box;
    }

    /* Модификатор сдвига всей ленты вправо/влево в зависимости от индекса */
    :host([active-index="1"]) .screens-track {
      transform: translateX(-50%);
    }

    .card-container {
      display: flex;
      align-items: center;
      justify-content: center;
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

    .navbar-container {
      position: absolute;
      bottom: 16px;
      left: 50%;
      transform: translateX(-50%);
      width: 90%;
      max-width: 140px;
      z-index: 100;
    }
  `;

  render() {
    return html`
      <!-- Передаем активный индекс в хост, чтобы стили могли сдвигать ленту -->
      <div class="screens-track" style="transform: translateX(${this.activeIndex === 1 ? '-50%' : '0'});">
        
        <!-- Панель 0: Счётчик -->
        <div class="screen-pane">
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
        </div>

        <!-- Панель 1: История -->
        <div class="screen-pane">
          <cuteness-history></cuteness-history>
        </div>

      </div>

      <div class="navbar-container">
        <!-- Слушаем кастомное событие смены таба от навбара -->
        <cuteness-navbar @tab-change="${this._handleTabChange}"></cuteness-navbar>
      </div>
    `;
  }
}

customElements.define('app-root', AppRoot);