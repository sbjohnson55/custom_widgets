(function()  {
	let template = document.createElement("template");
	template.innerHTML = `
		<button type="button" id="sampleButton">Click Me!</button>
		<style>
		:host {
			display: block;
			padding: 1em 1em 1em 1em;
		}
		</style>
	`;

	class ProjectBuilderPanel extends HTMLElement {
		constructor() {
			super();
			this._shadowRoot = this.attachShadow({mode: "open"});
			this._shadowRoot.appendChild(template.content.cloneNode(true));
			this._button = this._shadowRoot.getElementById("sampleButton");
		}
		onCustomWidgetAfterUpdate(changedProperties) {
			console.log("Now");
		}

		handleButtonClick(){
			console.log("Button clicked");
		}
		_submit(e) {
			e.preventDefault();
			this.dispatchEvent(new CustomEvent("propertiesChanged", {
					detail: {
						properties: {
							opacity: this.opacity
						}
					}
			}));
		}

		set opacity(newOpacity) {
			this._shadowRoot.getElementById("builder_opacity").value = newOpacity;
		}

		get opacity() {
			return this._shadowRoot.getElementById("builder_opacity").value;
		}

		connectedCallback(){
			this._button.addEventListener('click',(e)=>this.handleButtonClick());
		   
		}
	}

	customElements.define("com-sap-sample-project-builder", ProjectBuilderPanel);
})();