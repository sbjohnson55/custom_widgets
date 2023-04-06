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

    class CalculateLevels extends HTMLElement {

        constructor() {
            super(); 
            this._shadowRoot = this.attachShadow({ mode: 'open' })
            this._shadowRoot.appendChild(template.content.cloneNode(true))

            this._root = this._shadowRoot.getElementById('root')

            this.__tokenURL = 'https://sac-gcoe-americas2.authentication.us10.hana.ondemand.com/oauth/token';
            this._baseURL = 'https://sac-gcoe-americas2.us10.sapanalytics.cloud';
            this._modelId = ''; //holds the modelID of the selected model in the Designer
            this._factData = [];
            this._levelData = [];
            this._combinedData = [];
            this._aggregatedData = [];
            this._numberOfLevels = 0;
            this._aggregateDIM = "";
            this._contextDIMs = [];
                     
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
      
        getFactData() {
          const url = this._baseURL+'/api/v1/dataexport/providers/sac/'+this._modelId +'/FactData';
        
          return fetch(url, {
            method: 'GET',
            headers: {
              'Authorization': 'Bearer ' + this._token,
              'x-sap-sac-custom-auth':true
            },
          })
            .then(response => response.json())
            .then(data => {
              console.log(data);
              this._factData = data.value;
            });
        }

        getMasterData() {
          const url = this._baseURL+'/api/v1/dataexport/providers/sac/'+this._modelId +'/REGIONMaster';
        
          return fetch(url, {
            method: 'GET',
            headers: {
              'Authorization': 'Bearer ' + this._token,
              'x-sap-sac-custom-auth':true
            },
          })
            .then(response => response.json())
            .then(data => {
              console.log(data);
              this._levelData = data.value;
            });
        }

        getCombinedData() {
          const url = this._baseURL+'/api/v1/dataexport/providers/sac/'+this._modelId +'/MasterData';
        
          return fetch(url, {
            method: 'GET',
            headers: {
              'Authorization': 'Bearer ' + this._token,
              'x-sap-sac-custom-auth':true
            },
          })
            .then(response => response.json())
            .then(data => {
              console.log(data);
              return data.value;
            });
        }
        async getAggregateData(modelID,aggregateDIM,contextDims,numberOfLevels){
          this._modelId = modelID;
          this._aggregateDIM = aggregateDIM;
          this._contextDIMs=contextDims;
          this._numberOfLevels=numberOfLevels;
          this._aggregatedData = await this.aggregateDataCombined(this._numberOfLevels);
          return this._aggregatedData;
        }
        async testODATA(){
          await this.getAccessToken();
            console.log(this._token);

            if(this._modelId !==''){
                //await this.getFactData();
                //await this.getMasterData();
                await this.getCombinedData();
                this._numberOfLevels = 3;
                
                //this._aggregatedData = await this.aggregateData(this._factData,this._levelData,this._numberOfLevels);
                this._aggregatedData = await this.aggregateDataCombined(this._numberOfLevels);
                console.log(this._aggregatedData);
            }
        }
        async aggregateData(factData, masterData,numberOfLevels) {
          const result = [];

          const levelAmts = Array.from({ length: numberOfLevels }, () => ({}));
        
          factData.forEach(factEntry => {
            const regionId = factEntry.REGION;
            const masterEntry = masterData.find(master => master.ID === regionId);
        
            if (masterEntry) {
              for (let level = 1; level <= numberOfLevels; level++) {
                const levelKey = `LVL${level}`;
                const levelValue = masterEntry[levelKey];
        
                levelAmts[level - 1][levelValue] = (levelAmts[level - 1][levelValue] || 0) + factEntry.AMT;
              }
            }
          });
        
          masterData.forEach(masterEntry => {
            if (masterEntry.ID !== "#") {
              const aggregated = { REGION: masterEntry.ID };
        
              for (let level = 1; level <= numberOfLevels; level++) {
                const levelKey = `LVL${level}`;
                const levelValue = masterEntry[levelKey];
        
                aggregated[levelKey + "_AMT"] = levelAmts[level - 1][levelValue] || 0;
              }
        
              result.push(aggregated);
            }
          });
        
          return result;
        }
        async aggregateDataCombined(numberOfLevels) {
          await this.getAccessToken();
          const combinedData = await this.getCombinedData();
          const result = [];
        
          const levelAmts = Array.from({ length: numberOfLevels }, () => ({}));
        
          combinedData.forEach(entry => {
            for (let level = 1; level <= numberOfLevels; level++) {
              const levelKey = `${this._aggregateDIM}___LVL${level}`;
              const levelValue = entry[levelKey];
              const contextKey = this._contextDIMs.reduce((key, dim) => {
                const value = dim === "Date" ? entry["Date___CALMONTH"] : entry[`${dim}___ID`];
                return key + "_" + value;
              }, levelValue);
        
              levelAmts[level - 1][contextKey] = (levelAmts[level - 1][contextKey] || 0) + entry.AMT;
            }
          });
        
          combinedData.forEach(entry => {
            const aggregated = {
              REGION: entry[`${this._aggregateDIM}___ID`]
            };
        
            this._contextDIMs.forEach(dim => {
              const value = dim === "Date" ? entry["Date___CALMONTH"] : entry[`${dim}___ID`];
              aggregated[dim] = value;
            });
        
            for (let level = 1; level <= numberOfLevels; level++) {
              const levelKey = `${this._aggregateDIM}___LVL${level}`;
              const levelValue = entry[levelKey];
              const contextKey = this._contextDIMs.reduce((key, dim) => {
                const value = dim === "Date" ? entry["Date___CALMONTH"] : entry[`${dim}___ID`];
                return key + "_" + value;
              }, levelValue);
        
              aggregated["LVL" + level + "_AMT"] = parseFloat((levelAmts[level - 1][contextKey] || 0).toFixed(7));
            }
        
            result.push(aggregated);
          });
        
          return result;
        }
        
        
        connectedCallback(){
          //this._modelId = 'Cpu9c210lqf6pul8b48oqifb957';
          //this.testODATA();
        }
    }

    customElements.define("com-sap-sample-calculate-levels", CalculateLevels);
})();