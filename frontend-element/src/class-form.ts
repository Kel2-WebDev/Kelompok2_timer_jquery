import $ from "jquery";
import { html, css, LitElement } from "lit";
import { customElement, state} from "lit/decorators.js";

@customElement("class-form")
export class ClassTimer extends LitElement {
  static styles = css`

  `;

  @state()
  private workspace_id?: String;

  onChange(e: any) {
    // update the property so that it keeps up with the input's current workspace_id
    e.preventDefault()
    this.workspace_id = e.target.value;

    console.log(this.workspace_id)
  }

  onSubmit(e: any) {
    //TO DO:
    //Validasi workspace id

    window.location.href = "timer.html?workspace_id="+this.workspace_id;
  }

  render() {
    return html`
    <div>
        <input name="workspace_id" type="text" @input=${this.onChange} value=${this.workspace_id}/>
        <button @click=${this.onSubmit}>Submit</button>
    </div>
    `;
  }
}
