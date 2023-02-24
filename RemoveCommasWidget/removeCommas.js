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
        `;

    class RemoveCommas extends HTMLElement {

        constructor() {
            super(); 
            this._shadowRoot = this.attachShadow({ mode: 'open' });
            this._shadowRoot.appendChild(template.content.cloneNode(true));

            this._root = this._shadowRoot.getElementById('root');
            this._replace = this.shadowRoot.querySelector('#replace');
            this._isEnabled = false; //used to determine whether the add-in has been enabled
            this._colHeaders=[];
            this._colIDs = {};
            this._numberOfHeaders = {};
            this._replaceAll = false;
            this._isScrolling = false;
            this._tableIDs = [];
            this._tables=[];

                     
        }

        removeAllCommas(tables){
          this._tables = tables;
          this.getTableIDs(tables);
          this._replaceAll=true;
          for(let i=0;i<this._tableIDs.length;i++){
            let tableID = this._tableIDs[i];
            let spans = document.querySelectorAll(`div[data-sap-widget-id="${tableID}"] span.cellValue.showEllipsis`);
            for (let span of spans) {
              span.textContent = span.textContent.replace(/,/g, '');
            }

          }
         
          this._isEnabled=true;
        }
        removeSelectedCommas(colHeaders,tables) {
          this._tables = tables;
          this.getTableIDs(tables);
          this._colHeaders = colHeaders;
          this._replaceAll=false;
          for(let i=0;i<this._tableIDs.length;i++){
            let tableID = this._tableIDs[i];
            let colIDs=[];
            let previousTitle = '';
            let headerCells = document.querySelectorAll(`div[data-sap-widget-id="${tableID}"] .tableCell.cellWithIcons.headerCell.colDimMember.dimensionMember`);
            this._numberOfHeaders[tableID]=headerCells.length;
            headerCells.forEach(headerCell => {
              let headerTitle =  headerCell.title.replace('*', '').trim();
              if(headerTitle===''){
                headerTitle=previousTitle;
              }
              if (colHeaders.includes(headerTitle)) {
                // get the index of the header cell
                let columnIndex = headerCell.attributes['data-tablecol'].value;
                colIDs.push(columnIndex);

                let spans = document.querySelectorAll(`div[data-sap-widget-id="${tableID}"] .tableCell[data-tablecol="${columnIndex}"] span.cellValue.showEllipsis`);
                for (let span of spans) {
                  span.textContent = span.textContent.replace(/,/g, '');
                }
              }
              previousTitle=headerTitle;
            });
            this._colIDs[tableID]=colIDs;

          }

          this._isEnabled=true;
        }
        updateHeaders(tableID) {
          let colIDs = [];
          let previousTitle = '';
          let headerCells = document.querySelectorAll(`div[data-sap-widget-id="${tableID}"] .tableCell.cellWithIcons.headerCell.colDimMember.dimensionMember`);

          headerCells.forEach(headerCell => {
            let headerTitle =  headerCell.title.replace('*', '').trim();
            if(headerTitle===''){
              headerTitle=previousTitle;
            }
            if (this._colHeaders.includes(headerTitle)) {
              // get the index of the header cell
              let columnIndex = headerCell.attributes['data-tablecol'].value;
              colIDs.push(columnIndex);

              let spans = document.querySelectorAll(`div[data-sap-widget-id="${tableID}"] .tableCell[data-tablecol="${columnIndex}"] span.cellValue.showEllipsis`);
              for (let span of spans) {
                span.textContent = span.textContent.replace(/,/g, '');
              }
            }
            previousTitle=headerTitle;
          });
          this._colIDs[tableID]=colIDs;
        }

        removeSelectedCommasWithIDs(tempTableId=null) {
          this._replaceAll=false;
          if(tempTableId===null){
            for(let i=0;i<this._tableIDs.length;i++){
              let tableID = this._tableIDs[i];
              this.removeSelectedCommasWithIDs(tableID);              
            }
          }else{
            let colIDs = this._colIDs[tempTableId];
              for(let x=0;x<colIDs.length;x++){
                let columnIndex = colIDs[x];
                let spans = document.querySelectorAll(`div[data-sap-widget-id="${tempTableId}"] .tableCell[data-tablecol="${columnIndex}"] span.cellValue.showEllipsis`);
                  for (let span of spans) {
                    span.textContent = span.textContent.replace(/,/g, '');
                  }
              }
          }
          this._isEnabled=true;
        }

        getTableIDs(tables){
          tables.forEach((table)=>{
            let tableID = table._scriptContext.instanceId.lastPair.relativeId;
            this._tableIDs.push(tableID);
            this.addHierarchyListener(tableID);
            this.addCellListeners(tableID); 
            this.addScrollbarListener(tableID);          

          });

        }

        addCellListeners(tableID){
          $(document).find(`div[data-sap-widget-id="${tableID}"] .cellValue.showEllipsis`).on('DOMSubtreeModified', (event) => {
            if (!this._isScrolling) {
              let parentElement = event.target.parentElement;
              while(!parentElement.hasAttribute('data-sap-widget-id')){
                parentElement = parentElement.parentElement;
              }
              let tableID = parentElement.getAttribute('data-sap-widget-id');
              this.applyCommaFormat(tableID);
            }
          });  
        }
        applyCommaFormat(tableID=null){
          if(this._isEnabled){
            if(this._replaceAll){
              if(tableID===null){
                this.removeAllCommas(this._tables);
              }else{
                this.removeAllCommas([tableID]);
              }              
            }else{         
                this.removeSelectedCommasWithIDs(tableID);
              }            
            
          }

        }
        
        addScrollbarListener(tableID){
          const scrollbarContainers = document.querySelectorAll(`div[data-sap-widget-id="${tableID}"] .scrollbarContainer`);

          scrollbarContainers.forEach((scrollbarContainer) => {
            scrollbarContainer.addEventListener('scroll', (event) => {
              let parentElement = event.target.parentElement;
              while(!parentElement.hasAttribute('data-sap-widget-id')){
                parentElement = parentElement.parentElement;
              }
              let tableID = parentElement.getAttribute('data-sap-widget-id');
              this.applyCommaFormat(tableID);
              if (this._isScrolling) {
                clearTimeout(this._isScrolling);
              }
              this._isScrolling = setTimeout(function() {

              }, 200); // Set a timeout of 200 milliseconds
            }, false);
          });
        }

        addHierarchyListener(tableID){
          const tableContainer = document.querySelector(`div[data-sap-widget-id="${tableID}"] .tableContainer`);
          const table = tableContainer.querySelector('.reactTable');

          // Create a new MutationObserver
          const observer = new MutationObserver(() => {
            // Get the header cells
            const colHeaders = table.querySelectorAll('.tableCell.cellWithIcons.headerCell.colDimMember.dimensionMember');
            // If the number of headers has changed, update the value and disconnect the observer
            if(colHeaders.length !== this._numberOfHeaders[tableID]){

              //assume a new column has been added
              this._numberOfHeaders[tableID] = colHeaders.length;
              this.updateHeaders(tableID);            
            }else{
              this.applyCommaFormat(tableID);
            }
            this.addScrollbarListener(tableID);
            this.addCellListeners(tableID);
          });

          // Start observing the table container for changes
          observer.observe(tableContainer, { childList: true, subtree: true });

        }

        connectedCallback(){
       }
        

        dispatch(event, arg) {
          this.dispatchEvent(new CustomEvent(event, {detail: arg}));
        }

    }

    customElements.define("com-sap-sample-remove-commas", RemoveCommas);
})();