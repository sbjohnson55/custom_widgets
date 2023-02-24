var getScriptPromisify = (src) => {
    return new Promise(resolve => {
      $.getScript(src, resolve)
      
    })
  }
  
(function() { 
    let template = document.createElement("template");
    template.innerHTML = `
            <style>
            </style> 
            <div id="tablecontent" style="width: 100%; height: 100%;">
        `;

    class CustomTable extends HTMLElement {

        constructor() {
            super(); 
            this._shadowRoot = this.attachShadow({ mode: 'open' })
            this._shadowRoot.appendChild(template.content.cloneNode(true))

            this._root = this._shadowRoot.getElementById('root')
                     
        }
                  
        connectedCallback(){

          }
    }

    customElements.define("com-sap-sample-google-table", CustomTable);
})();