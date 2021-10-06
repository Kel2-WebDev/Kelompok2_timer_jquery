import $ from "jquery";
import { html, css, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";

enum TimerState {
  started = "started",
  paused = "paused",
  stopped = "stopped",
  reset = "reset",
}

type TimerInternalState = {
  last_epoch: number;
  millis: number;
  state: TimerState;
};

@customElement("class-timer")
export class ClassTimer extends LitElement {
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
  workspace_id: string | null;

  constructor() {
    super();

    var url_string = window.location.href; 
    var url = new URL(url_string);

    var c = url.searchParams.get("workspace_id");

    this.workspace_id = c
  }

  @property({ attribute: false })
  state: TimerInternalState = {
    last_epoch: Date.now(),
    millis: 0,
    state: TimerState.reset,
  };

  private interval?: number;

  @state()
  private formattedTime: string = "00:00:00";

  @state()
  private result?: string;

  @property({ attribute: true })
  key?: string;

  connectedCallback() {
    super.connectedCallback();

    this.loadPersistenceData();

    $(window).on("unload", (ev) => {
      ev.preventDefault();

      if (this.key) {
        window.localStorage.setItem(this.key, JSON.stringify(this.state));
      }

      return;
    });
  }

  private loadPersistenceData() {
    if (this.key) {
      const data = JSON.parse(window.localStorage.getItem(this.key)!);

      if (
        data &&
        "last_epoch" in data &&
        "millis" in data &&
        "state" in data &&
        typeof data.last_epoch === "number" &&
        typeof data.millis === "number" &&
        data.state in TimerState
      ) {
        this.state = data;
      }

      switch (this.state.state) {
        case TimerState.stopped:
          this.stop(true);
          break;

        case TimerState.started:
          this.start(true);
          break;

        case TimerState.paused:
          this.pause(true);
          break;

        case TimerState.reset:
          this.reset(true);
          break;
      }
    }
  }

  private formatTime(millis: number): string {
    const sec = Math.floor(millis / 1000);

    const hour = Math.floor(sec / 3600);
    const minutes = Math.floor((sec / 60) % 60);
    const seconds = Math.floor(sec % 60);

    const formatted = `${hour.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

    return formatted;
  }

  private stopSiblings() {
    let sibling = this.parentElement?.firstChild;

    while (sibling) {
      if (sibling != this && sibling instanceof ClassTimer) {
        sibling.pause();
      }

      sibling = sibling.nextSibling;
    }
  }

  public start(force: boolean = false) {
    if (this.state.state !== TimerState.started || force) {
      this.result = undefined;

      this.stopSiblings();

      if (!force && this.state.state !== TimerState.paused) {
        this.state.millis = 0;
        this.state.last_epoch = Date.now();
      }

      this.interval = window.setInterval(() => {
        const curr_epoch = Date.now();

        this.state.millis += curr_epoch - this.state.last_epoch;
        this.state.last_epoch = curr_epoch;

        this.formattedTime = this.formatTime(this.state.millis);
      }, 500);

      this.state.state = TimerState.started;
    }
  }

  public pause(force: boolean = false) {
    if (this.state.state === TimerState.started || force) {
      window.clearInterval(this.interval);

      this.formattedTime = this.formatTime(this.state.millis);
      this.state = { ...this.state, state: TimerState.paused };
    }

    console.log(this.state);
  }

  public stop(force: boolean = false) {
    if (this.state.state !== TimerState.stopped || force) {
      const formattedTime = this.formatTime(this.state.millis).split(":");

      this.result = `Total waktu pengerjaan : ${formattedTime[0]} jam ${formattedTime[1]} menit ${formattedTime[2]} detik`;
      window.clearInterval(this.interval);

      this.state.state = TimerState.stopped;
      this.formattedTime = this.formatTime(0);
    }
  }

  public reset(force: boolean = false) {
    if (this.state.state !== TimerState.reset || force) {
      this.result = undefined;

      window.clearInterval(this.interval);

      this.state = {
        state: TimerState.reset,
        millis: 0,
        last_epoch: Date.now(),
      };
      this.formattedTime = this.formatTime(0);
    }
  }

  render() {
    return html`
      <slot></slot>

      <p>${this.workspace_id}</p>

      <p class="time">${this.formattedTime}</p>
      ${this.state.state === TimerState.started
        ? html`<button @click="${() => this.pause()}">Pause</button>`
        : ``}
      ${this.state.state !== TimerState.started
        ? html`<button @click="${() => this.start()}">
            ${this.state.state === TimerState.paused ? "Resume" : "Start"}
          </button>`
        : ``}
      <button @click="${() => this.stop()}">Stop</button>
      <button @click="${() => this.reset()}">Reset</button>

      ${this.result ? html`<p class="result">${this.result}</p>` : ``}
    `;
  }
}
