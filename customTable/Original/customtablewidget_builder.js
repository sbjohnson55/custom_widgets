(function()  {
    let template = document.createElement("template");
    template.innerHTML = `
      <form id="form">
      <ui5-button id="btn">This is a button</ui5-button>
        <fieldset>
          <legend>Table Properties</legend>
          <table>
            <tr>
              <td>Title</td>
              <td><input id="builder_title" type="text" size="20" maxlength="50"></td>
            </tr>
            <tr>
              <td>Model</td>
              <td><button id="builder_model" type="button">Select Model</button></td>
            </tr>
            <tr>
              <td>Measures</td>
              <td>
                <div id="builder_measures"></div>
                <table id="builder_measures_table"></table>
              </td>
            </tr>
            <tr>
              <td>Dimensions</td>
              <td>
                <div id="builder_dimensions"></div>
                <table id="builder_dimensions_table"></table>
              </td>
            </tr>
          </table>
          <input type="submit" style="display:none;">
        </fieldset>
      </form>
      <style>
        :host {
          display: block;
          padding: 1em 1em 1em 1em;
        }
      </style>
    `;
  
    class TableBuilderPanel extends HTMLElement {
      
      constructor() {
        super();
        this._shadowRoot = this.attachShadow({mode: "open"});
        this._shadowRoot.appendChild(template.content.cloneNode(true));
        this._shadowRoot.getElementById("form").addEventListener("submit", this._submit.bind(this));
        this._changedModel=false;
        
  
        this._measures = [];
        this._dimensions = [];
  
        this._populateMeasureSelector();
        this._populateDimensionSelector();
      }
  
      async _showModelSelector(){
        const dataBinding = this.dataBindings.getDataBinding('myDataBinding');
        await dataBinding.openSelectModelDialog();
        this._changedModel=true;
        console.log(dataBinding);
        //await dataBinding.addDimensionToFeed("dimensions", dimensionId)
      }
      _populateMeasureSelector() {
        const measureSelector = new sap.m.MultiComboBox({
          items: {
            path: '/',
            template: new sap.ui.core.Item({
              key: '{id}',
              text: '{description}'
            })
          }
        });
        measureSelector.setModel(new sap.ui.model.json.JSONModel(this._measures));
        measureSelector.placeAt(this._shadowRoot.querySelector("#builder_measures"));
      }
  
      _populateDimensionSelector() {
        const dimensionSelector = new sap.m.MultiComboBox({
          items: {
            path: '/',
            template: new sap.ui.core.Item({
              key: '{id}',
              text: '{description}'
            })
          }
        });
        dimensionSelector.setModel(new sap.ui.model.json.JSONModel(this._dimensions));
        dimensionSelector.placeAt(this._shadowRoot.querySelector("#builder_dimensions"));
      }
  
      _submit(e) {
        e.preventDefault();
      
        const title = this._shadowRoot.getElementById("builder_title").value;
        const model = this._shadowRoot.getElementById("builder_model").value;
        const measures = this._shadowRoot.querySelector("#builder_measures").getSelectedKeys();
        const dimensions = this._shadowRoot.querySelector("#builder_dimensions").getSelectedKeys();
      
        const config = {
          title,
          model,
          measures,
          dimensions,
        };
      
        const event = new CustomEvent("submit", {
          detail: {
            config
          }
        });
        this.dispatchEvent(event);
      }
    
    
    onCustomWidgetBeforeUpdate(changedProperties) {
        console.log('BeforeUpdate');
    }

    async onCustomWidgetAfterUpdate(changedProperties) {
        console.log(this.myDataBinding.state);
        if(this.myDataBinding.state==='success' && this._changedModel){
            this._changedModel=false;
            const dataBinding = this.dataBindings.getDataBinding('myDataBinding');
            let ds = await dataBinding.getDataSource();
            console.log(await ds.getInfo());
            this._dimensions = await ds.getDimensions();
            this._populateDimensionSelector();
            this._measures = await ds.getMeasures();
            this._populateMeasureSelector();
        }
    }

      connectedCallback() {
        this._shadowRoot.getElementById("builder_model").addEventListener("click", ()=>this._showModelSelector());
        
        // Create dimension selector
        const dimensionSelector = document.createElement("select");
        dimensionSelector.setAttribute("multiple", "");
    
        // Create dimension options and add to selector
        const dimensions = ["Dimension 1", "Dimension 2", "Dimension 3"];
        dimensions.forEach((dimension) => {
          const option = document.createElement("option");
          option.value = dimension;
          option.text = dimension;
          dimensionSelector.appendChild(option);
        });
    
        // Add dimension selector to the DOM
        const dimensionSelectorLabel = document.createElement("label");
        dimensionSelectorLabel.innerText = "Dimensions:";
        const dimensionSelectorContainer = this._shadowRoot.querySelector("#builder_dimensions");
        dimensionSelectorContainer.appendChild(dimensionSelectorLabel);
        dimensionSelectorContainer.appendChild(dimensionSelector);
    
        // Add listener for changes to dimension selector
        dimensionSelector.addEventListener("change", () => {
          const dimensionTableBody = this._shadowRoot.querySelector("#builder_dimensions_table tbody");
    
          // Remove any existing rows from the table
          while (dimensionTableBody.firstChild) {
            dimensionTableBody.removeChild(dimensionTableBody.firstChild);
          }
    
          // Loop through the selected options and create a row in the table for each
          for (const option of dimensionSelector.selectedOptions) {
            const row = dimensionTableBody.insertRow();
            const cell1 = row.insertCell();
            cell1.textContent = option.value;
            const cell2 = row.insertCell();
            const displaySelect = document.createElement("select");
            displaySelect.setAttribute("data-dimension", option.value);
            const idOption = document.createElement("option");
            idOption.value = "id";
            idOption.text = "Display ID";
            const descriptionOption = document.createElement("option");
            descriptionOption.value = "description";
            descriptionOption.text = "Display Description";
            const bothOption = document.createElement("option");
            bothOption.value = "both";
            bothOption.text = "Display Both";
            displaySelect.appendChild(idOption);
            displaySelect.appendChild(descriptionOption);
            displaySelect.appendChild(bothOption);
            cell2.appendChild(displaySelect);
          }
        });
      }
    }
    
    customElements.define("custom-table-widget-builder", TableBuilderPanel);
})();        
