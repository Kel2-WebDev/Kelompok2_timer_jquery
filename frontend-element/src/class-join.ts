import $ from "jquery";
import { html, css, LitElement } from "lit";
import { customElement, state} from "lit/decorators.js";

@customElement("class-join")
export class ClassJoin extends LitElement {
    onChange(e: any) {

    }

    onSubmit(e: any) {
        
    }

    render() {
        return html`
        <div>
            <h1>Join Workspace</h1>
            <input name="id" type="text" placeholder="id" @change=${this.onChange}/>
            <button @click=${this.onSubmit}>Join</button>
        </div>
        `;
    }
}