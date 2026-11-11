import { LitElement, html, css } from 'lit';
import '../cuteness-box.js';

export class CutenessHistory extends LitElement {
  static properties = {
    history: { type: Array },
    _isAtBottom: { type: Boolean }
  };

  constructor() {
    super();
    this.history = []; // Изначально пустой список
    this._isAtBottom = false;
  }

  connectedCallback() {
    super.connectedCallback();
    this._fetchTransactions();
  }

  async _fetchTransactions() {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      const response = await fetch(`${API_URL}/api/transactions`);
      if (!response.ok) throw new Error('Ошибка загрузки транзакций');
      
      const data = await response.json();
      this.history = data.map(item => ({
        points: item.points,
        reason: item.reason,
        date: this._formatDate(item.created_at)
      }));
    } catch (e) {
      console.error('Не удалось загрузить историю транзакций:', e);
    }
  }

  static styles = css`
    :host {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      padding: 16px;
      margin-top: 50px;
    }

    /* Обертка — держит вьюпорт и выносит скроллбар максимально вправо */
    .viewport-wrapper {
      position: relative;
      width: 90%;
      height: 95%;
      max-width: 380px;
      box-sizing: border-box;
    }

    /* Сам вьюпорт со скроллом на всю ширину (без внутренних отступов для боксов) */
    .history-viewport {
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      gap: 14px;
      overflow-y: auto;
      
      /* Скроллбар вынесен правее контента, карточки на всю ширину */
      padding-right: 8px;
    }

    /* Скроллбар строго по правому краю контейнера */
    .history-viewport::-webkit-scrollbar {
      width: 4px;
    }
    .history-viewport::-webkit-scrollbar-track {
      background: transparent;
    }
    .history-viewport::-webkit-scrollbar-thumb {
      background: rgba(255, 140, 163, 0.35);
      border-radius: 4px;
    }

    /* Нижний глоу без скруглений, на всю ширину, исчезающий внизу */
    .scroll-glow-bottom {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 50px;
      background: linear-gradient(to top, rgba(10, 5, 10, 0.95) 0%, rgba(10, 5, 10, 0) 100%);
      pointer-events: none;
      
      /* Никаких border-radius — ровная линия */
      border-radius: 0; 
      
      /* Плавное появление/исчезновение, когда дошли до низа */
      opacity: 1;
      transition: opacity 0.3s ease;
    }

    /* Класс, скрывающий глоу, когда пользователь в самом низу */
    .scroll-glow-bottom.hidden {
      opacity: 0;
    }
  `;

  // Обработчик скролла для отслеживания низа списка
  _handleScroll(e) {
    const el = e.target;
    // Проверяем, доскроллил ли пользователь до конца (с погрешностью в 5px)
    const isBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 5;
    
    if (isBottom !== this._isAtBottom) {
      this._isAtBottom = isBottom;
      this.requestUpdate();
    }
  }

  _formatDate(isoString) {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  render() {
    return html`
      <div class="viewport-wrapper">
        <div class="history-viewport" @scroll="${this._handleScroll}">
          ${this.history && this.history.length > 0 
            ? this.history.map(item => html`
                <cuteness-box 
                  .points="${item.points}" 
                  .reason="${item.reason}" 
                  .date="${item.date}">
                </cuteness-box>
              `)
            : html`<div class="empty-text">История пока пуста ✨</div>`
          }
        </div>
        
        <div class="scroll-glow-bottom ${this._isAtBottom ? 'hidden' : ''}"></div>
      </div>
    `;
  }
}

customElements.define('cuteness-history', CutenessHistory);