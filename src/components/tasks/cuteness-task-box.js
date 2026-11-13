import { LitElement, html, css } from 'lit';

export class CutenessTaskBox extends LitElement {
  static properties = {
    title: { type: String },
    reward: { type: Number },
    completed: { type: Boolean, reflect: true }
  };

  constructor() {
    super();
    this.title = '';
    this.reward = 5;
    this.completed = false;
  }

  static styles = css`
    :host {
      display: block;
      width: 100%;
      box-sizing: border-box;
    }

    .box {
      width: 100%;
      padding: 16px 18px;
      box-sizing: border-box;
      border-radius: 24px;
      position: relative;
      overflow: hidden;

      /* Жидкое стекло с фирменным стилем */
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.015) 100%);
      backdrop-filter: blur(28px) saturate(190%);
      -webkit-backdrop-filter: blur(28px) saturate(190%);
      border: 1px solid rgba(255, 130, 180, 0.18);
      
      box-shadow: 
        inset 0 1px 1px 0 rgba(255, 255, 255, 0.35),
        inset 0 -1px 2px 0 rgba(0, 0, 0, 0.4),
        0 10px 30px -10px rgba(0, 0, 0, 0.6),
        0 0 25px 0 rgba(255, 40, 100, 0.06);

      display: flex;
      flex-direction: column;
      gap: 14px;
      transition: all 0.3s ease;
    }

    /* Состояние выполненного задания: затемняем и приглушаем весь бокс целиком */
    :host([completed]) .box {
      border-color: rgba(255, 140, 180, 0.1);
      background: linear-gradient(135deg, rgba(20, 5, 10, 0.4) 0%, rgba(10, 2, 5, 0.6) 100%);
      box-shadow: 
        inset 0 1px 1px 0 rgba(255, 255, 255, 0.1),
        inset 0 -1px 2px 0 rgba(0, 0, 0, 0.6),
        0 5px 15px -5px rgba(0, 0, 0, 0.8);
    }

    .shimmer {
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(255, 50, 110, 0.04) 0%, transparent 60%, rgba(255, 255, 255, 0.04) 100%);
      pointer-events: none;
    }

    .top-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
      position: relative;
      z-index: 1;
    }

    /* Текст задания */
    .task-title {
      color: rgba(255, 255, 255, 0.92);
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 13px;
      font-weight: 500;
      line-height: 1.45;
      word-break: break-word;
      flex: 1;
      transition: color 0.3s ease;
    }

    :host([completed]) .task-title {
      color: rgba(255, 209, 220, 0.35);
    }

    /* Бейдж награды */
    .reward-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      background: linear-gradient(135deg, rgba(255, 80, 130, 0.2) 0%, rgba(255, 40, 90, 0.1) 100%);
      border: 1px solid rgba(255, 140, 180, 0.3);
      padding: 4px 10px;
      border-radius: 14px;
      color: #ffd1dc;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 11px;
      font-weight: 600;
      white-space: nowrap;
      box-shadow: 0 0 12px rgba(255, 60, 120, 0.2);
      transition: all 0.3s ease;
    }

    :host([completed]) .reward-badge {
      background: rgba(255, 255, 255, 0.02);
      border-color: rgba(255, 140, 180, 0.1);
      color: rgba(255, 209, 220, 0.3);
      box-shadow: none;
    }

    .reward-badge svg {
      width: 12px;
      height: 12px;
      fill: #ff4d79;
      filter: drop-shadow(0 0 4px rgba(255, 77, 121, 0.6));
      flex-shrink: 0;
      transition: fill 0.3s ease, filter 0.3s ease;
    }

    :host([completed]) .reward-badge svg {
      fill: rgba(255, 77, 121, 0.3);
      filter: none;
    }

    /* Стиль штампа "ВЫПОЛНЕНО" */
    .stamp {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(8deg);
      border: 2px solid rgba(255, 70, 120, 0.65);
      color: rgba(255, 130, 170, 0.9);
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 15px;
      font-weight: 800;
      letter-spacing: 3px;
      text-transform: uppercase;
      padding: 6px 16px;
      border-radius: 10px;
      background: rgba(40, 5, 15, 0.45);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      pointer-events: none;
      z-index: 5;
      box-shadow: 
        0 0 25px 10px rgba(5, 0, 3, 0.9), 
        0 0 15px rgba(255, 40, 100, 0.25);
      
      opacity: 0;
      scale: 1.2;
      transition: opacity 0.25s ease, scale 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }

    :host([completed]) .stamp {
      opacity: 1;
      scale: 1;
    }

    /* Партиклы фона */
    .particle {
      position: absolute;
      pointer-events: none;
      z-index: 0;
      opacity: 0.45;
      filter: drop-shadow(0 0 3px rgba(255, 100, 160, 0.25));
      transition: opacity 0.3s ease;
    }

    :host([completed]) .particle {
      opacity: 0.2;
    }

    .p0-1 { top: 6px; left: 8px; width: 6px; height: 6px; fill: rgba(255, 140, 190, 0.6); transform: rotate(-15deg); }
    .p0-2 { bottom: 8px; right: 12px; width: 9px; height: 9px; fill: rgba(255, 100, 150, 0.45); transform: rotate(20deg); }

    .p1-1 { top: 10px; right: 15px; width: 8px; height: 8px; fill: rgba(255, 120, 170, 0.55); transform: rotate(45deg); }
    .p1-2 { top: 50%; left: 4px; width: 5px; height: 5px; fill: rgba(255, 160, 200, 0.4); transform: rotate(-30deg); }
    .p1-3 { bottom: 6px; left: 14px; width: 7px; height: 7px; fill: rgba(255, 100, 150, 0.5); transform: rotate(10deg); }

    .p2-1 { top: 8px; left: 45%; width: 6px; height: 6px; fill: rgba(255, 150, 190, 0.5); transform: rotate(25deg); }
    .p2-2 { bottom: 12px; right: 25%; width: 8px; height: 8px; fill: rgba(255, 110, 160, 0.55); transform: rotate(-40deg); }
    .p2-3 { top: 40%; right: 6px; width: 5px; height: 5px; fill: rgba(255, 130, 180, 0.45); transform: rotate(15deg); }
    .p2-4 { bottom: 10px; left: 8px; width: 7px; height: 7px; fill: rgba(255, 90, 140, 0.5); transform: rotate(-10deg); }
  `;

  render() {
    const templateIndex = (this.title ? this.title.length : 0) % 3;

    return html`
      <div class="box">
        <div class="shimmer"></div>
        
        <!-- Штамп поверх бокса наискось -->
        <div class="stamp">ВЫПОЛНЕНО</div>

        ${templateIndex === 0 ? html`
          <svg class="particle p0-1" viewBox="0 0 24 24"><path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z"/></svg>
          <svg class="particle p0-2" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
        ` : ''}

        ${templateIndex === 1 ? html`
          <svg class="particle p1-1" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          <svg class="particle p1-2" viewBox="0 0 24 24"><path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z"/></svg>
          <svg class="particle p1-3" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
        ` : ''}

        ${templateIndex === 2 ? html`
          <svg class="particle p2-1" viewBox="0 0 24 24"><path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z"/></svg>
          <svg class="particle p2-2" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          <svg class="particle p2-3" viewBox="0 0 24 24"><path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z"/></svg>
          <svg class="particle p2-4" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
        ` : ''}

        <div class="top-row">
          <div class="task-title">${this.title}</div>
          <div class="reward-badge">
            <svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            +${this.reward}
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('cuteness-task-box', CutenessTaskBox);