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
      height: 650px;
      width: 1000px;
      overflow: auto;
    }
    #myGrid {
      height: 618px;
      width: 976px;
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
       this.handleCellClickedEvent = this.handleCellClickedEvent.bind(this);

       const columnDefs = [

      ];
      
      // specify the data
      const rowData = [
      ];

      this.gridOptions = {
        alwaysShowHorizontalScroll: true,
        alwaysShowVerticalScroll: true,
        columnDefs: columnDefs,
        rowData: rowData,
        animateRows: true,
        onGridReady: () => { // set onGridReady event
          this.isGridReady = true;
          this.populateGrid();
        },
        onCellValueChanged: this.handleCellValueChangedEvent,
        onCellClicked: this.handleCellClickedEvent
       };
       getScriptPromisify('https://cdn.jsdelivr.net/npm/ag-grid-community/dist/ag-grid-community.min.js').then(() => {
        new agGrid.Grid(this._myGrid, this.gridOptions);
      });
     
      }
      populateGrid(){
        console.log(this.isGridReady);
        console.log('in populatedGrid');
        if (this.myDataBinding && this.myDataBinding.data) {
            console.log(this.myDataBinding.data);
            var metadata = this.myDataBinding.metadata;
            console.log(metadata);
             //check to ensure that both dimensions and measures have been added
            if(metadata.feeds.dimensions && metadata.feeds.measures){
                this._dimensions=[];
                this._measures=[];
                const columnDefs = [];
                for(let i=0;i<metadata.feeds.dimensions.values.length;i++){
                    let newDim = {
                        id:metadata.dimensions[metadata.feeds.dimensions.values[i]].id,
                        label:metadata.dimensions[metadata.feeds.dimensions.values[i]].description,
                        lookup:metadata.feeds.dimensions.values[i]
                    };
                    this._dimensions.push(newDim);

                    let newColumn = {
                        field: newDim.label,
                        pinned:top,
                        colId: newDim.id,
                        filter: true,
                        wrapHeaderText:true,
                        sortable:true,
                        floatingFilter: true
                    };
                    columnDefs.push(newColumn);
                }
                for(let i=0;i<metadata.feeds.measures.values.length;i++){
                    let newMeasure = {
                        id:metadata.mainStructureMembers[metadata.feeds.measures.values[i]].id,
                        label:metadata.mainStructureMembers[metadata.feeds.measures.values[i]].label,
                        lookup:metadata.feeds.measures.values[i]
                    };
                    this._measures.push(newMeasure);
                    
                    let newColumn = {
                        field: newMeasure.label,
                        colId: newMeasure.id,
                        pinned:top,
                        filter: true,
                        wrapHeaderText:true,
                        sortable:true,
                        editable:true,
                        floatingFilter: true
                    };
                    columnDefs.push(newColumn);
                }
                const rowData = [];
                
                let data = this.myDataBinding.data;
                if(data.length>0){
                    // Traverse result set
                    data.forEach((row) => {
                        let rowDef = {};
                        let arrSelection = [];
                        let selection = {};
                        for (let i = 0; i < this._dimensions.length; i++) {
                          let index = this._dimensions[i].lookup;
                          selection[this._dimensions[i].id] = row[index].id;
                          arrSelection.push(selection);
                          rowDef[this._dimensions[i].label]=row[index].label;
                        }
                        rowDef.selection=arrSelection;
                        let arrMeasures = [];
                        for (let i = 0; i < this._measures.length; i++) {
                            let measure_definition = {};
                            let index = this._measures[i].lookup;
                            let unit = '';
                            if(row[index].unit){
                                unit = row[index].unit; 
                            }
                            if(row[index].formatted.endsWith('c')){
                                unit = 'Percent';
                            }
                            measure_definition['@Measures']=this._measures[i].id;
                            measure_definition.unit=unit;
                            measure_definition.raw=row[index].raw;
                            measure_definition.formatted = row[index].formatted;
                            arrMeasures.push(measure_definition);
                            rowDef[this._measures[i].label]=row[index].formatted;
                        }
                        rowDef.measures = arrMeasures;

                        rowData.push(rowDef);


                      });
                    }

                this.gridOptions.api.setColumnDefs(columnDefs);
                this.gridOptions.api.setRowData(rowData);
                this.autoSizeAll(false);
                console.log(this.gridOptions);
                
              }
          }
      }
      handleCellClickedEvent(params){
        console.log(params);
        const grid = this._myGrid;
        console.log(grid.style.width);
        console.log(grid.style.height);

      }
      handleCellValueChangedEvent(params){
        console.log(params);
      }

      autoSizeAll(skipHeader) {
        const allColumnIds = [];
        this.gridOptions.columnApi.getColumns().forEach((column) => {
          allColumnIds.push(column.getId());
        });
      
        this.gridOptions.columnApi.autoSizeColumns(allColumnIds, skipHeader);
      }
      _setStyle(src){
        const link = document.createElement('link');
        link.setAttribute('rel', 'stylesheet');
        link.setAttribute('type', 'text/css');
        link.setAttribute('href', src);
        this.shadowRoot.appendChild(link);
      }

      async onCustomWidgetAfterUpdate(changedProperties) {
        if (this.isGridReady && this.myDataBinding) {
          if(this.myDataBinding.state =='success'){
            console.log('In onCustomWidgetAfterUpdate');
            this.populateGrid();
          }
        }

      }

      onResize(rect) {
        const grid = this._myGrid;
        const parentHeight = this.offsetParent.clientHeight;
        const maxHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--max-height').trim());
        const height = Math.max(parentHeight, maxHeight) + 1;
        /*
        this.style.width = `${rect.width}px`;
        this.style.height = `${height}px`;
        grid.style.width = `${rect.width}px`;
        grid.style.height = `${height}px`;
        */
      }
      
      connectedCallback() {
        const resizeObserver = new ResizeObserver((entries) => {
          for (const entry of entries) {
            if (entry.target === this.parentElement) {
              // parent element has been resized
              this.onResize(entry.contentRect);
            }
          }
        });
    
        resizeObserver.observe(this.parentElement);

      }
      
            
    }
  
    customElements.define("com-sap-sample-ag-table", CustomAGTable);
  })();
  