import $ from "jquery";
import { html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import { io, Socket } from "socket.io-client";
import "./class-timer-socket";

interface Timer {
  id: string;
  title: string;
  status: "STARTED" | "PAUSED" | "STOPPED" | "RESET";
  elapsedTime: number;
  time: number;
}

@customElement("timer-page")
export class TimerPage extends LitElement {
  @state()
  private workspace_title: string = "Loading...";

  @state()
  private workspace_description: string = "Loading...";

  @state()
  private workspace_id: string;

  @state()
  private timers: Timer[] = [];

  private socket: Socket;

  @state()
  private connected: boolean = false;

  constructor() {
    super();

    const url = new URL(window.location.href);
    const workspace_id = url.searchParams.get("workspace_id");

    if (!workspace_id) window.location.href = "/";

    this.workspace_id = workspace_id || "";

    this.socket = io(import.meta.env.VITE_BACKEND_URL, {
      auth: { key: this.workspace_id },
    });
  }

  connectedCallback() {
    super.connectedCallback();

    $.ajax({
      url: import.meta.env.VITE_BACKEND_URL + "/workspace/" + this.workspace_id,
      type: "GET",
      traditional: true,
      success: (res) => {
        console.log(res);

        this.workspace_title = res.title;
        this.workspace_description = res.description;

        $(document).prop("title", "TVA | " + this.workspace_title);
      },
      error: (xhr, status, error) => {
        $(window).on("beforeunload", () => {
          return xhr.responseText;
        });

        window.location.href = "/";
      },
    });

    $.ajax({
      url: import.meta.env.VITE_BACKEND_URL + "/timer/" + this.workspace_id,
      type: "GET",
      traditional: true,
    }).done((res: Timer[]) => {
      this.timers = res;
    });

    this.socket.on("disconnect", () => {
      console.log("Disconnect");

      this.connected = false;
    });

    this.socket.on("connect", () => {
      console.log("Connected");

      this.connected = true;
    });

    this.socket.on("timer:new", (data: Timer) => {
      console.log("New timer");
      console.log(data);

      this.timers.push(data);
      this.requestUpdate("timers");
    });

    this.socket.on("timer:update", (data: Timer) => {
      this.timers.forEach((val, index) => {
        if (val.id === data.id) {
          this.timers[index] = data;
        }
      });

      this.requestUpdate("timers");
    });

    this.socket.on("timer:delete", (timer_id: string) => {
      console.log(`Delete ${timer_id}`);

      this.timers = this.timers.filter((val) => val.id !== timer_id);
      this.requestUpdate("timers");
    });
  }

  handleChange(e: CustomEvent<string>) {
    this.socket.emit(e.type, e.detail);
  }

  render() {
    return html`
      <h2 id="title">${this.workspace_title}</h2>
      <p id="description">${this.workspace_description}</p>
      <p id="id">Join using : ${this.workspace_id}</p>

      <h3>Timers</h3>
      <div
        id="timers"
        @start=${this.handleChange}
        @pause=${this.handleChange}
        @stop=${this.handleChange}
        @reset=${this.handleChange}
      >
        ${this.connected
          ? this.timers.map(
              (val) =>
                html`<class-timer-socket
                  key="${val.id}"
                  elapsedTime="${val.elapsedTime}"
                  status="${val.status}"
                  time="${val.time}"
                >
                  <h2>${val.title}</h2>
                </class-timer-socket>`
            )
          : html`<p>Connecting to backend...</p>`}
      </div>
    `;
  }
}
