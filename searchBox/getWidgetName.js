const template = document.createElement('template');
template.innerHTML = `
    <div>
    </div>
`;

class GetWidgetNames extends HTMLElement{
    constructor(){
        super();
        this.attachShadow({mode:'open'});
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        
    }
    getButtonNames(widgets){
        return this.getWidgetNames(widgets);
    }

    getCheckBoxGroupNames(widgets){
        return this.getWidgetNames(widgets);
    }
    
    getDropdownNames(widgets){
        return this.getWidgetNames(widgets);
    }

    getInputFieldNames(widgets){
        return this.getWidgetNames(widgets);
    }

    getListBoxNames(widgets){
        return this.getWidgetNames(widgets);
    }

    getRadioButtonGroupNames(widgets){
        return this.getWidgetNames(widgets);
    }

    getRangeSliderNames(widgets){
        return this.getWidgetNames(widgets);
    }

    getSliderNames(widgets){
        return this.getWidgetNames(widgets);
    }

    getSwitchNames(widgets){
        return this.getWidgetNames(widgets);
    }

    getTextAreaNames(widgets){
        return this.getWidgetNames(widgets);
    }


    getTableNames(widgets){
        return this.getWidgetNames(widgets);
    }

    getChartNames(widgets){
        return this.getWidgetNames(widgets);
    }

    getWidgetNames(widgets){
        let widgetNames =[];
        for(var i=0;i<widgets.length;i++){
            var widgetName = widgets[i]._scriptContext.scopeName;
            console.log(widgetName);
            widgetNames.push(widgetName);
        }
        return widgetNames;
    }


}

window.customElements.define('com-sap-sample-get-widget-name',GetWidgetNames);