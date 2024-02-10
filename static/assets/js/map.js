
///OSM:::::::::::::::::::::
var mapView = new ol.View({
  center: ol.proj.fromLonLat([-0.349989 , 35.8541575]),  
  zoom: 7,
  });
var map = new ol.Map({
        view: mapView,
        target: "map",
        controls: []
      });
var osmTile = new ol.layer.Tile ({
  title : 'OpanStreetMap',
  visible : true,
  source : new ol.source.OSM(),
});
map.addLayer(osmTile);
var Mapstreets = new ol.layer.Tile({
  source: new ol.source.TileJSON({
    url: 'https://api.maptiler.com/maps/streets-v2/tiles.json?key=SaAmWTUTX66XgjQewfYt',
  }),
  visible: true,
  title: 'Mapstreets',
});
map.addLayer(Mapstreets);
/////////////////ALGERIA_MAP
var Algeria_Map = new ol.layer.Tile({
  title: 'Algeria Map',
  visible: true,
  source : new ol.source.TileWMS({
    url: 'http://localhost:8080/geoserver/SIFELISLAM/wms',
    params: {'LAYERS': 'SIFELISLAM:dza_admbnda_adm2_unhcr_20200120', 'TILED': true},
    serverType: 'geoserver',
  })
});
map.addLayer(Algeria_Map);
//list item
var layerswitcher = new ol.control.LayerSwitcher();
map.addControl(layerswitcher);
//scale
var scaleLineControl = new ol.control.ScaleLine({
  bar: true,
  text: true
});
map.addControl(scaleLineControl);
////////mouse position

//home screen
var homeButton = document.createElement('button');
homeButton.innerHTML ='<img src="/static/assets/icons/h.png" alt="" style="width:20px;height:20px;filter:brightness(0) invert(1);vertical-align:middle;"></img>';
homeButton.className = 'myButton';

var homeElement = document.createElement('div');
homeElement.className = 'homeButtonDiv';
homeElement.appendChild(homeButton);

var homeControl = new ol.control.Control({
  element : homeElement
}) 

homeButton.addEventListener("click", () => {
  location.href = 'index.html';
})
map.addControl(homeControl)
//full screen
var fsButton = document.createElement('button');
fsButton.innerHTML ='<img src="/static/assets/icons/fs.png" alt="" style="width:20px;height:20px;filter:brightness(0) invert(1);vertical-align:middle"></img>';
fsButton.className = 'myButton';

var fsElement = document.createElement('div');
fsElement.className = 'fsButtonDiv';
fsElement.appendChild(fsButton);

var fsControl = new ol.control.Control({
  element : fsElement
}) 

fsButton.addEventListener("click", () => {
  var mapEle = document.getElementById("map");
  if (mapEle.requestFullscreen) {
    mapEle.requestFullscreen();
  } else if (mapEle.msRequestFullScreen) {
    mapEle.msRequestFullScreen(); 
  } else if (mapEle.mozRequestFullScreen) {
    mapEle.mozRequestFullScreen();
  } else if (mapEle.webkitRequestFullScreen) {
    mapEle.webkitRequestFullScreen();
  }
})
map.addControl(fsControl);
///////////////////////////////////
let Elem = document.querySelector('input');

Elem.addEventListener('change', function () {
  let selectedFile = Elem.files[0];
  if (selectedFile) {
      let fileExtension = selectedFile.name.split('.').pop().toLowerCase();
      let url = URL.createObjectURL(selectedFile);
      if (fileExtension === 'geojson') {
          addGeoJSONLayer(url);
          console.log('GeoJSON file added to layer');
      } else if (fileExtension === 'kml') {
          addKMLLayer(url);
          console.log('KML file added to layer');
      }else if( fileExtension === 'tiff' || fileExtension === 'tif'){
        addGeoTifLayer(url);
        console.log('Tiff file added to layer');
      }else if(fileExtension === 'csv'){
        loadCSV(url);
        console.log('csv file added to layer');
      }else if(fileExtension === 'zip'){
        loadShapefileFromZip(url);
        console.log('shp file added to layer');
      }else {
          console.log('Unsupported file format');
      }
    }
});
////////////////////display function
function addGeoJSONLayer(url) {
var geojsonLayer = new ol.layer.Vector({
  source: new ol.source.Vector({
    format: new ol.format.GeoJSON(),
    url: url
  }),
  title: 'GeoJSONLayer',
  visible: true
});
map.addLayer(geojsonLayer);
};

function addKMLLayer(url) {
var kmlLayer = new ol.layer.Vector({
  source: new ol.source.Vector({
    format: new ol.format.KML(),
    url: url
  }),
  title: 'KMLLayer',
  visible: true
});
map.addLayer(kmlLayer);
};

function addGeoTifLayer(url) {
  GeoTIFF.fromUrl(url)
      .then(tiff => tiff.getImage())
      .then(image => {
          const extent = image.getBoundingBox();
          const geotiffLayer = new ol.layer.Image({
              title: 'geotiff',
              source: new ol.source.ImageStatic({
                  imageExtent: extent,
                  imageLoadFunction: function (img, src) {
                      GeoTIFF.fromUrl(src)
                          .then(tiff => tiff.getImage())
                          .then(image => {
                              const width = image.getWidth();
                              const height = image.getHeight();
                              image.readRGB().then(raster => {
                                  const canvas = document.createElement('canvas');
                                  canvas.width = width;
                                  canvas.height = height;
                                  const ctx = canvas.getContext('2d');
                                  const imageData = ctx.createImageData(width, height);
                                  let o = 0;
                                  for (let i = 0; i < raster.length; i += 3) {
                                      imageData.data[o] = raster[i];
                                      imageData.data[o + 1] = raster[i + 1];
                                      imageData.data[o + 2] = raster[i + 2];
                                      imageData.data[o + 3] = 255;
                                      o += 4;
                                  }
                                  ctx.putImageData(imageData, 0, 0);
                                  img.getImage().src = canvas.toDataURL();
                              });
                          })
                          .catch(error => console.error(error));
                  },
                  url: url
              }),
              visible: true
          });

          map.addLayer(geotiffLayer);
          map.getView().fit(extent, map.getSize());
      })
      .catch(error => console.error(error));

};
/////////////////////function csv
function loadCSV(url) {
const csvFilePath = url;
d3.csv(csvFilePath).then(function(data) {
  var xValues = [];
  var yValues = [];
  data.forEach(function(d) {
    xValues.push(parseFloat(d.x)); 
    yValues.push(parseFloat(d.y));
  });
  console.log('Liste x:', xValues);
  console.log('Liste y:', yValues);
  const features = [];
    for (i = 0; i < xValues.length; i++) {
      features.push(new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat([
          xValues[i], yValues[i]
        ]))
      }));
    };
    var csvLayer = new ol.layer.Vector({
      source: new ol.source.Vector({
        features: features
      }),
      title:'CsvPoints',
      visible: true
    });
    map.addLayer(csvLayer);
}).catch(function(error) {
  console.error('Erreur lors du chargement du fichier CSV:', error);
});
};
///////////////////////////////////////////
var mousePosition = new ol.control.MousePosition({
className: 'mousePosition',
projection: 'EPSG:4326',
coordinateFormat: function(coordinate){return ol.coordinate.format(coordinate,'{y} , {x}' , 6)}
});
map.addControl(mousePosition);




var distButton = document.createElement('button');
distButton.innerHTML ='<img src="/static/assets/icons/dist.png" alt="" style="width:17px;height:17px;filter:brightness(0) invert(1);vertical-align:middle"></img>';
distButton.className = 'myButton';
distButton.id = 'distButton';

var distElement = document.createElement('div');
distElement.className = 'distButtonDiv';
distElement.appendChild(distButton);

var distControl = new ol.control.Control({
  element : distElement
}) 
var lengthFlag = false;
distButton.addEventListener("click", () => {
  distButton.classList.toggle('clicked');
  lengthFlag = !lengthFlag;
  document.getElementById("map").style.cursor = "default";
  if(lengthFlag){
    map.removeInteraction(draw);
    addInteraction('LineString');
  } else {
    map.removeInteraction(draw);
    source.clear();
    const elements = document.getElementsByClassName("ol-tooltip ol-tooltip-static");
    while (elements.length > 0) elements[0].remove();
  }
})
map.addControl(distControl);


//mesure surface 
var surfButton = document.createElement('button');
surfButton.innerHTML ='<img src="/static/assets/icons/surf.png" alt="" style="width:17px;height:17px;filter:brightness(0) invert(1);vertical-align:middle"></img>';
surfButton.className = 'myButton';

var surfElement = document.createElement('div');
surfElement.className = 'surfButtonDiv';
surfElement.appendChild(surfButton);

var surfControl = new ol.control.Control({
  element : surfElement
}) 
var areaFlag = false;
surfButton.addEventListener("click", () => {
  surfButton.classList.toggle('clicked');
  areaFlag = !areaFlag;
  document.getElementById("map").style.cursor = "default";
  if(areaFlag){
    map.removeInteraction(draw);
    addInteraction('Polygon');
  } else {
    map.removeInteraction(draw);
    source.clear();
    const elements = document.getElementsByClassName("ol-tooltip ol-tooltip-static");
    while (elements.length > 0) elements[0].remove();
  }
})
map.addControl(surfControl);

////////////////////////////////////////////
/**
 * Message to show when the user is drawing a polygon.
 * @type{string}
 */
var continuePolygonMsg = 'click to continue polygon, Double click to complete';
///////////////////////////////////////////
/**
 * Message to show when the user is drawing a line.
 * @type{string}
 */
var continueLineMsg = 'click to continue line, Double click to complete';
//////////////////////////////////////////
var draw;
var source = new ol.source.Vector();
var vector = new ol.layer.Vector({
  source : source,
  style : new ol.style.Style({
    fill : new ol.style.Fill({
      color : 'rgba[255,255,255,0.2]',
    }),
    stroke : new ol.style.Stroke({
      color : '#ffc33',
      width : 2,
    }),
    image: new ol.style.Circle({
      radius: 7,
      fill: new ol.style.Fill({color: '#ffcc33'}),
    }),
  }),
});
map.addLayer(vector);

////////////////////////////////////////
function addInteraction(intType) {
  draw = new ol.interaction.Draw({
    source : source,
    type : intType,
    style : new ol.style.Style({
      fill : new ol.style.Fill({
        color : 'rgba(200,200,200,0.6)',
      }),
      stroke : new ol.style.Stroke({
        color : 'rgba(0,0,0,0.5)',
        lineDash : [10 , 10],
        width:2,
      }),
      fill : new ol.style.Fill({
        radius: 5,
        stroke : new ol.style.Stroke({
          color:'rgba(0,0,0,0.7)'
        }),
        fill : new ol.style.Fill({
          color: 'rgba(255,255,255,0.2)'
        }),

      }),
    }),
  }),
  map.addInteraction(draw);
  createMeasureTooltip();
  createHelpTooltip();
  /**
 * Currently drawn feature.
 * @type {import("..src/ol/Feature.js").default}
 */
  var sketch;
  /**
   * Handle pointer feature.
   * @param {import("../src/ol/MapBrowserEvent").default} evt The event.
   */
  var pointerMoveHandler = function (evt) {
    if (evt.dragging) {
      return;
    }
  /** @type {string} */
  var helpMsg = 'Click to start drawing';
  if (sketch) {
    var geom = sketch.getGeometry();
    }
  };
  map.on('pointermove', pointerMoveHandler);
  draw.on('drawstart', function (evt){
    sketch = evt.feature;
    /** @type {import("../src/ol/coordinate.js").Coordinate|undefined} */


    
    var tooltipCoord = evt.coordinate;


    sketch.getGeometry().on('change' , function (evt) {
      var geom = evt.target;
      var output;
      if (geom instanceof ol.geom.Polygon) {
        output = formatArea(geom);
        tooltipCoord = geom.getInteriorPoint().getCoordinates();
      }else if (geom instanceof ol.geom.LineString) {
        output = formatLength(geom);
        tooltipCoord = geom.getLastCoordinate();
      }
      measureTooltipElement.innerHTML = output;
      measureTooltip.setPosition(tooltipCoord);
    });
});
  draw.on('drawend', function () {
    measureTooltipElement.className = 'ol-tooltip ol-tooltip-static';
    measureTooltip.setOffset([0, -7]);
    sketch = null;
    measureTooltipElement = null;
    createMeasureTooltip();
  });
}
//////////////////////////
/**
 * The help tooltip element.
 * @type {HTMLElement}
 */
var helpTooltipElement;
/**
 * Overlay to show the help messages.
 * @type {Overlay}
 */
var helpTooltip;
/**
 * Creates a new help tooltip
 */
function createHelpTooltip() {
  if (helpTooltipElement) {
    helpTooltipElement.parentNode.removeChild(helpTooltipElement);
  }
  helpTooltipElement = document.createElement('div');
  helpTooltipElement.className = 'ol-tooltip hidden';
  helpTooltip = new ol.Overlay({
    element: helpTooltipElement,
    offset : [15,0],
    positioning : 'center-left',
  });
  map.addOverlay(helpTooltip);
}
///////////////////
/**
 * The help tooltip element.
 * @type {HTMLElement}
 */
var measureTooltipElement;
/**
 * Overlay to show the help messages.
 * @type {Overlay}
 */
var measureTooltip;
/**
 * Creates a new help tooltip
 */
function createMeasureTooltip() {
  if (measureTooltipElement) {
    measureTooltipElement.parentNode.removeChild(measureTooltipElement);
  }
  measureTooltipElement = document.createElement('div');
  measureTooltipElement.className = 'ol-tooltip ol-tooltip-measure';
  measureTooltip = new ol.Overlay({
    element: measureTooltipElement,
    offset: [0, -15],
    positioning: 'bottom-center',
    });
    map.addOverlay(measureTooltip);
}
////////////////
/**
 * Format length output.
 * @param {LineString} line The line.
 * @return {string} The formatted length.
 */
var formatLength = function(line) {
  var length = ol.sphere.getLength(line);
  var output;
  if (length > 100) {
    output =Math.round((length / 1000) * 100) / 100 + ' ' + 'km';
  } else {
    output = Math.round(length * 100) / 100 + ' ' + 'm';
  }
  return output;
};
////////////////
/**
 * 
 * @param {Polygon} polygon The polygon.
 * @return {string} Formatted area.
 */
var formatArea = function (polygon) {
  var area = ol.sphere.getArea(polygon);
  var output;
  if (area > 10000) {
    output = (Math.round(area / 1000000) / 100 ) + ' ' + ' ' + 'km<sup>2</sup>';
} else {
  output = Math.round(area *100 ) / 100 + ' ' + ' m<sup>2</sup>';
}
return output;
};


