var getScriptPromisify = (src) => {
  return new Promise(resolve => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    document.head.appendChild(script);
  });
}
(function()  {
    let template = document.createElement("template");
    template.innerHTML = `
    <style>
    :host {
      display: block;
      padding: 1em 1em 1em 1em;
    }

    .edit-icon::before {
      content: "\\e038"; /* Unicode value for the "edit" icon */
      font-family: "SAP-icons";
    }
    #form legend {
      font-size: 1.5em;
      font-weight: bold;
    }
  
    #form table {
      border-collapse: collapse;
    }
  
    #form td {
      padding: 0.5em;
      vertical-align: top;
    }
    
  
    #builder_model:focus,
    #builder_title:focus {
      outline: none;
      box-shadow: none;
      border-color: #52b3d9;
    }
  
    #select_model_button {
      background-color: rgb(247, 247, 247);
      color: rgb(52,97,135);
      border-color: rgb(247, 247, 247);
      cursor: pointer;
      border-radius: 0.25rem;
    }
  
    #select_model_button:hover {
      background-color: rgb(52,97,135);
      border-color: rgb(52,97,135);
      color: white;
    }

  </style>
  <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.6.1/font/bootstrap-icons.css">

  <div class="container">
  <form id="form" class="row align-items-center">
    <div class="col-sm-2">
      <label for="builder_title">Title:</label>
    </div>
    <div class="col-sm-10">
      <input id="builder_title" type="text" class="form-control" style="border-width:0.75em" maxlength="50">
    </div>
    <div class="col-sm-2">
      <label for="builder_model">Model:</label>
    </div>
    <div class="col-sm-9">
      <input id="builder_model" type="text" class="form-control" style="border-width:0.75em" maxlength="50">
    </div>
    <div class="col-sm-1">
      <button id="select_model_button" type="button" class="btn btn-primary">
        <i class="edit-icon"></i>
      </button>
    </div>
    <div class="col-sm-2">
      <label for="builder_measures">Measures:</label>
    </div>
    <div class="col-sm-10">
      <div class="dropdown">
        <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          Select Items
        </button>
        <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
          <div class="form-check">
            <input class="form-check-input" type="checkbox" value="" id="flexCheckDefault">
            <label class="form-check-label" for="flexCheckDefault">
              Default checkbox
            </label>
          </div>
          <div class="form-check">
            <input class="form-check-input" type="checkbox" value="" id="flexCheckChecked" checked>
            <label class="form-check-label" for="flexCheckChecked">
              Checked checkbox
            </label>
          </div>
        </div>
      </div>
    </div>
    <div class="col-sm-2">
      <label for="builder_dimensions">Dimensions:</label>
    </div>
    <div class="col-sm-10">
      <div class="dropdown">
        <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          Select Items
        </button>
        <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
          <div class="form-check">
            <input class="form-check-input" type="checkbox" value="" id="flexCheckDefault">
            <label class="form-check-label" for="flexCheckDefault">
              Default checkbox
            </label>
          </div>
          <div class="form-check">
            <input class="form-check-input" type="checkbox" value="" id="flexCheckChecked" checked>
            <label class="form-check-label" for="flexCheckChecked">
              Checked checkbox
            </label>
          </div>
        </div>
      </div>
    </div>
    <div class="col-sm-12">
      <button type="submit" style="display:none;"></button>
    </div>
  </form>
</div>





  
    `;
  
    class TableBuilderPanel extends HTMLElement {
      
      constructor() {
        super();
        this._shadowRoot = this.attachShadow({mode: "open"});
        this._shadowRoot.appendChild(template.content.cloneNode(true));
        this._shadowRoot.getElementById("form").addEventListener("submit", this._submit.bind(this));
       // loadCSS('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.6.1/font/bootstrap-icons.css');
       // loadCSS('https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css');
        
        getScriptPromisify('https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js');
        getScriptPromisify('https://cdn.jsdelivr.net/npm/@popperjs/core@2.9.3/dist/umd/popper.min.js');

        this._changedModel=false;
        this._modelInfo = {};
        
  
        this._measures = [];
        this._dimensions = [];
  
        this._populateMeasureSelector();
        this._populateDimensionSelector();
      }
  
      _setStyle(src) {
        const link = document.createElement('link');
        link.setAttribute('rel', 'stylesheet');
        link.setAttribute('type', 'text/css');
        link.setAttribute('href', src);
        this._shadowRoot.appendChild(link);
    }

      async _showModelSelector(){
        const dataBinding = this.dataBindings.getDataBinding('myDataBinding');
        await dataBinding.openSelectModelDialog();
        this._changedModel=true;
        console.log(dataBinding);
        //await dataBinding.addDimensionToFeed("dimensions", dimensionId)
      }
      _populateMeasureSelector() {
        const measureSelector = this._shadowRoot.getElementById("builder_measures");
        measureSelector.innerHTML = "";
  
        for (let i = 0; i < this._measures.length; i++) {
          const measure = this._measures[i];
          const option = document.createElement("option");
          option.setAttribute("value", measure.id);
          option.innerHTML = measure.description;
          measureSelector.appendChild(option);
        }
      }
  
      _populateDimensionSelector() {
        const dimensionSelector = this._shadowRoot.getElementById("builder_dimensions");
        //dimensionSelector.innerHTML = "";
  
        for (let i = 0; i < this._dimensions.length; i++) {
          const dimension = this._dimensions[i];
          const option = document.createElement("option");
          option.setAttribute("value", dimension.id);
          option.innerHTML = dimension.description;
          dimensionSelector.appendChild(option);
        }
      }
  
      _submit(e) {
        e.preventDefault();
      
        const title = this._shadowRoot.getElementById("builder_title").value;
        const model = this._shadowRoot.getElementById("builder_model").value;
        const measures = Array.from(this._shadowRoot.getElementById("builder_measures").selectedOptions).map(o => o.value);
        const dimensions = Array.from(this._shadowRoot.getElementById("builder_dimensions").selectedOptions).map(o => o.value);
      
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

    _handleDropdownSelection() {
        const checkboxes = this._shadowRoot.querySelectorAll('.dropdown-menu input[type="checkbox"]');
        const checkedItems = [];
        checkboxes.forEach((checkbox) => {
          if (checkbox.checked) {
            checkedItems.push(checkbox.parentElement.innerText.trim());
          }
        });
        console.log(checkedItems); // Do something with the selected items
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

      async connectedCallback() {
        this._shadowRoot.getElementById("select_model_button").addEventListener("click", ()=>this._showModelSelector());
        const dataBinding = this.dataBindings.getDataBinding('myDataBinding');
        let ds = await dataBinding.getDataSource();
        //console.log(await ds.getInfo());
        this._modelInfo = await ds.getInfo();
        


        const checkboxes = this._shadowRoot.querySelectorAll('.dropdown-menu input[type="checkbox"]');
        checkboxes.forEach((checkbox) => {
          checkbox.addEventListener('change', this._handleDropdownSelection);
        });
        
        const dropdownMenu = this._shadowRoot.querySelector('.dropdown-menu');
        const dropdownButton = this._shadowRoot.querySelector('.dropdown-toggle');
        
        dropdownButton.addEventListener('click', (event) => {
          event.stopPropagation();
          dropdownMenu.classList.toggle('show');
        });
        
        window.addEventListener('click', (event) => {
          if (!event.target.matches('.dropdown-toggle') && !event.target.closest('.dropdown-menu') && !event.target.matches('com-sap-sample-tabulator-builder.sapCustomWidgetBuilderPanelWebComponent')) {
            if(!event.target.matches('.form-check-input')) {
              dropdownMenu.classList.remove('show');
            }
          }
        });

     
      }
    }
    
    customElements.define("com-sap-sample-tabulator-builder", TableBuilderPanel);
})();   

function loadCSS(url) {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = url;
    link.onload = () => resolve();
    link.onerror = (err) => reject(err);
    document.head.appendChild(link);
  });
}
