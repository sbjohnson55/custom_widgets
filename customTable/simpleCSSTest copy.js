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

    </style>

    <form id="form">
    <div class="row mb-3">
      <label for="builder_title" class="col-sm-2 col-form-label">Title:</label>
      <div class="col-sm-10">
        <input id="builder_title" type="text" class="form-control" maxlength="50">
      </div>
    </div>
    <div class="row mb-3">
      <label for="builder_model" class="col-sm-2 col-form-label">Model:</label>
      <div class="col-sm-8">
        <input id="builder_model" type="text" class="form-control" maxlength="50">
      </div>
      <div class="col-sm-2">
        <button id="select_model_button" type="button" class="btn btn-primary">
        <i class="bi bi-pencil-square" style="font-family: 'bootstrap-icons'"></i>
        </button>
  </div>
  
    </div>
    <div class="row mb-3">
      <label for="builder_measures" class="col-sm-2 col-form-label">Measures</label>
      <div class="col-sm-10">
        <select id="builder_measures" class="form-control" multiple></select>
      </div>
    </div>
    <div class="row mb-3">
      <label for="builder_dimensions" class="col-sm-2 col-form-label">Dimensions:</label>
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
    </div>
    <button type="submit" style="display:none;"></button>
  </form>

  <div class="card-body">
  <div id="formatForm" class="collapse show">
      <div class="form-row">
          <label class="text-muted" for="fontSelect">Styling</label>
      </div>
      <div class="form-row">
        <div class="col-3">
          <div id="boldOption" class="format-option">
            <i class="bi bi-type-bold"></i>
          </div>
        </div>
        <div class="col-3">
          <div id="italicOption" class="format-option">
            <i class="bi bi-type-italic"></i>
          </div>
        </div>
        <div class="col-3">
          <div id="underlineOption" class="format-option">
            <i class="bi bi-type-underline"></i>
          </div>
        </div>
        <div class="col-3">
          <div id="strikethroughOption" class="format-option">
            <i class="bi bi-type-strikethrough"></i>
          </div>
        </div>
      </div>
  </div>
  
</div>
    
      `;
    
      class TableBuilderPanel extends HTMLElement {
        constructor() {
            super();
            this._shadowRoot = this.attachShadow({mode: "open"});
            this._shadowRoot.appendChild(template.content.cloneNode(true));
            //getScriptPromisify('https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js');
            //getScriptPromisify('https://cdn.jsdelivr.net/npm/@popperjs/core@2.9.3/dist/umd/popper.min.js');


        }
        _setStyle(src) {
            const link = document.createElement('link');
            link.setAttribute('rel', 'stylesheet');
            link.setAttribute('type', 'text/css');
            link.setAttribute('href', src);
            this._shadowRoot.appendChild(link);
        }
        connectedCallback() {
            //this._setStyle('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.6.1/font/bootstrap-icons.css');
            /*
            loadCSS('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.6.1/font/bootstrap-icons.css')
                .then(() => {
                    console.log('icons loaded');
                })
                .catch((err) => {
                    console.error(err);
            });
            */

            /*
            loadCSS('https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css')
                .then(() => {
                    console.log('icons loaded');
                })
                .catch((err) => {
                    console.error(err);
            });
            */
           
            //this._setStyle('https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css');
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
  