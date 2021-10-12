import $ from "jquery";
import { html, css, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";

@customElement("class-join")
export class ClassJoin extends LitElement {
  @state()
  private workspace_id: string = "";

  onChange(e: Event) {
    this.workspace_id = (<HTMLInputElement>e.target).value;
  }

  onSubmit(e: Event) {
    e.preventDefault();

    window.location.href = "timer.html?workspace_id=" + this.workspace_id;
  }

  render() {
    return html`
      <div>
        <h1>Join Workspace</h1>
        <input
          name="id"
          type="text"
          placeholder="id"
          @change=${this.onChange}
        />
        <button @click=${this.onSubmit}>Join</button>
      </div>
    `;
  }
}
