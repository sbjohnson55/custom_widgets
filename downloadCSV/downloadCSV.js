const template = document.createElement('template');
template.innerHTML = `
<section hidden>
</section>
`;

class CreateCSV extends HTMLElement{
    constructor(){
        super();
        //HTML objects
        this.attachShadow({mode:'open'});
        this.shadowRoot.appendChild(template.content.cloneNode(true));
    }

    /**
     * 
     * @param {Table} table - the Table object passed in from SAC
     * @param {String} fileName - the name of the resulting CSV value
     */
     async downloadCSV(table,fileName){
        //retrieve all dimensions from tables
        let dims = await table.getDataSource().getDimensions();
        let rs = await table.getDataSource().getResultSet();
        console.log(rs);
        let sampleRow = rs[0];
        for (let x in sampleRow){
            console.log(x);
        }

        let dimDesc =[];

        //retrieve DimensionInfo[] to enable use of Description property
        for(let i=0;i<dims.length;i++){
            let id = dims[i].id;
            let desc = dims[i].description;
            dimDesc[id]=desc;
        }

        //retrieve the dimensions on the Rows
        let usedDims = await table.getDimensionsOnRows();

        //create an empty array to hold the Header row
        let headers =[];

        //create an empty array to hold the sample data row
        let sampleData = [];

        //declare variable to hold the data value
        let value = 0;
        for(let i=0;i<usedDims.length;i++){
            headers.push(dimDesc[usedDims[i]]);  
            let currDim = sampleRow[usedDims[i]];
            
            //check to see if the rawValue property is available with this dimension
            if(currDim["rawValue"]!=undefined){
                value = currDim["rawValue"];
                console.log(value);
            }

            //check to see if this is a Date dimension. There's no easy way to do this other than to analyze the parentID
            //we'll also re-use this same code to populate the ID value of each dimension member
            let start = currDim["id"].lastIndexOf("[")+1;
            let end = currDim["id"].lastIndexOf("]");
            let idValue = currDim["id"].substring(start,end);
            sampleData.push(idValue);

        }
        //add column to hold the Data Value
        headers.push(this._dataValueLabel);
        
        //add value found in for loop to sampleData array
        sampleData.push(value);

        //create comma-separated strings from the two arrays
        let csv = headers.join(',');
        csv = csv + '\n' + sampleData.join(',');

        console.log(csv);


        let hiddenElement = document.createElement('a');  
        hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);  
        hiddenElement.target = '_blank';  
    
        //provide the name for the CSV file to be downloaded  
        hiddenElement.download = fileName;  
        hiddenElement.click();  
    }

    async downloadFile(url, fileName) {
      fetch(url, { method: 'get', mode: 'no-cors', referrerPolicy: 'no-referrer' })
        .then(res => res.blob())
        .then(res => {
          const aElement = document.createElement('a');
          aElement.setAttribute('download', fileName);
          const href = URL.createObjectURL(res);
          aElement.href = href;
          aElement.setAttribute('target', '_blank');
          aElement.click();
          URL.revokeObjectURL(href);
        });
    }

}

window.customElements.define('com-sap-sample-createcsv',CreateCSV);