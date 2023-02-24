var getScriptPromisify = (src) => {
    return new Promise(resolve => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      document.head.appendChild(script);
    });
  }
(function () {
    let template = document.createElement("template");
    template.innerHTML = `
    <style>
    :host {
      display: block;
      height: 100%;
      width: 100%;
      overflow: auto;
    }
    #myTable {
        height: 99%;
        width: 99%;
        background-color: transparent;
    }

    #tableTitle {
        display: block;
        font-color: #970c0c;
        font-size: 16;
    }
    .tabulator .tabulator-header .tabulator-col .tabulator-col-content{
        font-size: 16px;
    }
      </style>
      <div id="tableTitle"></div>
      <div>
        <button id="save">Save Changes</button>
        <button id="odata">Test ODATA</button>
      </div>
      <div id="myTable"></div>
    `;

    class CustomTable extends HTMLElement {
        constructor() {
            super();
            this._shadowRoot = this.attachShadow({ mode: 'open' });
            this._shadowRoot.appendChild(template.content.cloneNode(true));
            this._setStyle('https://unpkg.com/tabulator-tables/dist/css/tabulator.min.css');

            this._tableTitle = this.shadowRoot.getElementById('tableTitle');
            this._planTable = null;
            this._save = this.shadowRoot.querySelector('#save');
            this._odata = this.shadowRoot.querySelector('#odata');
            this._token = '';
            this._model = null;
            this.__tokenURL = 'https://sac-gcoe-americas2.authentication.us10.hana.ondemand.com/oauth/token';
            this._baseURL = 'https://sac-gcoe-americas2.us10.sapanalytics.cloud';
            this._modelId = ''; //holds the modelID of the selected model in the Designer
            this._ds=null;
            this._selectedRow = null;
          
            // define properties using the `getProperty` method
            this._properties = {
              title: 'Chart Title',
              backgroundColor: '#970c0c',
              titleColor: '#970c0c',
              titleSize: 16,
              enablePagination: true,
              paginationInterval: 10,
              enableExport: true,
            };
          }
        
        async onCustomWidgetAfterUpdate(changedProperties) {
            if (this.table && this.myDataBinding) {
                if(changedProperties.hasOwnProperty('myDataBinding')){
                    if(this.myDataBinding.state =='success'){
                        const dataBinding = await this.dataBindings.getDataBinding('myDataBinding');
                        console.log(dataBinding);
                        this._ds = await dataBinding.getDataSource();
                        const dims = await this._ds.getDimensions();
                        for(var i=0;i<dims.length;i++){
                            let dimFilters = await this._ds.getDimensionFilters(dims[i]);
                            console.log(dims[i]);
                            console.log(dimFilters);
                        }
                        const dsInfo = await this._ds.getInfo();
   
                        const tempModelId = dsInfo.modelId;

                        if(tempModelId !== undefined){
                            this._modelId = this._parseModelID(tempModelId);
                            //this.testODATA();
                        }
                        
                        console.log('In onCustomWidgetAfterUpdate');
                        this._populateTable();
                    }else if (this.myDataBinding.state =='error'){
                        console.log("There is an error: " +this.myDataBinding.messages[0].message);
                    }

                }
                
            }
            console.log(changedProperties);
        /*
            if (changedProperties.hasOwnProperty('title') || changedProperties.hasOwnProperty('backgroundColor') || changedProperties.hasOwnProperty('titleColor') || changedProperties.hasOwnProperty('titleSize') || changedProperties.hasOwnProperty('enablePagination') || changedProperties.hasOwnProperty('paginationInterval') || changedProperties.hasOwnProperty('enableExport')) {
                this.title = this.getProperty('title');
                this.backgroundColor = this.getProperty('backgroundColor');
                this.titleColor = this.getProperty('titleColor');
                this.titleSize = this.getProperty('titleSize');
                this.enablePagination = this.getProperty('enablePagination');
                this.paginationInterval = this.getProperty('paginationInterval');
                this.enableExport = this.getProperty('enableExport');
              }
              */
              
            if (changedProperties.hasOwnProperty('title')){
                this._tableTitle.innerHTML= this.title;
            }
            if (changedProperties.hasOwnProperty('titleColor')){
                this._tableTitle.style.color = this.titleColor;
            }
            if (changedProperties.hasOwnProperty('titleSize')){
                this._tableTitle.style.fontSize = this.titleSize + 'px';
            }
            if (changedProperties.hasOwnProperty('enableExport')){
                if(this.enableExport){
                    this._tableTitle.style.display = 'block';
                }else{
                    this._tableTitle.style.display = 'none';
                }
                
            }
            
        } 

        async _populateTable() {
            if (this.myDataBinding && this.myDataBinding.data) {
                const metadata = this.myDataBinding.metadata;

                // check to ensure that both dimensions and measures have been added
                if (metadata.feeds.dimensions && metadata.feeds.measures) {
                    this._dimensions = [];
                    this._measures = [];
                    const columnDefs = [];

                    // create column definitions for dimensions
                    /*
                     *       The metadata object has the following structure:
                     *      metadata = {
                     *          dimensions: [], //list of dimensions in the feed
                     *            mainStructureMembers: [], //list of measures in the feed
                     *            feeds: {
                     *               dimensions: {
                     *                   type:dimension,
                     *                    values: [array of values using the identifiers from the dimensions property above]
                     *                }
                     *                measures: {
                     *                    type: mainStructureMembers,
                     *                    values: [array of values using the identifiers from the mainStructureMembers property above]
                     *                }
                     *           }
                     *        }
                     * 
                     *  an example of what this metadata object will look like is below:
                     * 
                        metadata: {
                            dimensions: {
                                dimensions_0: {id: 'Date', description: 'Date'},
                                dimensions_1: {id: 'Version', description: 'Version'},
                                dimensions_2: {id: 'Account.accType', description: 'Account Type'}
                            },
                            feeds: {
                                dimensions: {
                                    type: "dimension",
                                    values: [
                                    0:"dimensions_0"
                                    1:"dimensions_1"	
                                    2:"dimensions_2"
                                    ]
                                },

                                measures: {
                                    type: "mainStructureMember",
                                    values: [
                                    0:"measures_0"
                                    1:"measures_1"
                                    ]
                                }
                            },
                            mainStructureMembers:{
                                measures_0:{
                                    id: "[Account].[parentId].&[SOP_HC]",
                                    label: "Start of Period HC"
                                },
                                measures_1: { 
                                    id: "[Account].[parentId].&[EOP_HC]",
                                    label: "End of Period HC"
                                }
                            }
                        }
                     * 
                     *  
                     *  and here is an example of the datafeed populated
                     * 
                     *  data: [
                            0: {
                                dimensions_0: {
                                    id: '[Date].[YQM].[Date.CALQUARTER].[20211]', 
                                    label: '20211 Q1', 
                                    parentId: '[Date].[YQM].[Date.YEAR].[2021]', 
                                    isNode: true, 
                                    isCollapsed: true
                                },
                                dimensions_1: {
                                    id: 'public.Actual', label: 'Actual'
                                },
                                dimensions_2: {
                                    id: '', label: ''
                                },
                                measures_0: {
                                    raw: 95, 
                                    formatted: '95.00'
                                },
                                measures_1: {
                                    raw: 95, 
                                    formatted: '95.00'
                                }
                            }
                            1: {
                                dimensions_0: {
                                    id: '[Date].[YQM].[Date.CALQUARTER].[20212]', 
                                    label: '20212 Q2', 
                                    parentId: '[Date].[YQM].[Date.YEAR].[2021]', 
                                    isNode: true, 
                                    isCollapsed: true
                                },
                                dimensions_1: {
                                    id: 'public.Actual', 
                                    label: 'Actual'
                                },
                                dimensions_2: {
                                    id: '', 
                                    label: ''
                                },
                                measures_0: {
                                    raw: 66, 
                                    formatted: '66.00'
                                },
                                measures_1: {
                                    raw: 66, 
                                    formatted: '66.00'
                                }
                            }
                        ]
                     * 
                     *  For use with Tabulator JS we need to convert these elements to use the following patterns
                     * 
                     *   columnDef : [   //holds an array of columns
                     *          {
                     *              title: the label you want to show as the column header,
                     *              field: the value that the data will map to
                     *          }
                     *   ]
                     * 
                     *    rowData : [  //holds array of rows
                     *          columnDef[0].field: value,
                     *          columnDef[1].field: value,
                     *          ...
                     *          columnDef[n].field: value,
                     *          extra_metadata: will be available when users click, etc.                      * 
                     *    ]
                     * 
                     *   So with both of these constructs in mind we will use the metadata object of the datafeed to create the columnDefs
                     * 
                     *  as the datafeed uses its own indexing (e.g. dimension_0, measure_1, etc.) to retrieve the data we will store the ID of the
                     *  dimension and measure as a lookup property of a constant where we are storing an array of selected dimensions and measures.
                     *  This is because every other action we want to do in SAC (e.g. save data, update filter, etc.) will require the ID of the 
                     *  selected dimension or measure
                     * 
                     */
                    for (let i = 0; i < metadata.feeds.dimensions.values.length; i++) {
                        let newDim = {
                            title: metadata.dimensions[metadata.feeds.dimensions.values[i]].description,
                            field: metadata.dimensions[metadata.feeds.dimensions.values[i]].id,
                            lookup: metadata.feeds.dimensions.values[i]
                        };
                        this._dimensions.push(newDim);
                        

                        newDim= {
                            title: metadata.dimensions[metadata.feeds.dimensions.values[i]].description,
                            field: metadata.dimensions[metadata.feeds.dimensions.values[i]].id
                        };
                        columnDefs.push(newDim);
                    }

                    // create column definitions for measures
                    for (let i = 0; i < metadata.feeds.measures.values.length; i++) {
                        let measureField = this._truncateMeasureName(metadata.mainStructureMembers[metadata.feeds.measures.values[i]].id);
                        let newMeasure = {
                            title: metadata.mainStructureMembers[metadata.feeds.measures.values[i]].label,
                            field: measureField,
                            lookup:metadata.feeds.measures.values[i],
                            measureId:metadata.mainStructureMembers[metadata.feeds.measures.values[i]].id
                        };
                        this._measures.push(newMeasure);

                        newMeasure = {
                            title: metadata.mainStructureMembers[metadata.feeds.measures.values[i]].label,
                            field: measureField,
                            hozAlign:"right",
                            editor:"number"
                        };
                        columnDefs.push(newMeasure);
                    }

                    // create row data
                    const rowData = [];
                    const data = this.myDataBinding.data;
                    if (data.length > 0) {
                         // Traverse result set
                        data.forEach((row) => {
                            const rowDef = {};
                            let arrSelection = [];
                            
                            for (let i = 0; i < this._dimensions.length; i++) {
                                let selection = {};
                                let index = this._dimensions[i].lookup;
                                selection[this._dimensions[i].field] = row[index].id;
                                arrSelection.push(selection);
                                rowDef[this._dimensions[i].field]=row[index].label;
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
                                  measure_definition['@Measures']=this._measures[i].measureId;
                                  measure_definition.unit=unit;
                                  measure_definition.raw=row[index].raw;
                                  measure_definition.formatted = row[index].formatted;
                                  arrMeasures.push(measure_definition);
                                  rowDef[this._measures[i].field]=row[index].raw;
                              }
                              rowDef.measures = arrMeasures;
      
                              rowData.push(rowDef);
                        });
                    }
                    

                    // update the Tabulator table

                    await this.table.setColumns(columnDefs);
                    await this.table.setData(rowData);
                    this.table.redraw(true);
                    
                }
            }
        }

        //Tabulator does not handle field values in the default format that SAC provides. For example a field value of [Account].[parentId].&[SOP_HC]
        //will result in no data showing up. So we need to parse out the field value using this function
        _truncateMeasureName(str){
            return str.substring(str.lastIndexOf('[') + 1, str.lastIndexOf(']'));
        }

        getProperty(name) {
        return this._properties[name];
        }
        
        setProperty(name, value) {
        this._properties[name] = value;
        }

        _handleRowClickedEvent(rowData) {
            this._selectedRow=rowData;
            
            console.log('Here is the selected row: '+ this._selectedRow);

        }

        async _handleCellEditedEvent(cell) {
            console.log('In cell edit event');
            console.log(this._selectedRow);
            let temp = await cell;
            console.log(temp);
        }

        async _handleSave(){
            let plan = await this._planTable.getPlanning();
            let selection = {Version: 'public.Actual', '@MeasureDimension': '[Account].[parentId].&[SOP_HC]'};
            //let randomInt = Math.floor(Math.random() * (50 - 20 + 1)) + 20;
            console.log(await plan.setUserInput(selection,"33"));
            console.log(await plan.submitData());
        }


        autoSizeAll() {
            this.table.setColumns(this.columnData);
        }

        _setStyle(src) {
            const link = document.createElement('link');
            link.setAttribute('rel', 'stylesheet');
            link.setAttribute('type', 'text/css');
            link.setAttribute('href', src);
            this.shadowRoot.appendChild(link);
        }

        async onCustomWidgetBeforeUpdate(changedProperties) {
        }

        async setTable(table){
            this._planTable = table;
            console.log(table.constructor.name);
            /*
            let plan = await table.getPlanning();
            let selection = {Version: 'public.Actual', '@MeasureDimension': '[Account].[parentId].&[SOP_HC]'};
            //let randomInt = Math.floor(Math.random() * (50 - 20 + 1)) + 20;
            console.log(await plan.setUserInput(selection,"33"));
            console.log(await plan.submitData());
            */
        }

        getAccessToken() {
            const url = this.__tokenURL+'/?grant_type=client_credentials&x-sap-sac-custom-auth=true';
          
            return fetch(url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + btoa('sb-2367afdf-3eba-4df8-b14e-a1ff549215d3!b1459|client!b655:CHbh3Ju2881E3HvMY4Wlkg0F1no=')
              },
            })
              .then(response => response.json())
              .then(data => {
                this._token = data.access_token;
              });
            
          }
        
          getModel() {
            const url = this._baseURL+'/api/v1/dataexport/providers/sac/'+this._modelId +'/';
          
            return fetch(url, {
              method: 'GET',
              headers: {
                'Authorization': 'Bearer ' + this._token,
              },
            })
              .then(response => response.json())
              .then(data => {
                console.log(data);
                this._models = data;
              });
          }
        async _testODATA(){
            const dataBinding = await this.dataBindings.getDataBinding('myDataBinding');
            console.log(dataBinding);
            this._ds = await dataBinding.getDataSource();
            const dims = await this._ds.getDimensions();
            for(var i=0;i<dims.length;i++){
                let dimFilters = await this._ds.getDimensionFilters(dims[i]);
                console.log(dims[i]);
                console.log(dimFilters);
            }
            /* this code WORKS!! just commented out until we get ODATA write back
            await this.getAccessToken();
            console.log(this._token);

            if(this._modelId !==''){
                await this.getModel();
                console.log(this._model);
            }
            */
            

            /*
            // Set up the POST request to receive an access token
            const postUrl = 'https://sac-gcoe-americas2.authentication.us10.hana.ondemand.com/oauth/token/?grant_type=client_credentials&x-sap-sac-custom-auth=true';
            const postHeaders = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + btoa('sb-2367afdf-3eba-4df8-b14e-a1ff549215d3!b1459|client!b655:CHbh3Ju2881E3HvMY4Wlkg0F1no=')
            };

            // Make the POST request to receive an access token
            fetch(postUrl, {
            method: 'POST',
            headers: postHeaders
            })
            .then(response => response.json())
            .then(data => {
                const accessToken = data.access_token;

                // Set up the GET request with the access token
                const getUrl = 'https://sac-gcoe-americas2.us10.sapanalytics.cloud/administration/Namespaces(NamespaceID=\'sac\')/Providers';
                const getHeaders = {
                'Authorization': 'Bearer ' + accessToken
                };

                // Make the GET request with the access token
                fetch(getUrl, {
                headers: getHeaders
                })
                .then(response => response.json())
                .then(data => console.log(data))
                .catch(error => console.error(error));
            })
            .catch(error => console.error(error));
            */

        }
        //parses the modelID to a format that can be used with the ODATA request
        _parseModelID(tempModelId){
            const inputString = tempModelId;
            const lastIndex = inputString.lastIndexOf(":");
            const result = inputString.substring(lastIndex + 1);
            return result; 
        }

        connectedCallback() {
            this._myTable = this.shadowRoot.getElementById('myTable');
            this._handleRowClickedEvent = this._handleRowClickedEvent.bind(this);
            this._handleCellEditedEvent = this._handleCellEditedEvent.bind(this);
            this._populateTable = this._populateTable.bind(this);
            this._save.addEventListener('click',()=>this._handleSave());
            this._odata.addEventListener('click',()=>this._testODATA());

            const columns = [];    
            const data = [];
        
            // create Tabulator table
            this.gridOptions = {
              data: data,
              layout: 'fitColumns',
              columns: columns,
              //height: '97%',
            };


            getScriptPromisify('https://unpkg.com/tabulator-tables/dist/js/tabulator.min.js').then(() => {
              this.table = new Tabulator(this._myTable, this.gridOptions);
              this.table.on("tableBuilt", () => {
                this._populateTable();
              });
              this.table.on("rowClick", function(e, row){ 
                    window._selectedRow = row.getData();

                });
                this.table.on("cellEdited", function(cell){ 
                    console.log(cell.getValue());
                    console.log(cell.getField());
                    console.log(cell.getRow().getData());
                });
              
            });
        }
    }

    customElements.define("com-sap-sample-tabulator", CustomTable);
})();