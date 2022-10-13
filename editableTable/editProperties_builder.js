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

	class EditPropertiesBuilderPanel extends HTMLElement {
		constructor() {
			super();
			this._shadowRoot = this.attachShadow({mode: "open"});
			this._shadowRoot.appendChild(template.content.cloneNode(true));
			this._button = this._shadowRoot.getElementById("sampleButton");
		}
		async onCustomWidgetAfterUpdate(changedProperties) {
			console.log("Now");
			let ds = this.dataBindings.getDataBinding('myDataBinding').getDataSource();
			let dims = await ds.getDimensions();
			console.log(dims);
			if(dims.length >1){
				console.log(dims[1].id);
				let props = await ds.getDimensionProperties(dims[1].id);
				console.log(props);
			}
			//console.log(await ds.getDimensions());

		}

		handleButtonClick(){
			console.log("Button clicked");
			const dataBinding = this.dataBindings.getDataBinding('myDataBinding');
			dataBinding.openSelectModelDialog();
			console.log(dataBinding.getDataSource());  
			
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

	customElements.define("com-sap-sample-edit-properties-builder", EditPropertiesBuilderPanel);
})();