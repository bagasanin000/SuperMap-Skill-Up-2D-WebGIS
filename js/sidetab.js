function queryLanduse() {  
    var selectedType = $('#landuseType').val();  
    var param = new SuperMap.QueryBySQLParameters({  
        queryParams: {  
            name: "landuse@Training_data", 
            attributeFilter: "fclass = '"+ selectedType +"'"
        }  
    });  

    new ol.supermap.QueryService(url).queryBySQL(param, function(serviceResult) {
        var features = (new ol.format.GeoJSON()).readFeatures(serviceResult.result.recordsets[0].features);  
        vectorSource.clear();
        vectorSource.addFeatures(features); 
        console.log(serviceResult);
    });  
}