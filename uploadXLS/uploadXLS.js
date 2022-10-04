/*!

JSZip - A Javascript class for generating and reading zip files
<http://stuartk.com/jszip>

(c) 2009-2014 Stuart Knightley <stuart [at] stuartk.com>
Dual licenced under the MIT license or GPLv3. See https://raw.github.com/Stuk/jszip/master/LICENSE.markdown.

JSZip uses the library pako released under the MIT license :
https://github.com/nodeca/pako/blob/master/LICENSE
*/
var getScriptPromisify = (src) => {
    return new Promise(resolve => {
      $.getScript(src, resolve)
    })
  }

(function () {
    const template = document.createElement('template');
    template.innerHTML = `
    <style>
    :host {
    font-size: 13px;
    font-family: arial;
    overflow: auto;
    }
    </style>
    <section hidden>
    <article>
    <label for="fileUpload">Upload</label>
    
        <span></span><button id="remove">Remove</button>

    </article>
    <input hidden id="fileUpload" type="file" accept=".xls,.xlsx,.xlsm" />
    </section>
    `;

    class UploadXLS extends HTMLElement{
        constructor(){
            super();

            //HTML objects
            this.attachShadow({mode:'open'});
            this.shadowRoot.appendChild(template.content.cloneNode(true));
            this._input = this.shadowRoot.querySelector('input');
            this._remove = this.shadowRoot.querySelector('#remove');

    
            //XLS related objects
            this._sheetNames=null; //holds array of Sheet Names
            this._data=null; //holds JSON Array returned from XLS sheet
        }

        /**
         * This method displays the file selector to the end-user by executing the click event on the HTML object stored in the this._input variable
         * The rest of the upload is handled in the onChange() event of the input control stored in the connectedCallback() function. The onChange() event
         * calls the loadCSV() function and passes in the CSV file as a parameter
         */
        showFileSelector(){
            this.handleRemove(); //remove any existing files, required if this action is run multiple times in the same session
            console.log("In ShowFileSelector()");
            this._input.click();
        }

        //retrieve the data in the CSV file
        getData(sheetName){
            return this._data[sheetName];
        }

        getSheetNames(){
            return this._sheetNames;
        }

        setNames(sheetNames){
            this._sheetNames=sheetNames;
        }

        setData(newData){
            this._data=newData;
        }

        async parseExcel(file) {
            
            await getScriptPromisify('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.8.0/jszip.js');
            await getScriptPromisify('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.8.0/xlsx.js');
            const temp = this;

            var reader = new FileReader();

            reader.onload = function(e) {
              var data = e.target.result;
              var workbook = XLSX.read(data, {
                type: 'binary'
              });
              var sheetData = [];
              var sheetNames =[];
              workbook.SheetNames.forEach(function(sheetName) {
                // Here is your object
                var XL_row_object = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
                var json_object = JSON.stringify(XL_row_object);
                var rowData = JSON.parse(json_object);
                sheetNames.push(sheetName);
                sheetData[sheetName]=rowData;
              })
              temp.setData(sheetData);
              temp.setNames(sheetNames);
              temp.handleRemove();
              temp.dispatch('onFileUpload');
            }
            reader.onerror = function(ex) {
                console.log(ex);
              };
      
            reader.readAsBinaryString(file);
        }
       


    //events

        //triggered when a user removes the Excel file
        handleRemove() {
            const el = this._input;
            const file = el.files[0];
            el.value = "";
            this.dispatch('change', file);
        }
        handleFileSelect(evt) {
            console.log(Date.now()); //prints timestamp to console...for testing purposes only
            var files = evt.target.files; // FileList object
            
            this.setData(this.parseExcel(files[0]));
            
        }

        dispatch(event, arg) {
            this.dispatchEvent(new CustomEvent(event, {detail: arg}));
        }


        /**
         * standard Web Component function used to add event listeners
         */
        connectedCallback(){
            this._input.addEventListener('change',(e)=>this.handleFileSelect(e));
            this._remove.addEventListener('click',()=>this.handleRemove());
        
        }

    }

    window.customElements.define('com-sap-sample-uploadxls',UploadXLS);
})()