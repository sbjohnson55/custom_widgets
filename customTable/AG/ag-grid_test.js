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
      height: 100%;
      width: 100%;
    }
    
    #myGrid {
      height: 100%;
      width: 100%;
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

      this.isGridReady = false; // add flag to track grid readiness

      const columnDefs = [
        { field: "make" },
        { field: "model" },
        { field: "price" }
      ];

      const rowData = [
        { 
          make: "Toyota", 
          model: "Celica", 
          price: 35000,
          metadata: {
            make_technicalID: "[make].[H1].&[Toyota]",
            model_technicalID: "[model].[H1].&[Celica]",
            price_technicalID: "[Measures].[H1].&[price]"
          }
        },
        { 
          make: "Ford", 
          model: "Mondeo", 
          price: 32000,
          metadata: {
            make_technicalID: "[make].[H1].&[Ford]",
            model_technicalID: "[model].[H1].&[Mondeo]",
            price_technicalID: "[Measures].[H1].&[price]"
          }
        },
        { 
          make: "Porsche", 
          model: "Boxster", 
          price: 72000,
          metadata: {
            make_technicalID: "[make].[H1].&[Porsche]",
            model_technicalID: "[model].[H1].&[Boxster]",
            price_technicalID: "[Measures].[H1].&[price]"
          }
        }
      ];

      this.gridOptions = {
        alwaysShowHorizontalScroll: true,
        alwaysShowVerticalScroll: true,
        columnDefs: columnDefs,
        rowData: rowData,
        animateRows: true,
        onGridReady: () => { // set onGridReady event
          this.isGridReady = true;
        },
        onCellClicked: (params) => {
         // const metadata = params.node.metadata; // get the metadata associated with the clicked cell
          //const technicalID = metadata?.technicalID; // get the technicalID from the metadata
          //console.log('Technical ID:', technicalID);
          console.log(params);
        }
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

    onCustomWidgetAfterUpdate(changedProperties) {
      if (this.isGridReady && this.myDataBinding) { // only execute if grid is ready

        if(this.myDataBinding.state =='success'){
          
        /*
          const columnDefsTemp = [
            { field: "make" },
            { field: "model" },
            { field: "price" }
          ];

          const rowDataTemp = [
            { make: "Toyota", model: "Celica", price: 35000 },
            { make: "Ford", model: "Mondeo", price: 32000 },
            { make: "Porsche", model: "Boxster", price: 72000 }
          ];
        */
          const columnDefsTemp = [
            {
              headerName: "make",
              valueGetter: function(params) {
                const rowData = params.data;
                const metadata = rowData.technicalID;
                params.node.setDataValue("technicalID", metadata);
                return rowData.make;
              }
            },
            {
              headerName: "model",
              valueGetter: function(params) {
                const rowData = params.data;
                const metadata = rowData.technicalID;
                params.node.setDataValue("technicalID", metadata);
                return rowData.model;
              }
            },
            {
              headerName: "price",
              valueGetter: function(params) {
                const rowData = params.data;
                const metadata = rowData.technicalID;
                params.node.setDataValue("technicalID", metadata);
                return rowData.price;
              }
            }
          ];
          
          console.log(columnDefsTemp);
          // specify the data
          const rowDataTemp = [
            {
              make: "Toyota",
              model: "Celica",
              price: 35000,
              make_technicalID: "[make].[H1].&[Toyota]",
              model_technicalID: "[model].[H1].&[Celica]",
              price_technicalID: "[Measures].[H1].&[price]"
            },
            {
              make: "Ford",
              model: "Mondeo",
              price: 32000,
              make_technicalID: "[make].[H1].&[Ford]",
              model_technicalID: "[model].[H1].&[Mondeo]",
              price_technicalID: "[Measures].[H1].&[price]"
            },
            {
              make: "Porsche",
              model: "Boxster",
              price: 72000,
              make_technicalID: "[make].[H1].&[Porsche]",
              model_technicalID: "[model].[H1].&[Boxster]",
              price_technicalID: "[Measures].[H1].&[price]"
            }
          ];
          console.log(rowDataTemp);
          
                      

          this.gridOptions.api.setColumnDefs(columnDefsTemp);
          this.gridOptions.api.setRowData(rowDataTemp);

          console.log(this.gridOptions);
        }
      }
    }
  }

  customElements.define("com-sap-sample-ag-table", CustomAGTable);
})();
