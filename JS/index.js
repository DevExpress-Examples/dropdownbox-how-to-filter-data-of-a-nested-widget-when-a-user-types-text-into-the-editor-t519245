$(function(){
    
    var dataGrid, searchTimer;
    
    var dataSource = new DevExpress.data.DataSource({
        searchExpr: "CompanyName",
        store: new DevExpress.data.CustomStore({
            loadMode: "raw",
            key: "ID",
            load: function() {
                console.log("load");
                return $.getJSON("data/customers.json");
            }
        })
    });
    
    var isSearchIncomplete = function(dropoDownBox){
        var value = dropoDownBox.option("value"),
            displayValue = dropoDownBox.option("displayValue"),
            text = dropoDownBox.option("text");
    
        text = text && text.length && text[0];
        displayValue = displayValue && displayValue.length && displayValue[0];
        
        return text !== displayValue;
    };
    
    $("#gridBox").dxDropDownBox({
        value: 11,
        valueExpr: "ID",
        placeholder: "Select a value...",
        displayExpr: "CompanyName",
        acceptCustomValue: true,
        openOnFieldClick: false,
        valueChangeEvent: "",
        onInput: function(e){
            clearTimeout(searchTimer);
            searchTimer = setTimeout(function() {
                var text = e.component.option("text"),
                    opened = e.component.option("opened");
                
                dataSource.searchValue(text);
                if (opened && isSearchIncomplete(e.component)) {
                    dataSource.load();
                } else {
                    e.component.open();
                }
            }, 1000);
        },
        onOpened: function(e){
            if (isSearchIncomplete(e.component)){
                dataSource.load();
            }
        },
        onClosed: function(e){
            var value = e.component.option("value"),
                searchValue = dataSource.searchValue();
            
            if (isSearchIncomplete(e.component)){
                e.component.reset();
                e.component.option("value", value);
            }
            
            if (searchValue) {
                dataSource.searchValue(null);
                dataSource.load();
            }
        },
        showClearButton: true,
        dataSource: dataSource,
        contentTemplate: function(e){
            var value = e.component.option("value"),
                $dataGrid = $("<div>").dxDataGrid({
                    dataSource: e.component.getDataSource(),
                    columns: ["CompanyName", "City", "Phone"],
                    hoverStateEnabled: true,
                    paging: { enabled: true, pageSize: 10 },
                    scrolling: { mode: "infinite" },
                    height: 265,
                    selection: { mode: "single" },
                    selectedRowKeys: value ? [value] : [],
                    onSelectionChanged: function(selectedItems) {
                        e.component.option("value", selectedItems.selectedRowKeys[0] || null);
                    }
                });
            
            dataGrid = $dataGrid.dxDataGrid("instance");
            
            e.component.on("valueChanged", function(args){
                clearTimeout(searchTimer);
                dataGrid.option("selectedRowKeys", args.value ? [args.value] : []);
                e.component.close();
            });
            
            return $dataGrid;
        }
    });
});
