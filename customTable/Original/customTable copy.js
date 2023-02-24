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
            <div id="chart_div" style="width: 100%; height: 100%;">
        `;

    class CustomTable extends HTMLElement {

        constructor() {
            super(); 
            this._shadowRoot = this.attachShadow({ mode: 'open' })
            this._shadowRoot.appendChild(template.content.cloneNode(true))

            this._root = this._shadowRoot.getElementById('root')
            this.render();
            this.showTable();
            
        }
    
        async showTable(){
            await getScriptPromisify('https://www.gstatic.com/charts/loader.js');
            var container = this.shadowRoot.getElementById('chart_div');
            google.charts.load('current', {'packages':['table']});
            google.charts.setOnLoadCallback(function() {
                drawTable();
            });

            async function drawTable() {
                
                var data = new google.visualization.DataTable();
                data.addColumn('string', 'Name');
                data.addColumn('number', 'Salary');
                data.addColumn('boolean', 'Full Time Employee');
                data.addRows([
                ['Mike',  {v: 10000, f: '$10,000'}, true],
                ['Jim',   {v:8000,   f: '$8,000'},  false],
                ['Alice', {v: 12500, f: '$12,500'}, true],
                ['Bob',   {v: 7000,  f: '$7,000'},  true]
                ]);
                
                var table = new google.visualization.Table(container);

                table.draw(data, {showRowNumber: true, width: '100%', height: '100%'});
            }
        }

        async render(){
            await getScriptPromisify('https://www.gstatic.com/charts/loader.js');
        }    
        
        connectedCallback(){

          }
    }

    customElements.define("com-sap-sample-google-table", CustomTable);
})();