import { html, css, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";

@customElement("class-timer-socket")
export class ClassTimerSocket extends LitElement {
  static styles = css`
    .time {
      font-size: 2em;
    }

    .result {
      font-size: 17px;
      color: #b76b6d;
    }

    button {
      width: 100px;
      height: 40px;
      background: transparent;
      color: #384856;
      border: 2px solid #384856;
      border-radius: 5px;
      outline: none;
    }

    button:hover {
      background: transparent;
      color: #b76b6d;
      font-weight: 800;
      text-transform: capitalize;
    }
  `;

  @property({ type: String })
  key?: string;

  @property({ type: String })
  status?: "STARTED" | "PAUSED" | "STOPPED" | "RESET";

  @property({ type: Number })
  elapsedTime?: number;

  @property({ type: Number })
  time?: number;

  @state()
  private formatted_time: string = "00:00:00";

  @state()
  private result?: string;

  private interval?: number;

  constructor() {
    super();

    this.syncState();
  }

  updated(changedProperties: Map<string, unknown>) {
    if (
      changedProperties.has("status") ||
      changedProperties.has("elapsedTime") ||
      changedProperties.has("time")
    ) {
      this.syncState();
    }
  }

  private syncState() {
    switch (this.status) {
      case "STARTED":
        this.start(true);
        break;

      case "PAUSED":
        this.pause(true);
        break;

      case "STOPPED":
        this.stop(true);
        break;

      case "RESET":
        this.reset(true);
        break;

      default:
        break;
    }
  }

  private formatTime(sec: number): string {
    const hour = Math.floor(sec / 3600);
    const minutes = Math.floor((sec / 60) % 60);
    const seconds = Math.floor(sec % 60);

    const formatted = `${hour.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

    return formatted;
  }

  public start(force = false) {
    if (this.status !== "STARTED" || force) {
      if (!force) {
        this.dispatchEvent(
          new CustomEvent<string>("start", {
            detail: this.key,
            bubbles: true,
            composed: true,
          })
        );
      }

      if (force) {
        this.interval = window.setInterval(() => {
          const curr_time = Math.round(Date.now() / 1000);

          this.formatted_time = this.formatTime(
            curr_time - this.time! + (this.elapsedTime ?? 0)
          );
        }, 1000);
      }

      this.result = undefined;
    }
  }

  public pause(force = false) {
    if (this.status === "STARTED" || force) {
      if (!force) {
        this.dispatchEvent(
          new CustomEvent<string>("pause", {
            detail: this.key,
            bubbles: true,
            composed: true,
          })
        );
      }

      if (force) {
        this.formatted_time = this.formatTime(this.elapsedTime!);
      }

      window.clearInterval(this.interval);
    }
  }

  public stop(force = false) {
    if ((this.status !== "STOPPED" && this.status !== "RESET") || force) {
      const curr_time = Math.round(Date.now() / 1000);

      if (!force) {
        this.dispatchEvent(
          new CustomEvent<string>("stop", {
            detail: this.key,
            bubbles: true,
            composed: true,
          })
        );
      }

      window.clearInterval(this.interval);
      if (force) {
        this.formatted_time = this.formatTime(0);

        const formattedTime = this.formatTime(
          curr_time - this.time! + this.elapsedTime!
        ).split(":");
        this.result = `Total waktu pengerjaan : ${formattedTime[0]} jam ${formattedTime[1]} menit ${formattedTime[2]} detik`;
      }
    }
  }

  public reset(force = false) {
    if (this.status !== "RESET" || force) {
      if (!force) {
        this.dispatchEvent(
          new CustomEvent<string>("reset", {
            detail: this.key,
            bubbles: true,
            composed: true,
          })
        );
      }

      if (force) {
        window.clearInterval(this.interval);
        this.formatted_time = this.formatTime(0);
        this.result = undefined;
      }
    }
  }

  render() {
    return html`
      <slot></slot>
      <p>${this.key}</p>

      <p class="time">${this.formatted_time}</p>
      ${this.status === "STARTED"
        ? html`<button @click="${() => this.pause()}">Pause</button>`
        : ``}
      ${this.status !== "STARTED"
        ? html`<button @click="${() => this.start()}">
            ${this.status === "PAUSED" ? "Resume" : "Start"}
          </button>`
        : ``}
      <button @click="${() => this.stop()}">Stop</button>
      <button @click="${() => this.reset()}">Reset</button>

      ${this.result ? html`<p class="result">${this.result}</p>` : ``}
    `;
  }
}
