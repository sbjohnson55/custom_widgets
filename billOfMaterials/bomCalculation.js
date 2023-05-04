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

    class BOMCalculation extends HTMLElement {

        constructor() {
            super(); 
            this._shadowRoot = this.attachShadow({ mode: 'open' })
            this._shadowRoot.appendChild(template.content.cloneNode(true))

            this._root = this._shadowRoot.getElementById('root')
                     
        }

        async getUpdatedPrices(data){
          console.log(data);
          const componentList = test(data);
          const sfgArray = useFilteredData(componentList);
          //const jsonArray = convertSfgArrayToJson(sfgArray);
          //console.log(jsonArray);
          console.log(sfgArray);
          return sfgArray;
        }

        
   
        connectedCallback(){

          }
    }

    customElements.define("com-sap-sample-bom-calculation", BOMCalculation);
})();
class Component {
  constructor(component, componentType, finishedGood, qty, price, cost, inflationRate, level, parentMaterial,recipeType, date, version) {
    this.component = component;
    this.componentType = componentType;
    this.finishedGood = finishedGood;
    this.qty = qty;
    this.price = price;
    this.originalPrice = price;
    this.cost = cost;
    this.level = level;
    this.inflationRate = inflationRate;
    this.parentMaterial = parentMaterial;
    this.recipeType = recipeType;
    this.date = date;
    this.version = version;
  }

  // calculate cost for semi-finished goods
  calculateSfgComponentCost(components) {
      if (this.componentType === "sfg") {
        let matchingComponents = components.filter((c) => c.finishedGood === this.component && parseInt(c.level) === parseInt(this.level) + 1);
        if (matchingComponents.length > 0) {
          this.cost = matchingComponents.reduce((totalCost, c) => totalCost + parseFloat(c.cost), 0);
          this.price = (this.cost / parseFloat(this.qty.replace(/[^0-9.-]+/g, ""))).toFixed(7);
        }
      }
    }

  // calculate cost and price for each component
  calculateCostAndPrice(components) {
    this.calculateSfgComponentCost(components);
  }
}

class BillOfMaterials {
  constructor(data) {
    //console.log("This is the default data:");
    //console.log(data);
    this.components = [];
    this.buildBillOfMaterials(data);
  }

  // build the bill of materials from the input data
  buildBillOfMaterials(data) {
    let levels = [...new Set(data.map((d) => d.level))];
    levels.sort().reverse(); // reverse the order of levels

    for (let level of levels) {
      let levelComponents = data.filter((d) => d.level === level);
      for (let lc of levelComponents) {
        let c = new Component(
          lc.id,
          lc.type.toLowerCase(),
          lc.finishedGood,
          lc.comp_qty,
          lc.lu_price,
          lc.da_cost,
          lc.lu_inflation,
          lc.level,
          lc.parentID,
          lc.recipeType,
          lc.date,
          lc.version
        );
        this.addComponent(c);
      }
    }
    this.calculateRawComponentCost(this.components);

    for (let i = levels.length-1; i >= 1; i--) {
      let level = i; // fix: level should be set to the current level
      const levelComponents = this.components.filter((c) => parseInt(c.level, 10) === level && (c.componentType !== "raw" || c.componentType !== "byp"));
      for (let c of levelComponents) {
        c.calculateCostAndPrice(this.components);
        let index = this.components.findIndex(component => component.component === c.component);
        this.components[index].cost = c.cost;
        //console.log(this.components[index].cost);
      }
    }
  }

 // calculate cost for raw components
calculateRawComponentCost(components) {
  let rawComponents = components.filter((c) => c.componentType === "raw" || c.componentType === "byp");
  for (let c of rawComponents) {
    console.log(c);
    let qty = parseFloat(c.qty.replace(/[^0-9.e-]+/g, ""));
    let price = parseFloat(c.price.replace(/[^0-9.e-]+/g, ""));
    let inflation = c.inflationRate ? parseFloat(c.inflationRate.replace(/[^0-9.e-]+/g, "")) : 0;
    let cost = qty * (price * (1 + inflation));
    c.cost = cost;
  }
}


  // add a component to the bill of materials
  addComponent(component) {
    this.components.push(component);
  }

}



function test(data) {
  //console.log(data);
  const measureDimensionKeys = new Set(['Comp_Qty', 'DA_COST', 'LU_PRICE', 'LU_INFLATION']);
  const components = data.reduce((acc, curr) => {
    const parentId = curr.ParentMaterial.id;
    const recipeType = curr.RecipeType.id;
    const date = curr.Date.id;
    const version = curr.Version.id;
    const componentId = curr.Components.id;
    const finishedGoodId = curr.FinishedGoods.id;
    const level = curr.Level.id;
    const uniqueKey = `${version}-${date}-${parentId}-${recipeType}-${componentId}-${finishedGoodId}-${level}`;

    const currComponent = acc[uniqueKey] || {
      parentID: curr.ParentMaterial.id,
      finishedGood: finishedGoodId,
      level: level,
      id: componentId,
      type: curr.Components.properties['Components.TYPE'],
      recipeType: curr.RecipeType.id,
      version:version,
      date:date
    };

    for (const key of Object.keys(curr)) {
      if (key.startsWith('@MeasureDimension')) {
        const measure = curr[key];
        if (measureDimensionKeys.has(measure.id)) {
          currComponent[measure.id.toLowerCase()] = measure.rawValue;
        }
      }
    }

    acc[uniqueKey] = currComponent;

    return acc;
  }, {});

  const componentList = Object.values(components);
  //console.log(components);

  return componentList;
}
function convertSfgArrayToJson(sfgArray) {
  return sfgArray.map(sfgElement => {
    const dateMatch = sfgElement.date.match(/\[Date\]\.\[YQM\]\.&\[(\d{6})\]/);
    const extractedDate = dateMatch ? dateMatch[1] : "";

    return {
      "Version": sfgElement.version,
      "Date": extractedDate,
      "Components": sfgElement.component,
      "FinishedGoods": "#",
      "Level": "0",
      "ParentMaterial": "#",
      "RecipeType": "Default",
      "Price": parseFloat(parseFloat(sfgElement.price).toFixed(7))
    };
  });
}


function useFilteredData(componentList) {
  const bomData = componentList.reduce((bom, curr) => {
    const key = `${curr.date}_${curr.version}_${curr.parentID}_${curr.recipeType}`;
    bom[key] = bom[key] || [];
    bom[key].push(curr);
    return bom;
  }, {});
  //console.log(bomData);

  const bomArray = Object.values(bomData);
  let sfgArray = [];

  for (const bomDataItem of bomArray) {
    const bom = new BillOfMaterials(bomDataItem);
    //console.log(bom);
  
    const sfgComponents = bom.components.filter((c) => c.componentType === "sfg" && parseFloat(c.originalPrice).toFixed(4) !== parseFloat(c.price).toFixed(4));
  
    if (sfgComponents.length > 0) {
      sfgArray = [...sfgArray, ...sfgComponents];
    }
     checkTotals(bom.components);
  }
  sfgArray = sfgArray.filter((item, index, self) => {
    const uniqueKey = `${item.component}-${item.date}-${item.version}`;
    return index === self.findIndex(obj => {
      const objKey = `${obj.component}-${obj.date}-${obj.version}`;
      return uniqueKey === objKey;
    });
  });
  
  return sfgArray;
  
}


function checkTotals(bom){
  const rawComponents = bom.filter(item => item.componentType === 'raw' || item.componentType === "byp");
  const level1Components = bom.filter(item => item.level === '1' || item.level === 1); // to handle both string and number types
  const totalCostRaw = rawComponents.reduce((total, item) => total + item.cost, 0);
  const totalCostLevel1 = level1Components.reduce((total, item) => total + item.cost, 0);

  //console.log('Raw:'+totalCostRaw);
  //console.log('Lvl1:'+totalCostLevel1);

}