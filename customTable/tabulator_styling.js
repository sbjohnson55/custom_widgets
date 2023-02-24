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
      <form id="form">
        <div class="form-group">
          <label for="styling_title">Title</label>
          <input type="text" class="form-control" id="styling_title" placeholder="Enter table title">
        </div>
        <div class="form-group">
          <label for="styling_background_color">Background Color</label>
          <input type="color" class="form-control" id="styling_background_color">
        </div>
        <div class="form-group">
          <label for="styling_title_color">Title Color</label>
          <input type="color" class="form-control" id="styling_title_color">
        </div>
        <div class="form-group">
          <label for="styling_title_size">Title Size</label>
          <input type="number" class="form-control" id="styling_title_size" min="1" max="100">
        </div>
        <div class="form-group form-check">
          <input type="checkbox" class="form-check-input" id="styling_enable_pagination">
          <label class="form-check-label" for="styling_enable_pagination">Enable Pagination</label>
        </div>
        <div class="form-group">
          <label for="styling_pagination_interval">Pagination Interval</label>
          <input type="number" class="form-control" id="styling_pagination_interval" min="1">
        </div>
        <div class="form-group form-check">
          <input type="checkbox" class="form-check-input" id="styling_enable_export">
          <label class="form-check-label" for="styling_enable_export">Enable Export</label>
        </div>
        <button type="submit" class="btn btn-primary">Apply Changes</button>
      </form>
    `;
  
  
    class TableStylingPanel extends HTMLElement {
      constructor() {
        super();
        this._shadowRoot = this.attachShadow({mode: "open"});
        this._shadowRoot.appendChild(template.content.cloneNode(true));
        const inputElements = this._shadowRoot.querySelectorAll('input');
        inputElements.forEach((input) => {
          input.addEventListener('input', () => {
            this.dispatchEvent(new CustomEvent("propertiesChanged", {
              detail: {
                properties: {
                  title: this.title,
                  backgroundColor: this.backgroundColor,
                  titleColor: this.titleColor,
                  titleSize: this.titleSize,
                  enablePagination: this.enablePagination,
                  paginationInterval: this.paginationInterval,
                  enableExport: this.enableExport
                }
              }
            }));
          });
        });
        getScriptPromisify('https://cdn.jsdelivr.net/npm/bootstrap/dist/js/bootstrap.bundle.min.js');
        this._setStyle('https://cdn.jsdelivr.net/npm/bootstrap/dist/css/bootstrap.min.css');


      }
      async onCustomWidgetBeforeUpdate(changedProperties) {
               

        console.log(changedProperties);
        }

    async onCustomWidgetAfterUpdate(changedProperties) {
        if (this.table && this.myDataBinding) {
            if(this.myDataBinding.state =='success'){
                const dataBinding = await this.dataBindings.getDataBinding('myDataBinding');
                console.log(dataBinding);
              }
        }
    }
      _submit(e) {
        e.preventDefault();
        this.dispatchEvent(new CustomEvent("propertiesChanged", {
            detail: {
              properties: {
                title: this.title,
                backgroundColor: this.backgroundColor,
                titleColor: this.titleColor,
                titleSize: this.titleSize,
                enablePagination: this.enablePagination,
                paginationInterval: this.paginationInterval,
                enableExport: this.enableExport
              }
            }
        }));
      }
      _setStyle(src) {
        const link = document.createElement('link');
        link.setAttribute('rel', 'stylesheet');
        link.setAttribute('type', 'text/css');
        link.setAttribute('href', src);
        this.shadowRoot.appendChild(link);
    }
  
      set title(newTitle) {
        this._shadowRoot.getElementById("styling_title").value = newTitle;
      }
  
      get title() {
        return this._shadowRoot.getElementById("styling_title").value;
      }
  
      set backgroundColor(newColor) {
        this._shadowRoot.getElementById("styling_background_color").value = newColor;
      }
  
      get backgroundColor() {
        return this._shadowRoot.getElementById("styling_background_color").value;
      }
  
      set titleColor(newColor) {
        this._shadowRoot.getElementById("styling_title_color").value = newColor;
      }
  
      get titleColor() {
        return this._shadowRoot.getElementById("styling_title_color").value;
      }
  
      set titleSize(newSize) {
        this._shadowRoot.getElementById("styling_title_size").value = newSize;
      }
  
      get titleSize() {
        return this._shadowRoot.getElementById("styling_title_size").value;
      }
  
      set enablePagination(newVal) {
        this._shadowRoot.getElementById("styling_enable_pagination").checked = newVal;
      }
  
      get enablePagination() {
        return this._shadowRoot.getElementById("styling_enable_pagination").checked;
      }

      set paginationInterval(newInterval) {
        this._shadowRoot.getElementById("styling_pagination_interval").value = newInterval;
      }
      
      get paginationInterval() {
        return this._shadowRoot.getElementById("styling_pagination_interval").value;
      }
      
      set enableExport(newVal) {
        this._shadowRoot.getElementById("styling_enable_export").checked = newVal;
      }
      
      get enableExport() {
        return this._shadowRoot.getElementById("styling_enable_export").checked;
      }
    }

    customElements.define("com-sap-sample-tabulator-styling", TableStylingPanel);
    })();
      
  