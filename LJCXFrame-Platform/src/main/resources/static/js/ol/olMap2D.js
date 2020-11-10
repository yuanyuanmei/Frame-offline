/**
 * 高德地图模块
 * @author 陶冶
 * @version 1.0 2019/2/21
 */

(function() {
	var MapGD2D = {
		map : null,
		el : null,
		options : {					// 地图设置
			el: "2dmap",
			center : [113.950981,22.530101],  //地图中心点
			zoom : 12,
			pitch: 50,
			rotation: 25
		},
		markerLayer : null,
		lineLayer: null,

		mapType : "google",   // 当前底图样式
		/**
		 * 创建地图控件
		 */
		createMap : function(options,_fun) {
			var that = this;
			this.options = $.extend({}, this.options, options);
			this.el = options.el;

			this.markerLayer = new ol.layer.Vector({
				source: new ol.source.Vector()
			})

			this.lineLayer = new ol.layer.Vector({
				source: new ol.source.Vector()
			})

			this.zoomFactorSize = 5;

			this.map = new ol.Map({
				target: this.el ,
				controls: ol.control.defaults().extend([
					new ol.control.ScaleLine({})
				]),
				layers: [
					new ol.layer.Tile({
						// title : "谷歌卫星切片图层",
						// _mapType : "google",
						source: new ol.source.XYZ({
							//url:'https://mt{0-3}.google.cn/vt/lyrs=s&hl=zh-CN&gl=cn&x={x}&y={y}&z={z}&s=Galile'
							wrapX: false,
							url:'https://mt{0-3}.google.cn/vt/lyrs=s@854&hl=zh-CN&gl=cn&src=app&x={x}&y={y}&z={z}&s='
						}),
						maxZoom:22,
						visible: true
					})
					,new ol.layer.Tile({
						// title : "google卫星混合图带注记",
						// _mapType : "DOM1",
						source: new ol.source.XYZ({
							wrapX: false,
							tileSize: 256,
							url:'https://mt{0-3}.google.cn/vt/lyrs=p@189&hl=zh-CN&gl=cn&x={x}&y={y}&z={z}'
						}),
						maxZoom:22,
						visible: false
					})
					,new ol.layer.Tile({
						// title : "矢量地图",
						// _mapType : "vec", vt?lyrs=r@189&gl=cn&x={x}&y={y}&z={z}
						source: new ol.source.XYZ({
							wrapX: false,
							tileSize: 256,
							url:'https://mt{0-3}.google.cn/vt/lyrs=r@854&hl=zh-CN&gl=cn&src=app&x={x}&y={y}&z={z}&s='
							//url : 'https://www.google.cn/maps/vt?pb=!1m5!1m4!1i{z}!2i{x}!3i{y}!4i256!2m3!1e0!2sm!3i342009817!3m9!2szh-CN!3sCN!5e18!12m1!1e47!12m3!1e37!2m1!1ssmartmaps!4e0&token=32965'
						}),
						maxZoom:22,
						visible: false
					})
					,this.markerLayer
					,this.lineLayer
				],
				view: new ol.View({
					center: this.options.center,
					projection: 'EPSG:4326',
					zooms:[10,22],
					zoom: this.options.zoom
				})
				/*,maxTilesLoading:32,//同时加载的最大瓷砖数 默认16
				loadTilesWhileAnimating:false,//
				loadTilesWhileInteracting:false,//
				moveTolerance:1 //光标必须移动的最小距离(以像素为单位)才能被检测为map move事件，而不是单击。增加这个值可以使单击地图变得更容易*/
			});


			/*
                        // 测量工具控件
                        this.mouseTool = new AMap.MouseTool(this.map);
                        this.mouseTool.on('draw',function (type,obj) {
                            MapGD2D.mouseTool.close();
                        })
            */
			// 坐标控件
			this.map.on('pointermove',function (e) {
				var _lonlat = that.map.getCoordinateFromPixel(e.pixel);
				//var t = ol.proj.transform(that.map.getEventCoordinate(e), 'EPSG:3857', 'EPSG:4326');
				if(_lonlat != null && that.el == "2dmap"){
					document.getElementById("p_postion").innerHTML = _lonlat[0].toFixed(4) + " , " + _lonlat[1].toFixed(4);
				}
			});

			// feature 的点击事件
			this.map.on('click', function (evt) {
				if (evt.dragging) {   //如果是拖动地图造成的鼠标移动，则不作处理
					return;
				}

				var pixel = that.map.getEventPixel(evt.originalEvent);
				var feature = that.map.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
					return feature;
				});

				if (feature) {
					//var coordinates = feature.getGeometry().getCoordinates();
					var enableClick = feature.get("enableClick");

				}
			});

			this.map.on('rendercomplete', function() {
			});


		},

		/**
		 * 地图切换
		 */
		toggleBaseLayer:function(_type){
			if (_type != this.mapType){
				if (_type == "vec"){
					this.map.getLayers().item(0).setVisible(false);
					this.map.getLayers().item(1).setVisible(false);
					this.map.getLayers().item(2).setVisible(true);
				}else if(_type == "3d"){
					window.open("https://www.szsqn.com:8443/3DMap/home.html");
				}else if(_type == "google"){
					this.map.getLayers().item(0).setVisible(true);
					this.map.getLayers().item(1).setVisible(false);
					this.map.getLayers().item(2).setVisible(false);
				}else if(_type == "DOM1"){
					this.map.getLayers().item(0).setVisible(false);
					this.map.getLayers().item(1).setVisible(true);
					this.map.getLayers().item(2).setVisible(false);
				}

				this.mapType = _type;
			}
		},
		/**
		 * 打开pop
		 */
		openInfo:function(content,position,size) {
			if (!size || typeof(size)=="undefined") {
				size = new AMap.Size(250,145);
			}　else {
				size = new AMap.Size(250,150);
			}
			var infoWindow = new AMap.InfoWindow({
				size: size,
				offset: new AMap.Pixel(0, -16),
				content: content  //使用默认信息窗体框样式，显示信息内容
			});

			infoWindow.open(this.map,position);
		},

		setZoomAndCenter : function(positions,zoom){
			zoom =  zoom || MapGD2D.map.getView().getZoom();
			this.map.setView(new ol.View({
				center: positions,
				projection: 'EPSG:4326',
				zoom: zoom
			}));
		},
		/**
		 * TODO 显示 隐藏 mark
		 * @param _memberType  all  car man plane
		 * @param _boolen true false
		 */
		showOrHideMark:function(_memberId,_memberType,_boolen){
			var _markers = this.map.getOverlays().getArray();
			for (var i=0;i<_markers.length;i++){
				if (_markers[i].getOptions().memberType ==_memberType){
					if(_markers[i].getOptions().memberId == _memberId || _memberId == 0){
						if (_boolen){
							$("#" + _markers[i].id).show();
						}else{
							$("#" + _markers[i].id).hide();
						}
					}
				}
			}
		},

		// 2020-05-12 删除点坐标
		removeMark: function(_memberId,_memberType){
			var _markers = this.map.getOverlays().getArray();
			for (var i=0;i<_markers.length;i++){
				if (_markers[i].getOptions().memberType ==_memberType){
					if(_markers[i].getOptions().memberId == _memberId || _memberId == 0){
						this.map.removeOverlay(_markers[i]);
					}
				}
			}
		},

		noStyle: new ol.style.Style({
			fill: new ol.style.Fill({ //矢量图层填充颜色，以及透明度
				color: "rgba(255,255,255,0)"
			}),
			stroke: new ol.style.Stroke({ //边界样式
				color: "rgba(255,255,255,0)",
				width: 0
			})
		}),

		/**
		 * TODO feature对角的显示
		 * @param _memberType
		 * @param _boolen
		 */
		showOrHideFeatures : function(_memberType,_boolen){
			var _features = this.markerLayer.getSource().getFeatures();
			for (var i=0;i<_features.length;i++){
				if (_features[i].get("memberType") ==_memberType){
					if (_boolen){
						var _style = _features[i].get("_style");
						_features[i].setStyle(_style);
					}else{
						_features[i].setStyle(this.noStyle);
					}
				}
			}
		},
		/**
		 * TODO 创建Polygon  使用 feature
		 */
		createPolygon:function(_option , _isShow){

			var _polyCoords = [];
			var position = _option.vertices.split(" ");
			for(var i = 0;i<position.length;i++){
				_polyCoords.push([position[i].split(",")[0],position[i].split(",")[1]]);
			}
			var _type = _option.memberType;
			if (_polyCoords.length >= 4){

				var style = new ol.style.Style({
					fill: new ol.style.Fill({ //矢量图层填充颜色，以及透明度
						color: this.colorRgba(_option.color,0.15)
					}),
					stroke: new ol.style.Stroke({ //边界样式
						color: this.colorRgba(_option.color,0.7),
						width: 1
					})
				});

				var feature = new ol.Feature({
					geometry: new ol.geom.Polygon([_polyCoords]),
					memberType: _option.memberType,
					enableClick : false,
					flyZoneId: _option.flyZoneId,
					_style : style,
					name: _option.name
				});

				if(_isShow){
					feature.setStyle(style);
				}else{
					feature.setStyle(this.noStyle);
				}

				// 添加到之前的创建的layer中去
				this.markerLayer.getSource().addFeature(feature);
			}
		},

		/**
		 * TODO 创建Line  使用 feature
		 */
		createLine:function(_option , _isShow){
			var _polyCoords = [];
			if (Object.prototype.toString.call(_option.vertices) == '[object Array]'){
				_polyCoords = _option.vertices;
			}else if(Object.prototype.toString.call(_option.vertices) == '[object String]'){
				var position = _option.vertices.split(" ");
				for(var i = 0;i<position.length;i++){
					_polyCoords.push( [ parseFloat(position[i].split(",")[0]) ,
						parseFloat(position[i].split(",")[1]) ] );
				}
			}else{
				return;
			}

			// var _type = _option.memberType;
			if (_polyCoords.length >= 2){
				var lineStyle  = new ol.style.Style({
					stroke: new ol.style.Stroke({ //边界样式
						color: this.colorRgba(_option.color,1),
						width: _option.strokeWidth || 3,
					})
				});

				var feature = new ol.Feature({
					geometry: new ol.geom.LineString(_polyCoords,"XY"),
					memberType: _option.memberType,
					enableClick : false,
					flyLineId: _option.flyLineId,
					_style : lineStyle,
					name: _option.name
				});

				if(_isShow){
					feature.setStyle(lineStyle);
				}else{
					feature.setStyle(this.noStyle);
				}

				// 添加到之前的创建的layer中去
				this.lineLayer.getSource().addFeature(feature);
			}
		},

		/**
		 * 创建圆
		 * @param _option
		 */
		createCircle:function(_option,_isShow){

			var style = new ol.style.Style({
				fill: new ol.style.Fill({
					color: this.colorRgba(_option.fillColor,_option.fillOpacity)
				}),
				stroke: new ol.style.Stroke({
					width: _option.strokeWeight,
					color: this.colorRgba(_option.strokeColor,_option.strokeOpacity)
				})
			});

			var circleGeom = ol.geom.Polygon.circular([_option.lon,_option.lat], _option.radius, 64);

			var circleFeature = new ol.Feature({
				geometry: circleGeom,
				memberType: _option.memberType,
				enableClick : false,
				_style : style,
				name: _option.name
			});

			if(_isShow){
				circleFeature.setStyle(style);
			}else{
				circleFeature.setStyle(this.noStyle);
			}

			// 添加到之前的创建的layer中去
			this.markerLayer.getSource().addFeature(circleFeature);

		},

		/**
		 * TODO 创建circle
		 */
		createCircleMarker: function(_option){
			return;

			_option.center =  new AMap.LngLat(_option.lon,_option.lat);
			//_option.radius = _option.radius;//3D视图下，CircleMarker半径不要超过64px
			_option.strokeWeight = 2;
			_option.strokeOpacity = 1;
			_option.fillOpacity = 0.4;
			_option.zIndex = 10;
			_option.bubble = true;
			_option.cursor = 'pointer';
			_option.clickable = true;
			var circleMarker = new AMap.CircleMarker(_option)

			circleMarker.memberId = _option.memberId;
			circleMarker.memberType = _option.memberType;
			circleMarker.markType = "circle";

			if(_option.url != undefined && _option.url != ""){
				circleMarker.on( 'click', function(e){
					window.open(_option.url);
				});
			}
			this.map.add(circleMarker);

		},

		/**
		 * TODO 更新mark 主要是位置和 label
		 */
		updateMark:function(_option){
			var _markers = this.map.getOverlays().getArray();
			var isNew = true;
			if (_markers){
				for (var i=0;i<_markers.length;i++){
					if (_markers[i].getOptions().memberType==_option.memberType
						&& _markers[i].getOptions().memberId==_option.memberId){
						_markers[i].setPosition([_option.lon,_option.lat]);
						_markers[i].setVisible(true);
						isNew = false;
						break;
					}
				}
			}

			if (isNew){
				if(_option.markType == 'circle'){
					this.createCircleMarker(_option);
				}else{
					this.createMark(_option);
				}

			}
		},
		/**
		 * 创建 mark  使用 Overlay
		 */
		createMark:function(_option){
			$("#" + this.el).append(_option.content);
			var _layerid = _option.memberType + "-" + _option.memberId;
			if (_option.offset == null){
				_option.offset = [-20,-25];
			}

			var marker = new ol.Overlay({
				id: _layerid,
				memberId : _option.memberId,
				memberType : _option.memberType,
				_options : _option,
				position: [_option.lon,_option.lat],
				positioning: 'center-center',
				element: document.getElementById(_layerid),
				stopEvent: true,
				offset:_option.offset,
			});

			this.map.addOverlay(marker);
			// 绑定点击事件
			if(_option.url != undefined && _option.url != ""){
				$("#"+_layerid).on( 'click', function(e){
					window.open(_option.url);
				});
			}
		},

		/**
		 * 按属性查找地图上图标
		 * @param key
		 * @param value
		 */
		getMarkerByAttr : function(key,value){

		},

		/**
		 * 清除地图上所有地物
		 */
		clearAll : function() {
			var that = this;
			this.lineLayer
				.getSource()
				.getFeatures()
				.forEach(function(feature) {
					that.lineLayer.getSource().removeFeature(feature);
				});
			this.map.getOverlays().clear();
		},

		colorRgba: function(sHex, alpha){
			alpha = alpha || 1;
			// 十六进制颜色值的正则表达式
			var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/
			/* 16进制颜色转为RGB格式 */
			var sColor = sHex.toLowerCase()
			if (sColor && reg.test(sColor)) {
				if (sColor.length === 4) {
					var sColorNew = '#'
					for (var i = 1; i < 4; i += 1) {
						sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1))
					}
					sColor = sColorNew;
				}
				//  处理六位的颜色值
				var sColorChange = []
				for (var i = 1; i < 7; i += 2) {
					sColorChange.push(parseInt('0x' + sColor.slice(i, i + 2)))
				}
				// return sColorChange.join(',')
				// 或
				return 'rgba(' + sColorChange.join(',') + ',' + alpha + ')'
			} else {
				return sColor
			}
		},

		/**
		 * 按 extent 定位
		 * @param {Object} extent  数组 [113.973488,22.522699,113.978882,22.528247]
		 */
		center2Extent:function(extent){
			if (extent instanceof Array){
				var _lon = (parseFloat(extent[0])  +parseFloat(extent[2])) / 2;
				var _lat = (parseFloat(extent[1]) + parseFloat(extent[3])) / 2;
				this.map.getView().setCenter([_lon,_lat]);
			}
		},
	};

	window.MapGD2D = MapGD2D;
})();

// 2020-5-12 edify
(function() {
	var  GPSTransformation = {
		x_PI: 3.14159265358979324 * 3000.0 / 180.0,
		PI : 3.1415926535897932384626,
		a : 6378245.0,
		ee : 0.00669342162296594323,
		/**
		 * 百度坐标系 (BD-09) 与 火星坐标系 (GCJ-02)的转换
		 * 即 百度 转 谷歌、高德
		 * @param bd_lon
		 * @param bd_lat
		 * @returns {*[]}
		 */
		bd09togcj02: function(bd_lon, bd_lat) {
			bd_lon=Number(bd_lon);
			bd_lat=Number(bd_lat);
			var x_pi = 3.14159265358979324 * 3000.0 / 180.0;
			var x = bd_lon - 0.0065;
			var y = bd_lat - 0.006;
			var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * x_pi);
			var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * x_pi);
			var gg_lng = z * Math.cos(theta);
			var gg_lat = z * Math.sin(theta);
			return [gg_lng, gg_lat]
		},
		/**
		 * 火星坐标系 (GCJ-02) 与百度坐标系 (BD-09) 的转换
		 * 即谷歌、高德 转 百度
		 * @param lng
		 * @param lat
		 * @returns {*[]}
		 */
		gcj02tobd09: function(lng, lat) {
			lng=Number(lng);
			lat=Number(lat);
			var z = Math.sqrt(lng * lng + lat * lat) + 0.00002 * Math.sin(lat * this.x_PI);
			var theta = Math.atan2(lat, lng) + 0.000003 * Math.cos(lng * this.x_PI);
			var bd_lng = z * Math.cos(theta) + 0.0065;
			var bd_lat = z * Math.sin(theta) + 0.006;
			return [bd_lng, bd_lat]
		},
		/**
		 * WGS84转GCj02
		 * @param lng
		 * @param lat
		 * @returns {*[]}
		 */
		wgs84togcj02: function(lng, lat) {
			lng=Number(lng);
			lat=Number(lat);
			if (this.out_of_china(lng, lat)) {
				return [lng, lat]
			} else {
				var dlat = this.transformlat(lng - 105.0, lat - 35.0);
				var dlng = this.transformlng(lng - 105.0, lat - 35.0);
				var radlat = lat / 180.0 * this.PI;
				var magic = Math.sin(radlat);
				magic = 1 - this.ee * magic * magic;
				var sqrtmagic = Math.sqrt(magic);
				dlat = (dlat * 180.0) / ((this.a * (1 - this.ee)) / (magic * sqrtmagic) * this.PI);
				dlng = (dlng * 180.0) / (this.a / sqrtmagic * Math.cos(radlat) * this.PI);
				var mglat = lat + dlat;
				var mglng = lng + dlng;
				return [mglng, mglat]
			}
		},
		/**
		 * GCJ02 转换为 WGS84
		 * @param lng
		 * @param lat
		 * @returns {*[]}
		 */
		gcj02towgs84: function(lng, lat) {
			lng=Number(lng);
			lat=Number(lat);
			if (this.out_of_china(lng, lat)) {
				return [lng, lat]
			} else {
				var dlat = this.transformlat(lng - 105.0, lat - 35.0);
				var dlng = this.transformlng(lng - 105.0, lat - 35.0);
				var radlat = lat / 180.0 * this.PI;
				var magic = Math.sin(radlat);
				magic = 1 - this.ee * magic * magic;
				var sqrtmagic = Math.sqrt(magic);
				dlat = (dlat * 180.0) / ((this.a * (1 - this.ee)) / (magic * sqrtmagic) * this.PI);
				dlng = (dlng * 180.0) / (this.a / sqrtmagic * Math.cos(radlat) * this.PI);
				var mglat = lat + dlat;
				var mglng = lng + dlng;
				return [lng * 2 - mglng, lat * 2 - mglat]
			}
		},

		transformlat: function(lng, lat) {
			var ret = -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat + 0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng));
			ret += (20.0 * Math.sin(6.0 * lng * this.PI) + 20.0 * Math.sin(2.0 * lng * this.PI)) * 2.0 / 3.0;
			ret += (20.0 * Math.sin(lat * this.PI) + 40.0 * Math.sin(lat / 3.0 * this.PI)) * 2.0 / 3.0;
			ret += (160.0 * Math.sin(lat / 12.0 * this.PI) + 320 * Math.sin(lat * this.PI / 30.0)) * 2.0 / 3.0;
			return ret
		},

		transformlng: function(lng, lat) {
			var ret = 300.0 + lng + 2.0 * lat + 0.1 * lng * lng + 0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng));
			ret += (20.0 * Math.sin(6.0 * lng * this.PI) + 20.0 * Math.sin(2.0 * lng * this.PI)) * 2.0 / 3.0;
			ret += (20.0 * Math.sin(lng * this.PI) + 40.0 * Math.sin(lng / 3.0 * this.PI)) * 2.0 / 3.0;
			ret += (150.0 * Math.sin(lng / 12.0 * this.PI) + 300.0 * Math.sin(lng / 30.0 * this.PI)) * 2.0 / 3.0;
			return ret
		},
		/**
		 * 判断是否在国内，不在国内则不做偏移
		 * @param lng
		 * @param lat
		 * @returns {boolean}
		 */
		out_of_china: function(lng, lat) {
			return (lng < 72.004 || lng > 137.8347) || ((lat < 0.8293 || lat > 55.8271) || false);
		}
	};
	window.GPSTransformation = GPSTransformation;
})();