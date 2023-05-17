var getScriptPromisify = (src) => {
    return new Promise(resolve => {
      $.getScript(src, resolve)
      
    })
  }
  
(function() { 
  const template = document.createElement('template');
  template.innerHTML = `
  <section hidden>
  </section>
        `;

    class ExportDimensions extends HTMLElement {

        constructor() {
            super(); 
            this._shadowRoot = this.attachShadow({ mode: 'open' })
            this._shadowRoot.appendChild(template.content.cloneNode(true))

            this._root = this._shadowRoot.getElementById('root')

            this.__tokenURL = 'https://demo-presalesuki.authentication.eu10.hana.ondemand.com/oauth/token';
            this._baseURL = 'https://demo-presalesuki.eu10.sapanalytics.cloud';
            this._modelId = 'Ctpolv1971k145abbramqp8pfs'; //holds the modelID of the selected model in the Designer
            this._factData = [];
            this._levelData = [];
            this._combinedData = [];
            this._aggregatedData = [];
            this._numberOfLevels = 0;
            this._aggregateDIM = "";
            this._contextDIMs = [];
            this._hierarchyMap = new Map();
                     
        }

        getAccessToken() {
          const url = this.__tokenURL+'/?grant_type=client_credentials&x-sap-sac-custom-auth=true';
        
          return fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Authorization': 'Basic ' + btoa('sb-da9f3c1d-5e73-43e2-9d5d-cb33466f7e57!b31482|client!b3650:38a5bad1-4d26-4130-8ab1-bdf3cce38261$Jne-iEd2UabgnBTfqN03AHOBHBgC0g2nA4TaErYX5Cs=')
            },
          })
            .then(response => response.json())
            .then(data => {
              this._token = data.access_token;
            });
          
        }
      
        getMasterData(dimension, filterMembers) {
          const serviceName = dimension + 'Master';
          let url = '';
          if(filterMembers.length>0){
            const filterString = filterMembers.map(member => `ID eq '${member.displayId}'`).join(' or ');
            url = `${this._baseURL}/api/v1/dataexport/providers/sac/${this._modelId}/${serviceName}?$filter=${encodeURIComponent(filterString)}&$orderby=ID`;
            console.log(filterString);
          }else{
            url = `${this._baseURL}/api/v1/dataexport/providers/sac/${this._modelId}/${serviceName}?$orderby=ID`;
          }
          
          console.log(url);
          return fetch(url, {
            method: 'GET',
            headers: {
              'Authorization': 'Bearer ' + this._token,
              'x-sap-sac-custom-auth': true
            },
          })
            .then(response => response.json())
            .then(data => {
              console.log('Master Data:');
              console.log(data);
              return data.value;
            });
        }
        

       async exportDimension(modelID,dimension,hierarchy,filterMembers,fileName){
          this._modelId = modelID;
          await this.getAccessToken();
          const masterData = await this.getMasterData(dimension,filterMembers);
          console.log(masterData);
          await this.downloadCSV(masterData,hierarchy,fileName);
        }

        async downloadCSV(data, hierarchy, fileName) {
          // Determine the hierarchy attribute based on the provided hierarchy parameter
          const hierarchyAttribute = hierarchy === 'H1' ? 'HIER_1' : 'HIER_2';
      
          // Initialize the headers with ID, Description, and the selected hierarchy
          const headers = ['ID', 'Description', hierarchy];
      
          // Determine the additional headers from the first object in the data array
          // Exclude the ones already included and the other hierarchy
          const firstObject = data[0];
          for (const key in firstObject) {
              if (key !== 'ID' && key !== 'Description' && key !== 'HIER_1' && key !== 'HIER_2') {
                  headers.push(key);
              }
          }
      
          // Initialize the CSV content with the headers
          let csv = headers.join(',') + '\n';
      
          // Add each data row to the CSV content
          for (const object of data) {
              let row = [];
              for (const header of headers) {
                  // For the hierarchy column, use the value from the selected hierarchy attribute
                  if (header === hierarchy) {
                      row.push(object[hierarchyAttribute]);
                  } else {
                      row.push(object[header]);
                  }
              }
              csv += row.join(',') + '\n';
          }
      
          // Create a Blob with the CSV data and download the file
          let blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
          if (navigator.msSaveBlob) { // IE 10+
              navigator.msSaveBlob(blob, fileName);
          } else {
              let link = document.createElement("a");
              if (link.download !== undefined) { // feature detection
                  // Browsers that support HTML5 download attribute
                  let url = URL.createObjectURL(blob);
                  link.setAttribute("href", url);
                  link.setAttribute("download", fileName);
                  link.style.visibility = 'hidden';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
              }
          }
          this.dispatch('onFileDownload');
      }
      
      dispatch(event, arg) {
        this.dispatchEvent(new CustomEvent(event, {detail: arg}));
    }
      
    }

    customElements.define("com-sap-sample-export-dimensions", ExportDimensions);
})();