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
            this._hierarchyMap = new Map();
                     
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
      
        getFactData(filters) {
          // Construct the filter query string
          const filterQueries = filters.map(filter => {
            const filterMembers = filter.members.map(member => `${filter.id} eq '${member}'`).join(' or ');
            return `(${filterMembers})`;
          }).join(' and ');
        
          const url = this._baseURL + "/api/v1/dataexport/providers/sac/" + this._modelId + "/FactData?$filter=" + encodeURIComponent(filterQueries);
        
          return fetch(url, {
            method: 'GET',
            headers: {
              'Authorization': 'Bearer ' + this._token,
              'x-sap-sac-custom-auth': true
            },
          })
            .then(response => response.json())
            .then(data => {
              console.log('Fact Data:');
              console.log(data);
              return data.value;
            });
        }
        

        getMasterData(aggregateDim) {
          const serviceName = aggregateDim + 'Master';
          const url = this._baseURL+'/api/v1/dataexport/providers/sac/'+this._modelId +'/'+serviceName;
          return fetch(url, {
            method: 'GET',
            headers: {
              'Authorization': 'Bearer ' + this._token,
              'x-sap-sac-custom-auth':true
            },
          })
            .then(response => response.json())
            .then(data => {
              console.log('Master Data:');
              console.log(data);
              return data.value;
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
        async getAccountValuesAsMeasures(modelID,aggregateDim,measure,reverseSignage,filters,context,useAdjNode=true){
          this._modelId = modelID;
          await this.getAccessToken();
          const masterData = await this.getMasterData(aggregateDim);

          if(useAdjNode){
            const hierarchy = await this.buildHierarchy(masterData);
            const rootNode = hierarchy['pd_pd_20000'];
            const leafNodesWithAdjustedParent = await this.findLeafNodesWithAdjustedParent(rootNode);
            let filter = {
              "id": "BSCI_PRD",
              "members": leafNodesWithAdjustedParent
            };
            filters.push(filter);
          }
          const factData = await this.getFactData(filters);
          console.log(factData);

         const output = this.mapAccountsToLevels(masterData, factData, aggregateDim,'Local', context, true);
         console.log(output);
         return output;
          
        }
        async getAggregateDataByParentChild(modelID,aggregateDim,measure,reverseSignage,filters,contextDims){
          this._modelId = modelID;
          await this.getAccessToken();
          const masterData = await this.getMasterData(aggregateDim);
          const factData = await this.getFactData(filters);

          const output = await this.parentFunction(masterData,factData,aggregateDim,measure,contextDims,reverseSignage);
          return output;
        }
        useDeltaQuery(url,aggregateDim,measure,filters,contextDims){

        }
        async getAggregateData(modelID,aggregateDIM,contextDims,numberOfLevels){
          this._modelId = modelID;
          this._aggregateDIM = aggregateDIM;
          this._contextDIMs=contextDims;
          this._numberOfLevels=numberOfLevels;
          this._aggregatedData = await this.aggregateDataCombined(this._numberOfLevels);
          return this._aggregatedData;
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

        processHierarchy(factData, masterData, contextMap, hierarchyDimension, measureName, reverseSignage = true) {
          const idToNode = {};
          masterData.forEach(node => {
            idToNode[node.ID] = node;
            node.children = [];
            node[measureName] = 0;
          });
        
          masterData.forEach(node => {
            if (node.Parent !== '<root>') {
              idToNode[node.Parent].children.push(node);
            }
          });
        
          factData.forEach(fact => {
            const node = idToNode[fact[hierarchyDimension]];
            if (node) {
              node[measureName] = fact[measureName];
            }
          });
        
          function aggregateAmount(node) {
            if (node.children.length === 0) {
              return node[measureName];
            }
            return node.children.reduce((sum, child) => sum + aggregateAmount(child), 0);
          }
        
          function getAmountAtLevel(node, level) {
            let current = node;
            for (let i = 0; i < level; i++) {
              current = idToNode[current.Parent];
            }
            return aggregateAmount(current);
          }
        
          const output = factData.map(fact => {
            const node = idToNode[fact[hierarchyDimension]];
            const highestLevel = Math.max(...masterData.map(node => {
              const level = Number(node.Level);
              if (isNaN(level)) {
                console.log('Unexpected value for node.Level:', node.Level);
              }
              return level;
            }));
            const result = { [hierarchyDimension]: node.ID };
        
            for (let i = 2; i <= highestLevel + 1; i++) {
              const amount = getAmountAtLevel(node, i - 1);
              result[`AMT_LVL${highestLevel - i + 2}`] = reverseSignage ? -1 * amount.toFixed(7) : amount;
            }
        
            // Add the context values from the contextMap to the result object
            contextMap.forEach((value, key) => {
              result[key] = value;
            });
        
            return result;
          });
        
          return output;
        }
        
        
        async parentFunction(masterData,factData,hierarchyDimension, measureName,dataContext = [], reverseSignage = true) {

          const dcSize = dataContext.length;
          let finalOutput = [];
        
          const uniqueDataContextValues = dataContext.map(ctxField => {
            return Array.from(new Set(factData.map(fact => fact[ctxField])));
          });
        
          function generateCombinations(arr) {
            return arr.reduce((acc, values) => {
              const combinations = [];
              acc.forEach(accValue => {
                values.forEach(value => {
                  combinations.push([...accValue, value]);
                });
              });
              return combinations;
            }, [[]]);
          }
        
          const contextCombinations = generateCombinations(uniqueDataContextValues);
        
          for (const combination of contextCombinations) {
            const contextMap = new Map(dataContext.map((field, i) => [field, combination[i]]));
            const filteredFactData = factData.filter(fact => {
              return Array.from(contextMap.entries()).every(([field, value]) => fact[field] === value);
            });
            const newOutput = this.processHierarchy(filteredFactData, masterData, contextMap, hierarchyDimension, measureName,reverseSignage);
            finalOutput = [...finalOutput, ...newOutput];
          }
        
          return finalOutput;
        }
        mapAccountsToLevels(masterData, factData, hierarchyDimension, measureName, context, reverseSignage = true) {
          let finalOutput = [];
        
          for (const binding of context.Bindings) {
            const filteredFactData = factData.filter(fact => fact[context.AccountDim] === binding.AccountID);
            const tempOutput = this.processHierarchy(filteredFactData, masterData, [], hierarchyDimension, measureName, reverseSignage);
            const newOutput = this.filterMeasures(tempOutput, binding.Measure);
            //finalOutput = [...finalOutput, ...newOutput.values];
            finalOutput.push(newOutput);
          }
        
          return finalOutput;
        }
        

        async buildHierarchy(masterData) {
          const idToNode = {};
          masterData.forEach(node => {
            idToNode[node.ID] = node;
            node.children = [];
          });
        
          masterData.forEach(node => {
            if (node.Parent !== '<root>') {
              idToNode[node.Parent].children.push(node);
            }
          });
        
          return idToNode;
        }
        
        async findLeafNodesWithAdjustedParent(node) {
          const leafNodes = [];
        
          function traverse(currentNode, hasAdjustedParent) {
            if (currentNode.children.length === 0) {
              if (hasAdjustedParent) {
                leafNodes.push(currentNode.ID);
              }
              return;
            }
        
            currentNode.children.forEach(child => {
              traverse(child, hasAdjustedParent || currentNode.ADJ === 'Yes');
            });
          }
        
          traverse(node, false);
          return leafNodes;
        }

        filterMeasures(data, measureName) {
          const filteredValues = data.map(item => {
            return {
              "BSCI_PRD": item["BSCI_PRD"],
              [measureName]: item[measureName]
            };
          });
        
          const result = {
            measure: measureName,
            values: filteredValues
          };
        
          return result;
        }
        

        async connectedCallback(){
               

        }
    }

    customElements.define("com-sap-sample-calculate-levels", CalculateLevels);
})();