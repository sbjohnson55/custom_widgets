(function()  {
	let template = document.createElement("template");
	template.innerHTML = `
			<fieldset>
				<legend>Display Options</legend>
				<table>
                    <tr>
                        <td>
                            <input type="radio" id="id" name="displayType" value="id">
                            <label for="html">ID</label><br>
                            <input type="radio" id="description" name="displayType" value="description" checked>
                            <label for="css">Description</label><br>
                            <input type="radio" id="id-description" name="displayType" value="id-description">
                            <label for="javascript">ID-Description</label>
                        </td>
                    </tr>
				</table>
			</fieldset>
		<style>
		:host {
			display: block;
			padding: 1em 1em 1em 1em;
		}
		</style>
	`;

	class SearchBoxBuilderPanel extends HTMLElement {
		constructor() {
			super();
			this._shadowRoot = this.attachShadow({mode: "open"});
			this._shadowRoot.appendChild(template.content.cloneNode(true));
            this._rbs = this._shadowRoot.querySelectorAll('input[name="displayType"]');
            //this._displayType=this.displayType;
        
		}


		set displayType(displayType) {
            console.log("line 54 in builder:"+displayType);
            this._shadowRoot.querySelector('#'+displayType).checked=true;
            console.log(this._shadowRoot.querySelector('#'+displayType));
			//this._shadowRoot.getElementById("builder_opacity").value = newOpacity;
		}

		get displayType() {
            console.log("line 61 in builder:"+this.displayType);
            return this.displayType;
		}

        changeDisplayType(e){
            let displayType = e.path[0].value;
            console.log("line 67 in builder:"+displayType);

            this.dispatchEvent(new CustomEvent("propertiesChanged", {
                detail: {
                 properties: {
                     'displayType': displayType
                 }
             }
            }));
        }

        connectedCallback(){
            for(const rb of this._rbs){
                rb.addEventListener('change',(e)=>this.changeDisplayType(e));
            }

           
        }
	}

	customElements.define("com-sap-sample-searchbox-builder", SearchBoxBuilderPanel);
})();