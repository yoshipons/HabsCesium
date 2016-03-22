var viewer = new Cesium.Viewer("cesiumContainer", {
  baseLayerPicker : false,  //デフォルトのレイヤ切り替えウィジェットをオフにする
  timeline : false,         //デフォルトのタイムラインウィジェットをオフにする
  animation : false         //デフォルトのアニメーションウィジェットをオフにする
});

// 地理院地図の標高タイルのライブラリ追加
var terrainProvider = new Cesium.JapanGSITerrainProvider({
  heightPower: 2.5 //高さの倍率の設定
});
viewer.terrainProvider = terrainProvider;


// 初期の視点設定
viewer.camera.setView({
  destination: Cesium.Cartesian3.fromDegrees(139.6721684, 35.7052493, 50000),
  orientation: {
    heading: 0, // 水平方向の回転
    pitch: -Cesium.Math.PI_OVER_TWO, // 垂直方向の回転 上を見上げたり下を見下ろしたり
    roll: 0
  }
});

// KMLの読み込み
viewer.dataSources.add(Cesium.KmlDataSource.load('kml/doc.kml'),{
         camera: viewer.scene.camera,
         canvas: viewer.scene.canvas
});

// KMLのチェックボックス
// var toolbar = document.getElementById('kml');
// Cesium.knockout.applyBindings(viewModel, toolbar);
// Cesium.knockout.getObservable(viewModel, 'fogEnabled').subscribe(function(newValue) {
//     viewer.scene.fog.enabled = newValue;
// });
// viewModel.enabled = viewer.scene.fog.enabled;



// 各種レイヤーの透過度の初期設定
var imageryLayers = viewer.imageryLayers;
var viewModel = {
    layers : [],
    baseLayers : [],
    upLayer : null,
    downLayer : null,
    selectedLayer : null,
    isSelectableLayer : function(layer) {
        return baseLayers.indexOf(layer) >= 0;
    },
    raise : function(layer, index) {
        imageryLayers.raise(layer);
        viewModel.upLayer = layer;
        viewModel.downLayer = viewModel.layers[Math.max(0, index - 1)];
        updateLayerList();
        window.setTimeout(function() { viewModel.upLayer = viewModel.downLayer = null; }, 10);
    },
    lower : function(layer, index) {
        imageryLayers.lower(layer);
        viewModel.upLayer = viewModel.layers[Math.min(viewModel.layers.length - 1, index + 1)];
        viewModel.downLayer = layer;
        updateLayerList();
        window.setTimeout(function() { viewModel.upLayer = viewModel.downLayer = null; }, 10);
    },
    canRaise : function(layerIndex) {
        return layerIndex > 0;
    },
    canLower : function(layerIndex) {
        return layerIndex >= 0 && layerIndex < imageryLayers.length - 1;
    }
};
Cesium.knockout.track(viewModel);

// 各種レイヤー読み込み
var baseLayers = viewModel.baseLayers;
function setupLayers() {
    // Create all the base layers that this example will support.
    // These base layers aren't really special.  It's possible to have multiple of them
    // enabled at once, just like the other layers, but it doesn't make much sense because
    // all of these layers cover the entire globe and are opaque.
    addBaseLayerOption(
            'Bing Maps Aerial',
            undefined); // the current base layer
    // Create the additional layers
    addBaseLayerOption(
      '地理院地図',
            new Cesium.OpenStreetMapImageryProvider({
                url: 'http://cyberjapandata.gsi.go.jp/xyz/std/',
                credit: new Cesium.Credit('地理院タイル', '', 'http://maps.gsi.go.jp/development/ichiran.html')
            }));
    // Create the additional layers
    addBaseLayerOption(
      '電子国土基本図（オルソ画像）',
      new Cesium.OpenStreetMapImageryProvider({
        url: 'http://cyberjapandata.gsi.go.jp/xyz/ort/',
        credit: new Cesium.Credit('地理院タイル', '', 'http://maps.gsi.go.jp/development/ichiran.html')
      }));
    addAdditionalLayerOption(
      '迅速測図',
      new Cesium.OpenStreetMapImageryProvider({
        url: 'http://www.finds.jp/ws/tmc/1.0.0/Kanto_Rapid-900913-L/',
        "ext": "jpg",
        "zmin": 0,
        "zmax": 18,
        credit : 'CC BY 国立研究開発法人農業環境技術研究所 歴史的農業環境閲覧システム',
      }));
}

function addBaseLayerOption(name, imageryProvider) {
    var layer;
    if (typeof imageryProvider === 'undefined') {
        layer = imageryLayers.get(0);
        viewModel.selectedLayer = layer;
    } else {
        layer = new Cesium.ImageryLayer(imageryProvider);
    }

    layer.name = name;
    baseLayers.push(layer);
}


function addAdditionalLayerOption(name, imageryProvider, alpha, show) {
    var layer = imageryLayers.addImageryProvider(imageryProvider);
    layer.alpha = Cesium.defaultValue(alpha, 1);
    layer.show = Cesium.defaultValue(show, true);
    layer.name = name;
    Cesium.knockout.track(layer, ['alpha', 'show', 'name']);
}

function updateLayerList() {
    var numLayers = imageryLayers.length;
    viewModel.layers.splice(0, viewModel.layers.length);
    for (var i = numLayers - 1; i >= 0; --i) {
        viewModel.layers.push(imageryLayers.get(i));
    }
}

setupLayers();
updateLayerList();


//Bind the viewModel to the DOM elements of the UI that call for it.
var toolbar = document.getElementById('toolbar');
Cesium.knockout.applyBindings(viewModel, toolbar);

Cesium.knockout.getObservable(viewModel, 'selectedLayer').subscribe(function(baseLayer) {
    // Handle changes to the drop-down base layer selector.
    var activeLayerIndex = 0;
    var numLayers = viewModel.layers.length;
    for (var i = 0; i < numLayers; ++i) {
        if (viewModel.isSelectableLayer(viewModel.layers[i])) {
            activeLayerIndex = i;
            break;
        }
    }
    var activeLayer = viewModel.layers[activeLayerIndex];
    var show = activeLayer.show;
    var alpha = activeLayer.alpha;
    imageryLayers.remove(activeLayer, false);
    imageryLayers.add(baseLayer, numLayers - activeLayerIndex - 1);
    baseLayer.show = show;
    baseLayer.alpha = alpha;
    updateLayerList();
});
