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
    .bi-pencil-square::before {
        content: "\\f4ca";
    }

    </style>
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.6.1/font/bootstrap-icons.css">
    <div class="container">
    <form id="form" class="row flex-wrap">
      <div class="col-sm-2 col-form-label">
        <label for="builder_title">Title:</label>
      </div>
      <div class="col-sm-8">
        <input id="builder_title" type="text" class="form-control" maxlength="50">
      </div>
      <div class="col-sm-2">
  
      </div>
      <div class="col-sm-2 col-form-label">
        <label for="builder_model">Model:</label>
      </div>
      <div class="col-sm-8 d-flex">
        <input id="builder_model" type="text" class="form-control flex-grow-1" maxlength="50">
        <div>
          <button id="select_model_button" type="button" class="btn btn-primary">
            <i class="bi bi-pencil-square"></i>
          </button>
        </div>
      </div>
      <div class="col-sm-2 col-form-label">
        <label for="builder_measures">Measures:</label>
      </div>
      <div class="col-sm-10">
        <select id="builder_measures" class="form-control" multiple></select>
      </div>
      <div class="col-sm-2 col-form-label">
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
        

            
        }

        connectedCallback() {
            /*
           loadCSS('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.6.1/font/bootstrap-icons.css')
              .then(() => {
                loadCSS('https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css')
                  .then(() => {
                    console.log('Stylesheets loaded successfully!');
                    const container = this._shadowRoot.querySelector('.container');
                    const form = this._shadowRoot.querySelector('#form');
                    const newInput = document.createElement('div');
                    newInput.classList.add('col-sm-8');
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.classList.add('form-control');
                    input.placeholder = 'New Input';
                    newInput.appendChild(input);
                    form.insertBefore(newInput, form.lastChild);
                  })
                  .catch((err) => {
                    console.error('Error loading Bootstrap CSS:', err);
                  });
              })
              .catch((err) => {
                console.error('Error loading Bootstrap Icons CSS:', err);
              });
              */
              getScriptPromisify('https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js');
              
              
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
  
