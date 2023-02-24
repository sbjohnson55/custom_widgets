var getScriptPromisify = (src) => {
    return new Promise(resolve => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      document.head.appendChild(script);
    });
  }
  
  (function() { 
    let template = document.createElement("template");
    template.innerHTML = `
    <style>
        :host {
  display: block;
  height: 100px;
  width: 200px;
  overflow: auto;

}

#myGrid {
  height: 105px;
  width: 200px;
}



</style>
<div id="myGrid" class="ag-theme-alpine"></div>
    `;
  
    class CustomAGTable extends HTMLElement {
      constructor() {
        super(); 
        this._shadowRoot = this.attachShadow({ mode: 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));

       this._setStyle('https://cdn.jsdelivr.net/npm/ag-grid-community/dist/styles/ag-grid.min.css');
       this._setStyle('https://cdn.jsdelivr.net/npm/ag-grid-community/dist/styles/ag-theme-alpine.min.css');
       this._myGrid = this._shadowRoot.getElementById('myGrid');
       const columnDefs = [
        { field: "make" },
        { field: "model" },
        { field: "price" }
      ];
      
      // specify the data
      const rowData = [
        { make: "Toyota", model: "Celica", price: 35000 },
        { make: "Ford", model: "Mondeo", price: 32000 },
        { make: "Porsche", model: "Boxster", price: 72000 }
      ];
  

      this.gridOptions = {
        alwaysShowHorizontalScroll: true,
        alwaysShowVerticalScroll: true,
        columnDefs: columnDefs,
        rowData: rowData
       };
       getScriptPromisify('https://cdn.jsdelivr.net/npm/ag-grid-community/dist/ag-grid-community.min.js').then(() => {
        new agGrid.Grid(this._myGrid, this.gridOptions);
      });
     
      }
      
      _setStyle(src){
        const link = document.createElement('link');
        link.setAttribute('rel', 'stylesheet');
        link.setAttribute('type', 'text/css');
        link.setAttribute('href', src);
        this.shadowRoot.appendChild(link);
      }
    }
  
    customElements.define("com-sap-sample-ag-table", CustomAGTable);
  })();