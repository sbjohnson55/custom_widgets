var getScriptPromisify = (src, uiTheme, uiLibs, uiResourceRoots, uiOnInit, uiCompatVersion, uiAsync) => {
  return new Promise(resolve => {
    const script = document.createElement('script');
    script.src = src;
    if (uiTheme) script.setAttribute('data-sap-ui-theme', uiTheme);
    if (uiLibs) script.setAttribute('data-sap-ui-libs', uiLibs);
    if (uiResourceRoots) script.setAttribute('data-sap-ui-resourceroots', uiResourceRoots);
    if (uiOnInit) script.setAttribute('data-sap-ui-onInit', uiOnInit);
    if (uiCompatVersion) script.setAttribute('data-sap-ui-compatVersion', uiCompatVersion);
    if (uiAsync) script.setAttribute('data-sap-ui-async', uiAsync);
    script.onload = resolve;
    document.head.appendChild(script);
  });
}

  
(function() { 
    let template = document.createElement("template");
    template.innerHTML = `
            <style>
            </style> 
            <h3>Quickstart Tutorial</h3>
            <div class="sapUiBody" id="content"></div>
        `;

    class SampleUI5 extends HTMLElement {

      constructor() {
        super();
        this._shadowRoot = this.attachShadow({ mode: "open" });
    
        // Create the content div element within the shadow DOM
        const content = document.createElement("div");
        content.id = "content";
        content.classList.add("sapUiBody");
        this._shadowRoot.appendChild(content);
      }
                  
      connectedCallback() {
        getScriptPromisify(
          "https://sdk.openui5.org/resources/sap-ui-core.js",
          "sap_belize",
          "sap.m, sap.ui.layout, sap.tnt",
          { "Quickstart": "./" },
          "module:Quickstart/index",
          "edge",
          true
        ).then(() => {
          // Pass the content element to the XMLView.create method
          sap.ui.define(["sap/ui/core/mvc/XMLView"], function (XMLView) {
            XMLView.create({ viewName: "Quickstart.App" }).then(function (oView) {
              oView.placeAt(content);
            });
          });
        });
      }
    
    }

    customElements.define("com-sap-sample-ui5", SampleUI5);
})();