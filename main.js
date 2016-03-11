var viewer = new Cesium.Viewer("cesium");

// 初期の視点設定
viewer.camera.setView({
  destination: Cesium.Cartesian3.fromDegrees(139.6721684, 35.7052493, 50000),
  orientation: {
    heading: 0, // 水平方向の回転
    pitch: -Cesium.Math.PI_OVER_TWO, // 垂直方向の回転 上を見上げたり下を見下ろしたり
    roll: 0
  }
});

var terrainProvider = new Cesium.JapanGSITerrainProvider({});
viewer.terrainProvider = terrainProvider;

var viewer = new Cesium.Viewer('cesiumContainer', {
    imageryProvider: new Cesium.OpenStreetMapImageryProvider({
      url: 'http://cyberjapandata.gsi.go.jp/xyz/std/',
      credit: new Cesium.Credit('地理院タイル', '', 'http://maps.gsi.go.jp/development/ichiran.html')
    }),
    baseLayerPicker: false
  });
  viewer.scene.camera.setPositionCartographic(Cesium.Cartographic.fromDegrees(140.00, 36.14, 20000000.0));
