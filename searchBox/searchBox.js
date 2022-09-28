(function() { 
	let template = document.createElement("template");
	template.innerHTML = `
  <style>

#searchBox {
    width: 95%;
    font-size: 14px;
    padding-top: 3px;
    padding-right: 1px;
    padding-bottom: 3px;
    padding-left: 5px;
    font-family: "72";
    color: black;
  }
</style>

<div id="searchBoxDiv">
<input list="listItems" id="searchBox"  />
<datalist id="listItems">

</datalist>

</div>
	`;

	class SearchBox extends HTMLElement {
    
		constructor() {
			super(); 
			this._shadowRoot = this.attachShadow({ mode: 'open' });
      this._shadowRoot.appendChild(template.content.cloneNode(true));
  
      this._listItems = this._shadowRoot.querySelector('#listItems');
      this._searchBox = this._shadowRoot.querySelector('#searchBox');
      this._selectedMember = null;
		};

    onCustomWidgetBeforeUpdate(changedProperties) {
			this._props = { ...this._props, ...changedProperties };
		}

		onCustomWidgetAfterUpdate(changedProperties) {
			if ("displayType" in changedProperties) {
				this.displayType = changedProperties["displayType"];
			}
		}
    
    compare( a, b ) {
      if ( a.displayId < b.displayId){
        return -1;
      }
      if ( a.displayId > b.displayId ){
        return 1;
      }
      return 0;
    }
    populateSearchBox(members){
      members.sort(this.compare);

      for(var i=0;i<members.length;i++){
        let newOption = document.createElement('option');

        switch(this.displayType) {
          case 'id':
            newOption.value = members[i].displayId;
            break;
          case 'id-description':
            newOption.value = members[i].displayId+" - "+members[i].description;
            break;
          default:
            newOption.value = members[i].description;
        }
        newOption.id = members[i].id;
        newOption.setAttribute('data-displayId',members[i].displayId);
        newOption.setAttribute('data-description',members[i].description);
        newOption.setAttribute('data-dimensionId',members[i].dimensionId);
        this._listItems.appendChild(newOption);
      }

    }
    setEnabled(enabled){
      if(enabled){
        this._searchBox.disabled=false;
      }else{
        this._searchBox.disabled=true;
      }
    }

    isEnabled(){
      if(this._searchBox.disabled){
        return false;
      }else{
        return true;
      }
      
    }
    setFontSize(size){
      this._searchBox.style["font-size"] = size;
    }

    setFontFamily(family){
      this._searchBox.style["font-family"] = family;
    }

    setFontColor(color){
      this._searchBox.style["color"] = color;
    }

    setTopPadding(padding){
      this._searchBox.style["padding-top"] = padding;
    }

    setBottomPadding(padding){
      this._searchBox.style["padding-bottom"] = padding;
    }

    setLeftPadding(padding){
      this._searchBox.style["padding-left"] = padding;
    }

    setRightPadding(padding){
      this._searchBox.style["padding-right"] = padding;
    }

    getTopPadding(){
      return this._searchBox.style["padding-top"];
    }

    getBottomPadding(){
      return this._searchBox.style["padding-bottom"];
    }

    getLeftPadding(){
      return this._searchBox.style["padding-left"];
    }

    getRightPadding(){
      return this._searchBox.style["padding-right"];
    }

    setSelectedValue(e){
      var children = this._listItems.children;
      var value = this._searchBox.value;
      var id="";
      var displayId="";
      var description =""
      var dimensionId =""
      for(var i=0;i<children.length;i++){
        if(children[i].value==value){
          //console.log("index = "+i);
          id=children[i].id;
          displayId = children[i].getAttribute('data-displayId');
          description = children[i].getAttribute('data-description');
          dimensionId = children[i].getAttribute('data-dimensionId');
          break;
        }
      }

      this._selectedMember = {
        id : id,
        description : description,
        displayId : displayId,
        dimensionId : dimensionId
      };
      //console.log(this._selectedMember);
      this.dispatch('onMemberSelected');
      
    }

    getSelectedMember(){
      return this._selectedMember;
    }

    dispatch(event, arg) {
      this.dispatchEvent(new CustomEvent(event, {detail: arg}));
    }
  

    connectedCallback(){
      this._searchBox.addEventListener('change',(e)=>this.setSelectedValue(e));
     
  }
	}

	customElements.define("com-sap-sample-searchbox", SearchBox);
})();