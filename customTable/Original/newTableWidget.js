(async function () {
    let template = document.createElement("template");
    template.innerHTML = `
      <style>
        .testgrid { border-collapse: collapse; border: 1px solid #CCB; width: 800px; }
        .testgrid td, .testgrid th { padding: 5px; border: 1px solid #E0E0E0; }
        .testgrid th { background: #E5E5E5; text-align: left; }
        input.invalid { background: red; color: #FDFDFD; }
      </style> 
      <div style="width: 100%; height: 100%;">
        <slot name="content"></slot>
      </div>
    `;
    function getScriptPromisify(src) {
        return new Promise(resolve => {
          $.getScript(src, resolve);
        });
      }
      
    class CustomTable extends HTMLElement {
      constructor() {
        super(); 
        this._shadowRoot = this.attachShadow({ mode: 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));
      }
  
      async connectedCallback() {
        // Load the scripts in the correct order
        await getScriptPromisify("https://www.editablegrid.net/templates/editablegrid_2015/js/editablegrid/editablegrid_utils.js")
        await getScriptPromisify("https://www.editablegrid.net/templates/editablegrid_2015/js/editablegrid/editablegrid.js");
  
        const editableGrid = new EditableGrid("DemoGridJSON");
        editableGrid.detectDir = detectDir;
  
        editableGrid.tableLoaded = function() { 
          editableGrid.renderGrid(this._shadowRoot.querySelector("slot[name=content]"), "testgrid"); 
        };
        editableGrid.loadJSON("./grid.json");
      }
    }
  
    customElements.define("com-sap-sample-google-table", CustomTable);
  })();
  
  function detectDir() {
    var scripts = document.getElementsByTagName('script');
    var path = scripts[scripts.length - 1].src.split('?')[0];
    return path.split('/').slice(0, -1).join('/') + '/';
  }
  