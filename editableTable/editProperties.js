    const template = document.createElement('template');
    template.innerHTML = `
    <style>

   tr:nth-of-type(odd) {   
       background: #eee;   
       }  
  
   tr:hover {background-color: coral;}
   th {   
       background: #3498db;   
       color: white;   
       font-weight: bold;   
       }  

  #table_div {
        width: 200px;
        height: 65px;
        overflow: auto;
   }
   table {   
       border-collapse: collapse;   
       margin:50px auto;  
       }  
    td, th {   
       padding: 10px;   
       border: 1px solid #ccc;   
       text-align: left;   
       font-size: 18px;  
       }  

   </style>    
     <div id="table_div" class="table-editable"  hidden>  
       <table id="table" class="table">  
  
       </table>  
     </div>  
    `;

    class EditProperties extends HTMLElement{
        constructor(){
            super();

            //HTML objects
            this.attachShadow({mode:'open'});
            this.shadowRoot.appendChild(template.content.cloneNode(true));
            this._table = this.shadowRoot.querySelector('#table');
            this._table_div = this.shadowRoot.querySelector('#table_div');
            this._cells = this.shadowRoot.querySelectorAll('td');
            this._header = this.shadowRoot.querySelectorAll('th');
            this._edit = false;

            //this.populateTable();
            
        }
        onCustomWidgetBeforeUpdate(changedProperties) {
          this._props = { ...this._props, ...changedProperties };
          var th = this.shadowRoot.querySelectorAll('th');
          var td = this.shadowRoot.querySelectorAll('td');
          var tr = this.shadowRoot.querySelectorAll('tr');
          var oddRows = this.shadowRoot.querySelectorAll('tr:nth-of-type(odd)');

          for(var prop in changedProperties){
            switch(prop){
              case "headerBackgroundColor":
                for(var i=0;i<th.length;i++){
                  th[i].style.backgroundColor = this._props["headerBackgroundColor"];
                }
                break;
              case "headerFontColor":
                for(i=0;i<th.length;i++){
                  th[i].style.fontColor = this._props["headerFontColor"];
                }
                break;
             case "fontSize":
                for(i=0;i<th.length;i++){
                  th[i].style.fontSize = this._props["fontSize"]+"px";
                }
                for(i=0;i<td.length;i++){
                  td[i].style.fontSize = this._props["fontSize"]+"px";
                }
                break;
            case "oddRowBackgroundColor":
               for(i=0;i<oddRows.length;i++){
                  oddRows[i].style.backgroundColor = this._props["oddRowBackgroundColor"];
                }
                break;
            case "hoverColor":
                var styleSheet = this.shadowRoot.styleSheets[0];
                if(typeof styleSheet !== 'undefined'){
                  var cssRules = styleSheet.cssRules;
                  for(i=0;i<cssRules.length;i++){
                    if(cssRules[i].selectorText == 'tr:hover'){
                      styleSheet.deleteRule(i);
                      styleSheet.insertRule('tr:hover {background-color: '+ this._props["hoverColor"] +';}',i);
                    }
                  }
                }
                break;
            }
          }
          
          console.log(`${this._props["widgetName"]}`);
    
        }
        onCustomWidgetAfterUpdate(changedProperties) {
          this._table_div.style.display = "table";
          /*
          this._table_div.style.width="100px";
          this._table_div.style.height="100px";
          this._table_div.style.overflow="auto";
          */
        }
        generateHeaders(props){
          let tr = document.createElement('tr');
            //create Headers
          tr.className="header";
    
          let newTH = document.createElement('th');
          newTH.className="description";
          newTH.innerHTML= "Description";
          newTH.style.backgroundColor = this._props["headerBackgroundColor"];
          tr.appendChild(newTH);
          for (var prop in props){
            newTH = document.createElement('th');
            newTH.className=prop;
            newTH.innerHTML= prop;
            tr.appendChild(newTH);
          }
          this._table.appendChild(tr);
        }
        getData(){
          let rows = this._table.rows;

          var data = [];

          //start at 1 to remove Header
          for(var rowCount = 1;rowCount<rows.length;rowCount++){
            let row = rows[rowCount];

            //get Dimension Member ID
            let id = row.className;
            let props = [];
            let description = "";
            let cells = row.cells;
            for(var cellCount = 0;cellCount< cells.length;cellCount++){
              let cell = cells[cellCount];
              if(cell.className=='description'){
                description = cell.innerHTML;
              }else{
                let className = cell.className;
                let value = cell.innerHTML;
                props[className]=value;
              }              
            }
            var dimension = {
              id:id,
              description:description,
              properties:props
            };
            data.push(dimension);
          }
          console.log(data);
          return data;
          
          
        }
        loadDimensions(data){
          console.log(data);
          for(var i=0;i<data.length;i++){
            var props = data[i].properties;
            if(i==0){
              this.generateHeaders(props);
            }
            var tr = document.createElement('tr');
            tr.className=data[i].id;
            let taskDesc = document.createElement('td');
            taskDesc.className="description";
            taskDesc.innerHTML= data[i].description;
            taskDesc.setAttribute("contenteditable","true");
            taskDesc.setAttribute("parentTask",tr.className);
            tr.appendChild(taskDesc);

            for(var prop in props){
                let newTD = document.createElement('td');
                newTD.className=prop;
                newTD.innerHTML= props[prop];
                newTD.setAttribute("contenteditable","true");
                newTD.setAttribute("parentTask",tr.className);
                tr.appendChild(newTD);
            }
            this._table.appendChild(tr);
            this.connectedCallback();
          }
            

        }

        onChange(e,cell){
            this._edit=true;
        }

        
        onBlur(e,cell){
            if(this._edit){
                this._edit=false;
            }
            
          }

       
       
        addEventListenerAll(target, listener, ...otherArguments) {

            // install listeners for all natively triggered events
            for (const key in target) {
                if (/^on/.test(key)) {
                    const eventType = key.substr(2);
                    target.addEventListener(eventType, listener, ...otherArguments);
                }
            }
        }

        dispatch(event, arg) {
            this.dispatchEvent(new CustomEvent(event, {detail: arg}));
        }


        /**
         * standard Web Component function used to add event listeners
         */
        connectedCallback(){
            this._cells = this.shadowRoot.querySelectorAll('td');
            console.log(this._cells);
            this._cells.forEach(cell => {
                cell.addEventListener('input',(e)=>this.onChange(e,cell));
                cell.addEventListener('blur',(e)=>this.onBlur(e,cell));
                /*
                this.addEventListenerAll(
                    cell,
                    (evt) => { console.log(evt); },
                    true
                  );
                  */
            });
        
        }

    }

    window.customElements.define('com-sap-sample-editproperties',EditProperties);
