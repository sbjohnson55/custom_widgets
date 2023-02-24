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
            
            this._table = this._shadowRoot.querySelector('table');
            this._thead = this._shadowRoot.querySelector('#thead');
            this._tbody = this._shadowRoot.querySelector('#tbody');
        }

        async connectedCallback() {
            await getScriptPromisify('https://cdn.datatables.net/1.10.21/js/jquery.dataTables.min.js');
            await getScriptPromisify('https://cdn.datatables.net/1.10.21/js/dataTables.jqueryui.min.js');
            await getScriptPromisify('https://cdn.datatables.net/plug-ins/1.10.19/sorting/date-uk.js');
            this._render();
        }

        _render() {
            const data = this._parseData();
            const columns = this._getColumnHeaders(data[0]);
            this._renderTableHeaders(columns);
            this._renderTableBody(data, columns);
            this._initializeDataTable();
        }

        _parseData() {
            const data = {
                "columns": [
                    { "name": "Name", "age": 30, "married": true },
                    { "name": "John", "age": 40, "married": false },
                    { "name": "Jane", "age": 25, "married": true },
                    { "name": "Bob", "age": 35, "married": false }
                ]
            };
            return data.columns;
        }

        _getColumnHeaders(data) {
            const columns = [];
            for (const key in data) {
                columns.push({ data: key, title: key });
            }
            return columns;
        }

        _renderTableHeaders(columns) {
            const tr = document.createElement('tr');
            columns.forEach(column => {
                const th = document.createElement('th');
                th.textContent = column.title;
                tr.appendChild(th);
            });
            this._thead.appendChild(tr);
        }

        _renderTableBody(data, columns) {
            data.forEach((row, rowIndex) => {
                const tr = document.createElement('tr');
                if (rowIndex % 2 === 1) { // odd numbered rows
                    tr.classList.add('odd');
                } else { // even numbered rows
                    tr.classList.add('even');
                }
                
                columns.forEach(column => {
                    const td = document.createElement('td');
                    const value = row[column.data];
                    switch (true) {
                        case (typeof value === 'string'):
                          td.classList.add('string');
                          td.textContent = value;
                          break;
                        case (value instanceof Date):
                          td.classList.add('date');
                          td.textContent = value.toLocaleString();
                          break;
                        case (typeof value === 'boolean'):
                          td.classList.add('boolean');
                          if (value) {
                            td.textContent = 'TRUE';
                          } else {
                            const checkbox = document.createElement('input');
                            checkbox.type = 'checkbox';
                            checkbox.disabled = true;
                            td.appendChild(checkbox);
                          }
                          break;
                        case (Array.isArray(column.options)):
                          td.classList.add('dropdown');
                          const select = document.createElement('select');
                          column.options.forEach(option => {
                            const optionEl = document.createElement('option');
                            optionEl.textContent = option;
                            select.appendChild(optionEl);
                          });
                          select.value = value;
                          select.disabled = true;
                          td.appendChild(select);
                          break;
                        default:
                          td.textContent = value;
                          break;
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
                   
                   
                   
                   
                   
