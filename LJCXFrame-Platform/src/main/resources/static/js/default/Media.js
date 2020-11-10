/**
 * 视频加载  模块

 * @author 陶冶
 * @version 1.0 2019/12/3
 */
(function() {
	var oMedia = {
	    // 视频播放信息
		arrMediaOption : new Map(),

		// 视频直播容器
		livePlayer: new Map(),

		// 音视频播放容器
		videoPlayer: new Map(),

		/**
		 * 视频区UI切换
		 * @private
		 */
		_changeView:function(el,_count){
			var _wh = $(document).height();
			if (_count == 0){
				$(el).empty();
				$(el).fadeOut();
				$("#live_list_box").css("height","0px");
			}else if (_count == 1){
				$(el).fadeIn();
				$(el + " .vcp-player").css("width","480px");
				$(el + " .vcp-player").css("height","280px");
				/*$(el).css("width","720px");
				$(el).css("height","390px");

				$(el).children(".live_").css("width","720px");
				$(el).children(".live_").css("height","390px");

				$(el).children(".live_div_").css("width","720px");
				$(el).children(".live_div_").css("height","390px");

				$(el).children(".vcp-player").css("width","720px");
				$(el).children(".vcp-player").css("height","390px");

				$(el).children("video").css("width","720px");
				$(el).children("video").css("height","390px");*/

				// vcp-player video
			}else{
				$(el).fadeIn();
				$(el + " .vcp-player").css("width","240px");
				$(el + " .vcp-player").css("height","140px");
			}

			/*$(".message-box").animate({
					height:(_wh - 210) + "px",
					width:"481px"
				},300,function(){
					$(this).css({height:"calc(100vh - 210px)"})
				});*/
		},


        addMediaOpt: function(key,value) {
			this.arrMediaOption.set(key,value);
			//高亮播放图标
			if (key.indexOf('plane_') > -1){
				$("#tmpl_" + key + " .video").attr("src","../static/images/list-video-play.png");
			}
		},

		/**
		 * TODO 播放手机音视频通话
		 * @param key man_id
		 * @param data  音视频通话配置
		 */
		playMediaOfMobile : function(key,data){

			var that = this;
			// 防止本地摄像头 开启多次
			if (this.videoPlayer.get(data.roomId) != null){
			    return;
            }
			var _element = $("#" + key);
			if (_element.length > 0){  // 如果在播放 video_div_plane_10
				return;
			}

			// TRTC 对象
			var rtc = new RtcClient({
				el: "video_list_box",
				userId: data.username,
				roomId: data.roomId,
				sdkAppId: 1400285528,
				userSig: data.userSign,
				// audio: data.audio,
				// video: data.video,
			});
			rtc.join();
			this.videoPlayer.set(data.roomId,rtc);

			$("#video_list_box").css("height","280px");
			$("#video_list_box").fadeIn();

			// leave()
			// 绑定视频的关闭按钮 destroy fullscreen
			// $("#video_list_box #videoClose").off('click').on('click',function () {
			$(document).on('click',"#videoClose", function (e) {
				oMedia.videoPlayer.get(data.roomId).leave(); //player.destroy();
				oMedia.videoPlayer.delete(data.roomId);

				$("#video_list_box").fadeOut();
				$("#video_list_box").empty();
				$("#video_list_box").css("height","0px");

				/*if(oMedia.livePlayer.size+oMedia.videoPlayer.size == 0){
					$(".wrapper_left_box").addClass("hide");
				}*/
			});
			// if(data.audio){
			// 	$("#video_list_box .audio").addClass('on').removeClass('off');
			// }else{
			// 	$("#video_list_box .audio").addClass('off').removeClass('on');
			// }
			// 绑定视频的声音和视频 audio
			// $("#videoFullScreen").off('click').on('click',function () {
			$(document).on('click',"#videoAudio", function (e) {
				if($(this).hasClass('yuyin-off')){
					//oMedia.videoPlayer.get(data.roomId).muteLocalVideo();
					oMedia.videoPlayer.get(data.roomId).muteLocalAudio();
					$(this).removeClass('yuyin-off');
				}else{
					//oMedia.videoPlayer.get(data.roomId).unmuteLocalVideo();
					oMedia.videoPlayer.get(data.roomId).unmuteLocalAudio();
					$(this).addClass('yuyin-off');
				}
				//unpublish
				//rtc.muteLocalAudio(); rtc.muteLocalVideo();
			});
		},

		/**
		 * 随机数
		 * @param len
		 * @returns {string}
		 * @private _randomString(6)
		 */
		_randomString : function(len){
			len = len || 32;
			var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';    /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
			var maxPos = $chars.length;
			var pwd = '';
			for (i = 0; i < len; i++) {
				pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
			}
			return pwd;
		},

		/**
		 * 播放无人机推流视频
		 * @param key man_id  plane_id  eg:man_2 plane_10
		 */
		playMedia:function (key) {

			// 获取视频播放配置信息
			var _playOpt = this.arrMediaOption.get(key);
			_playOpt.key = key;

			//20200827
			// var steaming = false;
			// var i = 1;
			// while(!steaming || i >= 5){
			// 	setTimeout(
			// 		$.ajax({
			// 		type : 'POST',
			// 		dataType : "json",
			// 		url : oIndex.url.getChannels,
			// 		data : JSON.stringify({"channel":_playOpt.channel,"limit":1}),
			// 		contentType : "application/json; charset=utf-8",
			// 		cache : false,
			// 		async : false,
			// 		success : function(res) {
			// 			if (res.code == 200) {
			// 				if (res.code == 200) {
			// 					var _data = res.data;
			// 					steaming = _data.Streaming;
			// 					if (!_data.Streaming) {
			// 						layer.msg("通道正在开启推流，请稍后再试");
			// 					} else {
			// 						layer.msg("通道推流成功");
			// 					}
			// 				}
			// 			}},
			// 	}), 500);
			// 	i++;
			// }


			//设置div高度
			$("#live_list_box").css("height","280px");
			var _element = $("#live_div_" + key);
			if (_element.length > 0){  // 如果正在播放 live_div_plane_10
				return;
			}
			// 创建一个新的容器ID
			var _el = "live_" + this._randomString(6);
			$('<div>', { id: _el , class: "live_", style : 'overflow: hidden;'}).appendTo("#live_list_box");
			$('<div>', { id: "live_div_" + key , class: "live_div_" }).appendTo("#" + _el);
			$('<video>', { id: "live_video_" + key , class: "live_div_" }).appendTo("#live_div_" + key);
			$("#live_video_" + key).attr("controls","true");


			// 视频 全屏 和 关闭 按钮
			//'live_div_' + key
			//$("#" + _el).append('<div class="video-title">'
			$("#live_div_" + key).append('<div class="video-title">'
				+'<span>'+_playOpt.name+'</span>'
				+'<a class="close"></a>'
				//+'<a class="fullscreen"></a>'
				+'</div>');

			var _w = $("#live_div_" + key)[0].offsetWidth;
			var _h = $("#live_div_" + key)[0].offsetHeight;

			// http://example.com[:port]/dir?[port=xxx&]app=appname&stream=streamname
			if (flvjs.isSupported()) {
				var videoElement = document.getElementById("live_video_" + key);
				var flvPlayer = flvjs.createPlayer({
					type: 'flv',
					isLive: true,
					hasAudio: false,
					hasVideo: true,
					enableWorker: true,    //浏览器端开启flv.js的worker,多进程运行flv.js
					enableStashBuffer: false,   //播放flv时，设置是否启用播放缓存，只在直播起作用。
					stashInitialSize: 256,
					url: _playOpt.rtmp
				});
				flvPlayer.attachMediaElement(videoElement);
				flvPlayer.load(); //加载
				flvPlayer.play();
				// 播放对象加入map  key: live_1  val : player
				this.livePlayer.set(_el , flvPlayer);
			}

			this._changeView("#live_list_box",this.livePlayer.size);

			var that = this;
			// 绑定视频的关闭按钮 destroy fullscreen
			$("#" + _el + " .close").off('click').on('click',function () {
				// var player = $("#" + _el+" video");
				// player.pause();
				// player.unload();
				// player.detachMediaElement();
				// player.destroy();
				// player = null;
				oMedia.livePlayer.get(_el).destroy(); //player.destroy();
				oMedia.livePlayer.delete(_el);
				$("#" + _el).remove();

				that._changeView("#live_list_box",oMedia.livePlayer.size);
			});

			// 绑定视频的fullscreen
			$("#" + _el + " .fullscreen").off('click').on('click',function () {
				/*var _player = oMedia.livePlayer.get(_el);
				_player.width = "720px";
				_player.height = "380px";*/

				oMedia.livePlayer.get(_el).fullscreen(true); //player.destroy();
			});
			
		},

		/**
		 * 按 el 查找 播放器对象
		 * @param el  元素id   live_1   video_2
		 * @param players  this.livePlayer  this.videoPlayer
		 * @private
		 */
		_getPlayer : function(el, players){

			for (var i=0;i<players.length;i++){
				if (el == players[i].id){

				}
			}

		},

		/**
		 * TODO 关闭视频窗口，清除Player
		 * @param key
		 * @param value
		 */
		closeMedia:function (key,value) {
			var _parent = $("#live_div_" + key).parent();
			if (_parent.length > 0){
				var _el = $(_parent).attr("id");
				oMedia.livePlayer.get(_el).destroy(); //player.destroy();
				oMedia.livePlayer.delete(_el);

				$("#" + _el).remove();

				this._changeView();
			}

		},

		/**
		 * TODO 关闭播放按钮，清除URL，关闭视频窗口，清除Player
		 * @param key
		 * @param value
		 */
        removeMediaOpt:function (key,value) {
			this.arrMediaOption.delete(key); //视频信息移除

			if($("#tmpl_" + key + " .video").attr("src").indexOf('off.png') == -1){
				$("#tmpl_" + key + " .video").attr("src","../static/images/list-video-on.png");
				$("#tmpl_" + key + " .video").attr("data-key","");
				// 无人机 视频播放
				$("#tmpl_" + key).off("click");
			}
			this.closeMedia(key,value);
		}

	};

	window.oMedia = oMedia;

})();
