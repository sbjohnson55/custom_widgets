var getScriptPromisify = (src) => {
    return new Promise(resolve => {
        $.getScript(src, resolve);
    });
};

(function() { 
    let template = document.createElement("template");
    template.innerHTML = `

      <style>
        :host {
          display: block;
        }
        table {
          width: auto;
          border-collapse: collapse;
          border-spacing: 0;
        }
        th {
          font-weight: bold;
          text-decoration: underline;
          background-color: #f1f1f1;
          text-align: left;
          padding: 8px;
          border: 1px solid #ddd;
        }
        td {
          padding: 8px;
          border: 1px solid #ddd;
        }
        tr:nth-child(even) {
          background-color: #f2f2f2;
        }
        .string {
          font-style: italic;
          color: #555;
        }
        .date {
          font-weight: bold;
          color: #08c;
        }
        .boolean {
          text-align: center;
        }
        .boolean input[type="checkbox"] {
          margin: 0 auto;
          background-color: red;
        }
        .input[type="checkbox" i] {
          background-color: red;
          cursor: default;
          appearance: auto;
          box-sizing: border-box;
          margin: 3px 3px 3px 4px;
          padding: initial;
          border: initial;
      }
        .dropdown {
          font-size: 14px;
          padding: 6px;
          border-radius: 3px;
          background-color: #fff;
          border: 1px solid #ccc;
          width: 100%;
          box-sizing: border-box;
          -moz-box-sizing: border-box;
          -webkit-box-sizing: border-box;
        }
        .ui-datepicker {
          background-color: #fff !important;
          padding: 0.5em !important;
          border: 1px solid #ccc !important;
          display: block !important;
        }
        
        
      </style>
      
      <table>
        <thead id="thead"></thead>
        <tbody id="tbody"></tbody>
      </table>
    `;

    class CustomTable extends HTMLElement {

        constructor() {
            super(); 
            this._shadowRoot = this.attachShadow({ mode: 'open' });
            this._shadowRoot.appendChild(template.content.cloneNode(true));

            let link = document.createElement('link');
            link.setAttribute('rel', 'stylesheet');
            link.setAttribute('href', 'https://code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css');
            //this._shadowRoot.appendChild(link);
            
            this._table = this._shadowRoot.querySelector('table');
            this._thead = this._shadowRoot.querySelector('#thead');
            this._tbody = this._shadowRoot.querySelector('#tbody');
            this._data = {"metadata":[
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
        }
                /*
        _parseData(data) {
          const data = 
          return data.data;
        }
        */

        async connectedCallback() {
            await getScriptPromisify('https://cdn.datatables.net/1.10.21/js/jquery.dataTables.min.js');
            await getScriptPromisify('https://cdn.datatables.net/1.10.21/js/dataTables.jqueryui.min.js');
            await getScriptPromisify('https://cdn.datatables.net/plug-ins/1.10.19/sorting/date-uk.js');
            await getScriptPromisify('https://code.jquery.com/ui/1.12.1/jquery-ui.js');
            
            this._render();
        }

        _render() {
          const data = this._data.data;
          const columns = this._getColumnHeaders(this._data.metadata);
          this._renderTableHeaders(columns);
          this._renderTableBody(data, columns);
          this._initializeDataTable();
      }
  
      
      
      _getColumnHeaders(metadata) {
        return metadata;
      }
      
      _renderTableHeaders(columns) {
        const tr = document.createElement('tr');
        columns.forEach(column => {
          const th = document.createElement('th');
          th.textContent = column.label;
          tr.appendChild(th);
        });
        this._thead.appendChild(tr);
      }
      
      _renderTableBody(data, columns) {
        data.forEach(row => {
          const tr = document.createElement('tr');
          columns.forEach(column => {
            const td = document.createElement('td');
            let value = row.values[column.name];
            if (column.datatype === 'string' && column.values) {
              const select = document.createElement('select');
              for (const region in column.values) {
                const optgroup = document.createElement('optgroup');
                optgroup.label = region;
                for (const code in column.values[region]) {
                  const option = document.createElement('option');
                  option.text = column.values[region][code];
                  optgroup.appendChild(option);
                }
                select.appendChild(optgroup);
              }
              select.value = value;
              td.appendChild(select);
            } else if (column.datatype === 'boolean') {
              const checkbox = document.createElement('input');
              checkbox.type = 'checkbox';
              checkbox.checked = value;
              td.appendChild(checkbox);
            } else if (column.datatype === 'date' && column.editable) {
              const input = document.createElement('input');
              input.type = 'text';
              input.value = value;
              input.classList.add('datepicker');
              $(input).datepicker();
              td.appendChild(input);
            }else {
              td.textContent = value;
            }
            tr.appendChild(td);
          });
          this._tbody.appendChild(tr);
        });
        
      }
      _initializeDataTable() {
        $(this._table).DataTable({
          "lengthChange": false,
          "searching": false,
          "paging": false,
          "info": false,
          "order": []
        });
      }
      
  
    }

customElements.define("com-sap-sample-google-table", CustomTable);
})();