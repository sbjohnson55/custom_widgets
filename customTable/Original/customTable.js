var getScriptPromisify = (src) => {
    return new Promise(resolve => {
      $.getScript(src, resolve)
      
    })
  }
  
(function() { 
    let template = document.createElement("template");
    template.innerHTML = `
    <style>
        body { font-family:'lucida grande', tahoma, verdana, arial, sans-serif; font-size:11px; }
        h1 { font-size: 15px; }
        a { color: #548dc4; text-decoration: none; }
        a:hover { text-decoration: underline; }
        table.testgrid { border-collapse: collapse; border: 1px solid #CCB; width: 800px; }
        table.testgrid td, table.testgrid th { padding: 5px; border: 1px solid #E0E0E0; }
        table.testgrid th { background: #E5E5E5; text-align: left; }
        input.invalid { background: red; color: #FDFDFD; }
    </style>
        <div id="tablecontent"></div>
        `;

    class CustomTable extends HTMLElement {

        constructor() {
            super(); 
            this._shadowRoot = this.attachShadow({ mode: 'open' })
            this._shadowRoot.appendChild(template.content.cloneNode(true))

            this._root = this._shadowRoot.getElementById('root')
            this._tableContent = this._shadowRoot.getElementById('tablecontent')
            //this._editableGrid=null;
            //this.render();
            this.showTable();
            
            
            
        }
    
        async showTable(){
            var container = this.shadowRoot.getElementById('tablecontent');
            var data = {"metadata":[
                {"name":"name","label":"NAME","datatype":"string","editable":true},
                {"name":"firstname","label":"FIRSTNAME","datatype":"string","editable":true},
                {"name":"age","label":"AGE","datatype":"integer","editable":true},
                {"name":"height","label":"HEIGHT","datatype":"double(m,2)","editable":true},
                {"name":"country","label":"COUNTRY","datatype":"string","editable":true,"values":
                    {
                        "Europe":{"be":"Belgium","fr":"France","uk":"Great-Britain","nl":"Nederland"},
                        "America":{"br":"Brazil","ca":"Canada","us":"USA"},
                        "Africa":{"ng":"Nigeria","za":"South-Africa","zw":"Zimbabwe"}}
                    },
                {"name":"email","label":"EMAIL","datatype":"email","editable":true},
                {"name":"freelance","label":"FREELANCE","datatype":"boolean","editable":true},
                {"name":"lastvisit","label":"LAST VISIT","datatype":"date","editable":true}
            ],
            
            "data":[
                {"id":1, "values":{"country":"uk","age":33,"name":"Duke","firstname":"Patience","height":1.842,"email":"patience.duke@gmail.com","lastvisit":"11\/12\/2002"}},
                {"id":2, "values":["Rogers","Denise",59,1.627,"us","rogers.d@gmail.com","","07\/05\/2003"]},
                {"id":3, "values":{"name":"Dujardin","firstname":"Antoine","age":21,"height":1.73,"country":"fr","email":"felix.compton@yahoo.fr","freelance":true,"lastvisit":"21\/02\/1999"}},
                {"id":4, "values":{"name":"Conway","firstname":"Coby","age":47,"height":1.96,"country":"za","email":"coby@conwayinc.com","freelance":true,"lastvisit":"01\/12\/2007"}},
                {"id":5, "values":{"name":"Shannon","firstname":"Rana","age":24,"height":1.56,"country":"nl","email":"ranna.shannon@hotmail.com","freelance":false,"lastvisit":"07\/10\/2009"}},
                {"id":6, "values":{"name":"Benton","firstname":"Jasmine","age":61,"height":1.71,"country":"ca","email":"jasmine.benton@yahoo.com","freelance":false,"lastvisit":"13\/01\/2009"}},
                {"id":7, "values":{"name":"Belletoise","firstname":"André","age":31,"height":1.84,"country":"be","email":"belletoise@kiloutou.be","freelance":true,"lastvisit":""}},
                {"id":8, "values":{"name":"Santa-Maria","firstname":"Martin","age":37,"height":1.80,"country":"br","email":"martin.sm@gmail.com","freelance":false,"lastvisit":"12\/06\/1995"}},
                {"id":9, "values":{"name":"Dieumerci","firstname":"Amédé","age":37,"height":1.81,"country":"ng","email":"dieumerci@gmail.com","freelance":true,"lastvisit":"05\/07\/2009"}},
                {"id":10,"values":{"name":"Morin","firstname":"Wanthus","age":46,"height":1.77,"country":"zw","email":"morin.x@yahoo.json.com","freelance":false,"lastvisit":"04\/03\/2004"}}
            ]};
            await getScriptPromisify('./editablegrid.js');
            //this._shadowRoot.host.classList.add('EditableGrid');
            //this.dispatch('loaded');
            var editableGrid= new EditableGrid("DemoGridJSON"); 
            editableGrid.tableLoaded = function() { this.renderGrid("tablecontent", "testgrid"); };
            editableGrid.loadJSON(data);
            
        }

        async render(){
            await getScriptPromisify('./editablegrid.js');
        }    
        dispatch(event, arg) {
            this.dispatchEvent(new CustomEvent(event, {detail: arg}));
        }
        connectedCallback(){
            this.addEventListener('loaded',function(){
                 this._editableGrid= new EditableGrid("DemoGridJSON"); 
            });
          }
    }

    customElements.define("com-sap-sample-google-table", CustomTable);
})();