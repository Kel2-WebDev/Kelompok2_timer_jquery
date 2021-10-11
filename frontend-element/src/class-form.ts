import $ from "jquery";
import { html, css, LitElement } from "lit";
import { customElement, state} from "lit/decorators.js";

@customElement("class-form")
export class ClassForm extends LitElement {
    @state()
    private input_data: {title: string, description: string} = {title:"", description:""};

    onChange(e: any) {
        e.preventDefault()

        let name  = e.target.name;
        let value = e.target.value;
        
        this.input_data = {
            ...this.input_data,
            [name]: value
        }
        console.log(this.input_data)
    }

    onSubmit(e: any) {
        $.ajax({url:"http://localhost:3001/workspace", data:JSON.stringify(this.input_data), 
            contentType:"application/json; charset=utf-8", type:"POST", traditional:true}).done((res) => {
            console.log(res)

            window.location.href = "timer.html?workspace_id="+res.id;
        })
    }

    render() {
        return html`
        <div>
            <h1>Create Workspace</h1>
            <input name="title" type="text" placeholder="Title" @change=${this.onChange}/>
            <input name="description" type="text" placeholder="Description" @change=${this.onChange}/>
            <button @click=${this.onSubmit}>Generate</button>
        </div>
        <div>
            <h6>Already have id?
            <a href="./join.html">Join Workspace</a>
            </h6>
        </div>
        `;
    }
}