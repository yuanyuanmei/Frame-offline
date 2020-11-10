/**
 * 百度鹰眼巡逻轨迹业务模块
 * @author 陶冶
 * @version 1.0 2018/4/25
 */
var current_line=null;

(function() {
    var oTrack = {
        isTrack:false,
        index:null,//记录播放到第几个point
        points:null,//坐标点数据
        timejson:[],//时间数据
        trackLine:null,//时间轴对象
        isPlay:false,
        planeId:0,
        recordsId:0,
        map: null,

        animating: false,
        planeStyle : new ol.style.Style({
            image: new ol.style.Icon({ //边界样式
                // anchor: [0.5,1],
                src: "../static/images/marker/icon_plane.png"
            })
        }),

        flyingStyle : new ol.style.Style({
            image: new ol.style.Icon({ //边界样式
                src: "../static/images/marker/icon_plane.png"
            }),
            text: new ol.style.Text({
                textAlign: 'center', // 对其方式
                textBaseline: 'middle', // 基准线
                offsetY: -30,
                font: 'normal 16px Calibri,sans-serif', // 文字样式
                text: "", // 文本内容
                fill: new ol.style.Fill({
                    color: '#ff5d56' // 文本填充样式
                }),
                padding: [5, 5, 5, 5],
                backgroundStroke:new ol.style.Stroke({
                    color:'#4D98DD', //标签的边框
                    width:1
                }),
                //标签的背景填充
                backgroundFill:new ol.style.Fill({
                    color:'#4D98DD'
                    // color: 'rgba(255,250,138,0.6)'
                })
            })
        }),

        // 初始化地图
        init : function(val){
            if (this.map == null){
                MapGD2D.createMap({el:"routeMap", zoom:15},function(){
                    // 监听加载状态改变
                });
                MapGD2D.toggleBaseLayer("vec");
                this.map = MapGD2D.map;
                this.map.on('pointermove', function() {

                });
                oTrack.getTrack(val);
            }
        },

        /*通过终端name 得到轨迹*/
        getTrack:function (val){
            if(val.length == 0){
                layer.msg("未查询到轨迹数据");
                return;
            }

            oTrack.points = [];
            oTrack.timejson=[];
            this.isTrack=true;

            // 创建轨迹线
            for(var i=0;i<val.length;i++){
                var points = val[i].position;
                var gcpoints = GPSTransformation.wgs84togcj02(points.split(",")[0],points.split(",")[1]);
                oTrack.points.push(gcpoints);
                oTrack.timejson.push("高度："+ val[i].high +"米 | 速度："+ val[i].speed +"米/秒 | 电量："+ val[i].electricity +"%");
            }

            //添加时间轴

            if(oTrack.points.length > 0){
                $("#xlgjdiv").show();
                //oTrack.trackElent();
                oTrack.planeId = val[0].uavId;
                oTrack.recordsId = val[0].recordsId;

                //添加起始点
                var content = '<div id="custom-1000" class="mark-custom">' +
                    '<div class="mark-icon"><img src="../static/images/marker/icon_start.png" style="transform: scale(0.75)"></div>' +
                    '</div>';

                MapGD2D.updateMark({
                    lon:oTrack.points[0][0],
                    lat:oTrack.points[0][1],
                    memberId: 1000,
                    memberType: "custom",
                    name: "start",
                    content:content,
                    url: "",
                });

                //添加终止点
                var content = '<div id="custom-9999" class="mark-custom">' +
                    '<div class="mark-icon"><img src="../static/images/marker/icon_end.png" style="transform: scale(0.75)"></div>' +
                    '</div>';

                MapGD2D.updateMark({
                    lon:oTrack.points[oTrack.points.length-1][0],
                    lat:oTrack.points[oTrack.points.length-1][1],
                    memberId: 9999,
                    memberType: "custom",
                    name: "end",
                    content:content,
                    url: "",
                });

                //飞机
                /*var content = '<div id="custom-'+ oTrack.planeId +'"  class="mark-custom">' +
                    '<div class="mark-icon"><img src="../static/images/marker/icon_plane.png" style="transform: scale(0.8)"></div>' +
                    '</div>';

                MapGD2D.updateMark({
                    lon:oTrack.points[0][0],
                    lat:oTrack.points[0][1],
                    memberId: oTrack.planeId,
                    memberType: "custom",
                    name: "plane",
                    content:content,
                    url: "",
                    offset:[-16,-16]
                });*/

                oTrack.planeFeature = new ol.Feature({
                    geometry: new ol.geom.Point([oTrack.points[0][0],oTrack.points[0][1]]),
                    memberType: "custom"
                });
                oTrack.planeFeature.setStyle(oTrack.planeStyle);
                MapGD2D.lineLayer.getSource().addFeature(oTrack.planeFeature);
                MapGD2D.lineLayer.setZIndex(999);

                //画线
                MapGD2D.createLine({
                    vertices: oTrack.points,
                    memberType:"flyLine",
                    color:"#28F",
                    strokeWidth:5,
                    flyLineId:oTrack.recordsId,
                    name:"测试线"
                },true);

                //等比例缩放
                MapGD2D.map.getView().fit(MapGD2D.lineLayer.getSource().getExtent(),MapGD2D.map.getSize());
            }else{
                // 清除 时间轴
                MapGD2D.map.setCenterAndZoom([],15);
                $("#xlgjdiv").hide();
            }
        },

        //播放轨迹
        startAnimation:function(){
            if (oTrack.animating) {
                oTrack.stopAnimation(false);
            } else {
                oTrack.animating = true;
                oTrack.now = new Date().getTime();
                oTrack.speed = 1;

                $("#playBox").html("停止");
                //startButton.textContent = 'Cancel Animation';
                // hide geoMarker
                oTrack.planeFeature.setStyle(null);

                MapGD2D.lineLayer.on('postrender', oTrack.moveFeature);
                MapGD2D.map.render();
            }
        },

        stopAnimation : function(ended){
            oTrack.animating = false;

            $("#playBox").html("回放");
            //startButton.textContent = 'Start Animation';

            // if animation cancelled set the marker at the beginning
            var coord = ended ? oTrack.points[oTrack.points.length - 1] : oTrack.points[0];
            var geometry = oTrack.planeFeature.getGeometry();
            geometry.setCoordinates(coord);
            oTrack.planeFeature.setStyle(oTrack.planeStyle);
            //remove listener
            MapGD2D.lineLayer.un('postrender', oTrack.moveFeature);
        },

        moveFeature: function(event){
            var vectorContext = ol.render.getVectorContext(event);
            var frameState = event.frameState;

            if (oTrack.animating) {
                var elapsedTime = frameState.time - oTrack.now;
                // here the trick to increase speed is to jump some indexes
                // on lineString coordinates
                var index = Math.round((oTrack.speed * elapsedTime) / 1000);

                if (index >= oTrack.points.length) {
                    oTrack.stopAnimation(true);
                    return;
                }

                var currentPoint = new ol.geom.Point(oTrack.points[index]);
                var feature = new ol.Feature(currentPoint);

                oTrack.flyingStyle.getText().setText(oTrack.timejson[index]);
                // oTrack.flyingStyle.getText().getBackgroundFill().setColor("#FFF");
                vectorContext.drawFeature(feature, oTrack.flyingStyle);
            }
            // tell OpenLayers to continue the postrender animation
            MapGD2D.map.render();
        },

    };

    window.oTrack = oTrack;
})();





