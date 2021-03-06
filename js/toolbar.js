    var drawLine;  
	var drawLayer = new ol.layer.Vector({  
	    source: new ol.source.Vector(),  
	})  
	map.addLayer(drawLayer);  
	  
	function measureDistance() {  
	    drawLine = new ol.interaction.Draw({  
	        source: drawLayer.getSource(),  
	        type: "LineString"  
	    });  
	    map.addInteraction(drawLine);  
	  
	  
	    drawLine.on('drawend', function(evt) {  
	        console.log(evt);  
	        var distanceMeasureParam = new SuperMap.MeasureParameters(evt.feature.getGeometry());  
	        new ol.supermap.MeasureService(url, {  
	            measureMode: ""  
	        }).measureDistance(distanceMeasureParam, function(serviceResult) {  
	            console.log(serviceResult);  
	            alert(serviceResult.result.distance.toFixed(2) + ' m', true);  
	        });  
	    });  
	}

    var drawPolygon;  
	function measureArea() {  
	    drawPolygon = new ol.interaction.Draw({  
	        source: drawLayer.getSource(),  
	        type: "Polygon"  
	    });  
	    map.addInteraction(drawPolygon);  
	  
	  
	    drawPolygon.on('drawend', function(evt) {  
	        console.log(evt);  
	        var distanceMeasureParam = new SuperMap.MeasureParameters(evt.feature.getGeometry());  
	        new ol.supermap.MeasureService(url, {  
	            measureMode: ""  
	        }).measureArea(distanceMeasureParam, function(serviceResult) {  
	            console.log(serviceResult);  
	            alert(serviceResult.result.area.toFixed(2) + ' m²', true );  
	        });  
	    });  
	}

    function clearDraw() {  
		map.removeInteraction(drawLine);  
	    map.removeInteraction(drawPolygon);  
	    map.removeInteraction(drawPoint);  
	    drawLayer.getSource().clear();  
	    resultLayer.getSource().clear();  
	    overlay.setPosition(undefined);  
	    map.removeOverlay(overlay);
		currentFeature = null;
		map.removeInteraction(modify);  
	    map.removeInteraction(snap);  
	    editLayer.getSource().clear();
	}  

    function fullExtent() {
		map.setView(new ol.View({
			center: [106.77610910697551,-6.24318402101348],  
			zoom: 13,
			projection: 'EPSG:4326',
			multiWorld: true
		}));
	}



	var drawPoint;  
	var vectorSource = new ol.source.Vector({  
		wrapX: false  
	});  
	resultLayer = new ol.layer.Vector({  
		source: vectorSource  ,
		style: new ol.style.Style({
			stroke: new ol.style.Stroke({
			  color: 'red'
			})
		})  
	});  
	map.addLayer(resultLayer);

	var container = document.getElementById('popup'),  
    content = document.getElementById('popup-content');  
	var overlay = new ol.Overlay(({  
		element: container,  
		autoPan: true,  
		autoPanAnimation: {  
			duration: 250  
		},  
		offset: [0, -20]  
	}));

	function clickQuery() {  
		drawPoint = new ol.interaction.Draw({  
			source: drawLayer.getSource(),  
			type: "Point"  
		});  
		map.addInteraction(drawPoint);  
	  
		drawPoint.on('drawend', function(evt) {  
			clearDraw();  
	  
			var param = new SuperMap.QueryByGeometryParameters({  
				queryParams: {  
					name: "building@Training_data"  
				},  
				geometry: evt.feature.values_.geometry  
			});  
			new ol.supermap.QueryService(url).queryByGeometry(param, function(serviceResult) {  
				console.log(serviceResult);  
				var features = (new ol.format.GeoJSON()).readFeatures(serviceResult.result.recordsets[0].features);  
				vectorSource.addFeatures(features); 
             
                 
                //add popup to show attributes  
                if (features.length > 0 ){
                    var feature = features[0];  
                    var properties = feature.getProperties();  
                    var contentHTML = '<table class="table table-bordered">';  
                    
                    $.each(properties, function(idx, obj) {  
                        if (idx != "geometry" && idx != "SmID" && idx != "SmUserID" && idx != "SmArea" && idx !=  
                            "SmPerimeter" ) {  
                            contentHTML += "<tr>";  
                            contentHTML += '<td>' + idx + '</td>';  
                            contentHTML += '<td><input type="text" class="form-control" id="' + idx + 'Input" value="' + obj +  
                                '" /></td>';  
                            contentHTML += "</tr>";  
                        }  
                    });  
                    contentHTML += "</table>";
					currentFeature = feature;
					contentHTML += '<button class="btn btn-primary" style="width:50%" id="edit" onclick="editGeometry()">Edit Geometry</button>';  
					contentHTML += '<button class="btn btn-primary" style="width:50%" id="submit" onclick="editTable()">Submit</button>';
                    content.innerHTML = contentHTML;  
                    overlay.setPosition(evt.feature.values_.geometry.getCoordinates());  
                    map.addOverlay(overlay);  
                }
			});  
	  
		});  
	}  


	function showInput(){  
	    $("#inputPannel").toggle();  
	}  


	$("#keyWordsInput").bind("input propertychange", function() {  
	    clearDraw();  
	    var inputValue = $("#keyWordsInput").val();  
	    var param = new SuperMap.QueryBySQLParameters({  
	        queryParams: {  
	             name: "building@Training_data" , 
	            attributeFilter: "name LIKE '%" + inputValue + "%'"  
	        }  
	    });  
	    new ol.supermap.QueryService(url).queryBySQL(param, function(serviceResult) {  
	        var features = (new ol.format.GeoJSON()).readFeatures(serviceResult.result.recordsets[0].features);  
			vectorSource.addFeatures(features);  
	        $("#keyWordsOptions").show();  
	        $('#keyWordsTable').empty();  
	        var optionHTML = "";  
	  
	        for (var i = 0; i < features.length; i++) {  
	            var text = features[i].values_.name;  
	            var value = features[i].values_.SmID;  
	            optionHTML += "<option value='" + value + "'>" + text + "</option>";  
	        }  
	        $("#keyWordsTable").append(optionHTML);  
	    });  
	});  


	// Bind click event for options table
	$('#keyWordsTable').change(function() {  
	    clearDraw();  
	    var selectedID = $(this).val()[0];  
	    var param = new SuperMap.QueryBySQLParameters({  
	        queryParams: {  
	            name: "building@Training_data" , 
	            attributeFilter: "SmID = " + selectedID + ""  
	        }  
	    });  
	    new ol.supermap.QueryService(url).queryBySQL(param, function(serviceResult) {  
	        var features = (new ol.format.GeoJSON()).readFeatures(serviceResult.result.recordsets[0].features);  
	        vectorSource.addFeatures(features);  
	        var feature = features[0];  
			console.log(feature);  
	        var properties = feature.getProperties();  
	        var contentHTML = '<table class="table table-bordered">';  
	        console.log(feature.values_.geometry.getExtent());  
	        $.each(properties, function(idx, obj) {  
	            if (idx != "geometry" && idx != "SmID" && idx != "SmUserID" && idx != "SmArea" && idx !=  
	                "SmPerimeter") {  
	                contentHTML += "<tr>";  
	                contentHTML += '<td>' + idx + '</td>';  
	                contentHTML += '<td><input type="text" class="form-control" id="' + idx + 'Input" value="' + obj +  
	                    '" /></td>';  
	                contentHTML += "</tr>";  
	            }  
	        });  
	        contentHTML += "</table>";
			currentFeature = feature;
			contentHTML += '<button class="btn btn-primary" style="width:45%" id="edit" onclick="editTable()">Submit</button>';  
	        content.innerHTML = contentHTML;  
	        var featureExtent = feature.values_.geometry.getExtent();  
	        var centerPoint = [(featureExtent[0] + featureExtent[2]) / 2, (featureExtent[1] + featureExtent[3]) / 2];  
	        overlay.setPosition(centerPoint);  
	        map.addOverlay(overlay);  
	        var featureView = new ol.View({  
	            center: centerPoint,  
	            zoom: 18,  
	            projection: 'EPSG:4326',  
	            multiWorld: true  
	        });  
	        map.setView(featureView);  
	    });  
	})  
