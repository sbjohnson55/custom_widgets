(function() {
    let template = document.createElement("template");
    template.innerHTML = `
        <style>
            :host {
                display: block;
            }
        </style>
        <div>
            <h1></h1>
            <table>
                <thead>
                    <tr></tr>
                </thead>
                <tbody></tbody>
            </table>
        </div>
    `;

    class CustomTableWidget extends HTMLElement {
        constructor() {
            super();
            let shadowRoot = this.attachShadow({ mode: "open" });
            shadowRoot.appendChild(template.content.cloneNode(true));
            this._props = {};
            this._data = null;
            this._dimensions= [];
            this._measures=[];
        }

        onCustomWidgetBeforeUpdate(changedProperties) {
            this._props = { ...this._props, ...changedProperties };
        }

        onCustomWidgetAfterUpdate(changedProperties) {
            if ("title" in changedProperties) {
                this.shadowRoot.querySelector("h1").innerText = changedProperties.title;
            }
            if ("data" in changedProperties) {
                let columns = changedProperties.data.columns;
                let rows = changedProperties.data.rows;

                // Render table columns
                let columnHtml = "";
                for (let i = 0; i < columns.length; i++) {
                    columnHtml += "<th>" + columns[i] + "</th>";
                }
                this.shadowRoot.querySelector("thead tr").innerHTML = columnHtml;

                // Render table rows
                let rowHtml = "";
                for (let j = 0; j < rows.length; j++) {
                    rowHtml += "<tr>";
                    for (let k = 0; k < rows[j].length; k++) {
                        rowHtml += "<td contenteditable='true'>" + rows[j][k] + "</td>";
                    }
                    rowHtml += "</tr>";
                }
                this.shadowRoot.querySelector("tbody").innerHTML = rowHtml;

                // Add event listener for changes to table cells
                this.shadowRoot.querySelectorAll("td").forEach(function(cell) {
                    cell.addEventListener("input", function(event) {
                        // Get the row and column index of the cell that was edited
                        let rowIndex = event.target.parentNode.rowIndex - 1;
                        let colIndex = event.target.cellIndex;

                        // Update the corresponding value in the data array
                        rows[rowIndex][colIndex] = event.target.textContent;

                        // Trigger the data binding update
                        this.dispatchEvent(new CustomEvent("onDataChange", {
                            detail: {
                                data: { columns: columns, rows: rows }
                            }
                        }));
                    }.bind(this));
                }.bind(this));
            }

            // Read data using the DataBinding API
    
            if (this.myDataBinding && this.myDataBinding.data) {
                var metadata = this.myDataBinding.metadata;
                //check to ensure that both dimensions and measures have been added
                if(metadata.feeds.dimensions && metadata.feeds.measures){
                    this._dimensions=[];
                    this._measures=[];
                    for(let i=0;i<metadata.feeds.dimensions.values.length;i++){
                        let newDim = {
                            id:metadata.dimensions[metadata.feeds.dimensions.values[i]].id,
                            label:metadata.dimensions[metadata.feeds.dimensions.values[i]].description,
                            lookup:metadata.feeds.dimensions.values[i]
                        };
                        this._dimensions.push(newDim);
                    }
                    for(let i=0;i<metadata.feeds.measures.values.length;i++){
                        let newMeasure = {
                            id:metadata.mainStructureMembers[metadata.feeds.measures.values[i]].id,
                            label:metadata.mainStructureMembers[metadata.feeds.measures.values[i]].label,
                            lookup:metadata.feeds.measures.values[i]
                        };
                        this._measures.push(newMeasure);
                    }
                    let data = this.myDataBinding.data;
                    console.log(this._dimensions);
                    console.log(this._measures);
                    if(data.length>0){
                        // Traverse result set
                        
                        // Render table columns
                        let columnHtml = "";
                        for (let i = 0; i < this._dimensions.length; i++) {
                            columnHtml += "<th>" + this._dimensions[i].label + "</th>";
                        }
                        for (let i = 0; i < this._measures.length; i++) {
                            columnHtml += "<th>" + this._measures[i].label + "</th>";
                        }

                        this.shadowRoot.querySelector("thead tr").innerHTML = columnHtml;

                        // Render table rows
                        let rowHtml = "";

                        data.forEach((row) => {
                            for (let i = 0; i < this._dimensions.length; i++) {
                              let index = this._dimensions[i].lookup;
                              rowHtml += "<td isMeasure=false dimID='"+this._dimensions[i].id+"' memberID='"+ row[index].id +"'>" + row[index].label + "</td>";
                            }

                            for (let i = 0; i < this._measures.length; i++) {
                                let index = this._measures[i].lookup;
                                let unit = '';
                                if(row[index].unit){
                                    unit = row[index].unit; 
                                }
                                if(row[index].formatted.endsWith('c')){
                                    unit = 'Percent';
                                }
                                rowHtml += "<td contenteditable='true' isMeasure=true dimID='"+this._measures[i].id+"' formattedValue='"+ row[index].formatted +"' rawValue='"+ row[index].raw +"' unit='"+ unit +"' >" + row[index].formatted + "</td>";
                            }
                            rowHtml += "</tr>";
                          });
                        
                        this.shadowRoot.querySelector("tbody").innerHTML = rowHtml;
                        
                    }
                }
                
                
            }
        }


        updateData(newData) {
            console.log(newData);
            this._data=newData;
            /*
            if (newData.columns && newData.rows) {
                this._props = Object.assign({}, this._props, {
                    data: {
                        columns: newData.columns,
                        rows: newData.rows
                    }
                });
                this.onCustomWidgetAfterUpdate(this._props);
            }
            */
            
        }

        
    
        // Data binding listener to update component's data
        onDataBindingChange(event) {
            let data = event.detail.data;
            this.updateData(data);
        }
    }
    customElements.define("custom-table-widget", CustomTableWidget);
})();     
