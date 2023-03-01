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

    class ManageUsers extends HTMLElement {

        constructor() {
            super(); 
            this._shadowRoot = this.attachShadow({ mode: 'open' })
            this._shadowRoot.appendChild(template.content.cloneNode(true))

            this._root = this._shadowRoot.getElementById('root')
            this.__tokenURL = 'https://sac-gcoe-americas2.authentication.us10.hana.ondemand.com/oauth/token';
            this._baseURL = 'https://sac-gcoe-americas2.us10.sapanalytics.cloud/api/v1/scim';
            this._clientID = 'sb-2e9d882e-0f23-4168-bea3-023ee5b52bb1!b1459|client!b655';
            this._clientSecret = 'KvlEwCGcobEHYtd8IQrmRc32DRo=';
            this._token = '';
            this.test();
            
                     
        }

       async test(){
          await this.getAccessToken();
          console.log(this._token);
          console.log (await this.getAllUsers());
        }

        getAccessToken() {
          const url = this.__tokenURL+'/?grant_type=client_credentials&x-sap-sac-custom-auth=true';
          
          return fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Authorization': 'Basic ' + btoa(this._clientID+':'+this._clientSecret)
            },
          })
            .then(response => response.json())
            .then(data => {
              this._token = data.access_token;
            });
          
        }

        getAllUsers(){
          const url = this._baseURL+'/Users/?startIndex=1&count=1000';
          
            return fetch(url, {
              method: 'GET',
              headers: {
                'Authorization': 'Bearer ' + this._token,
              },
            })
              .then(response => response.json())
              .then(data => {
                console.log(data);
                return data;
              });
        }
                  
        connectedCallback(){

          }
    }

    customElements.define("com-sap-sample-manage-users", ManageUsers);
})();