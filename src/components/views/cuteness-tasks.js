import { LitElement, html, css } from 'lit';
import '../tasks/cuteness-dialog.js';
import '../tasks/cuteness-adult-dialog.js';

export class CutenessTasksView extends LitElement {
  static properties = {
    tasks: { type: Array },
    adultTasks: { type: Array },
    _isLoading: { type: Boolean }
  };

  constructor() {
    super();
    this.tasks = [
      { id: 1, title: 'Пройти 10 000 шагов за день', reward: 50, completed: false },
      { id: 2, title: 'Выпить 2 литра чистой воды', reward: 30, completed: true },
      { id: 3, title: 'Лечь спать до полуночи', reward: 40, completed: false },
      { id: 4, title: 'Уделить 15 минут чтению книги', reward: 35, completed: false }
    ];
    this.adultTasks = [
      { id: 1, title: 'Устроить романтический вечер при свечах', reward: 150, completed: false },
      { id: 2, title: 'Сделать расслабляющий массаж плеч', reward: 100, completed: true },
      { id: 3, title: 'Приготовить любимый десерт вдвоем', reward: 200, completed: false }];
    this._isLoading = false;
  }

  connectedCallback() {
    super.connectedCallback();
    this._fetchAllTasks();
  }

  async _fetchAllTasks() {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      
      const resTasks = await fetch(`${API_URL}/api/tasks`);
      if (resTasks.ok) this.tasks = await resTasks.json();

      const resAdult = await fetch(`${API_URL}/api/adult-tasks`);
      if (resAdult.ok) this.adultTasks = await resAdult.json();
    } catch (e) {
      console.error('Ошибка загрузки заданий:', e);
    }
  }

  // Публичный метод для открытия обычного диалога из app-root
  openMainDialog() {
    this._fetchAllTasks();
    const dialog = this.shadowRoot.querySelector('cuteness-dialog');
    if (dialog) dialog.open();
  }

  // Публичный метод для открытия интимного диалога
  openAdultDialog() {
    this._fetchAllTasks();
    const adultDialog = this.shadowRoot.querySelector('cuteness-adult-dialog');
    if (adultDialog) adultDialog.open();
  }

  closeAll() {
    const mainDialog = this.shadowRoot.querySelector('cuteness-dialog');
    const adultDialog = this.shadowRoot.querySelector('cuteness-adult-dialog');
    
    if (mainDialog) mainDialog.isOpen = false;
    if (adultDialog) adultDialog.isOpen = false;
  }

  static styles = css`
    :host {
      display: block;
    }
  `;

  render() {
    return html`
      <div @close-all-modals="${this.closeAll}">
        <!-- Обычное окно заданий -->
        <cuteness-dialog 
          .tasks="${this.tasks}"
          @open-adult="${this.openAdultDialog}">
        </cuteness-dialog>

        <!-- Интимное окно заданий -->
        <cuteness-adult-dialog 
          .tasks="${this.adultTasks}">
        </cuteless-adult-dialog>
      </div>
    `;
  }
}

customElements.define('cuteness-tasks-view', CutenessTasksView);