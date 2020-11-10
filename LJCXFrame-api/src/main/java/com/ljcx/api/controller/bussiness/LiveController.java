package com.ljcx.api.controller.bussiness;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.ljcx.api.beans.TeamInfoBean;
import com.ljcx.api.beans.UavInfoBean;
import com.ljcx.api.dto.CallDto;
import com.ljcx.api.dto.LiveDto;
import com.ljcx.api.dto.RoomUserDto;
import com.ljcx.api.service.TeamInfoService;
import com.ljcx.api.service.UavInfoService;
import com.ljcx.api.shiro.jwt.JwtUtils;
import com.ljcx.api.shiro.util.UserUtil;
import com.ljcx.common.constant.RedisConstant;
import com.ljcx.common.utils.ResponseInfo;
import com.ljcx.common.utils.StringUtils;
import com.ljcx.common.utils.security.Md5Utils;
import com.ljcx.framework.activemq.ActivemqProducer;
import com.ljcx.framework.annotations.ValidateCustom;
import com.ljcx.framework.live.common.profile.AppProfile;
import com.ljcx.framework.live.common.profile.HttpProfile;
import com.ljcx.framework.live.common.profile.LiveProfile;
import com.ljcx.framework.live.livenvr.LiveNVRUrl;
import com.ljcx.framework.live.tencent.LiveUtil;
import com.ljcx.user.beans.UserBaseBean;
import com.ljcx.user.constants.UserConstants;
import com.ljcx.user.service.UserAccountService;
import com.ljcx.user.service.UserBaseService;
import com.ljcx.user.vo.MemberVo;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import javax.servlet.http.HttpServletRequest;
import java.util.*;
import java.util.concurrent.TimeUnit;


/**
 * 直播controller
 */
@RestController
@RequestMapping("/live")
@Slf4j
public class LiveController {

    @Autowired
    private ActivemqProducer producer;

    @Autowired
    private UserBaseService userBaseService;

    @Autowired
    private UavInfoService uavInfoService;

    @Autowired
    private RedisTemplate redisTemplate;

    @Autowired
    private TeamInfoService teamInfoService;


    /**
     * 获取推流地址和播放地址
     * @return
     */
    @PostMapping("/getPushAddress")
    @ValidateCustom(LiveDto.class)
    public ResponseInfo getPushAddress(@RequestBody String info) {
        LiveDto liveDto = JSONObject.parseObject(info, LiveDto.class);
        UavInfoBean uav = uavInfoService.getById(liveDto.getId());
        RestTemplate client = new RestTemplate();
        String url = HttpProfile.REQ_HTTP+ LiveProfile.INTER_DOMAIN+ LiveNVRUrl.GET_CHANNELS;
        JSONObject result = client.getForEntity(url, JSONObject.class).getBody();
        JSONObject liveQing = result.getJSONObject("LiveQing");
        JSONObject body = liveQing.getJSONObject("Body");
        JSONArray channels = body.getJSONArray("Channels");
        for(int i =0;i<channels.size();i++){
            JSONObject chanel = (JSONObject) channels.get(i);
            if(chanel.getInteger("Online") == 0 && chanel.getInteger("Channel") > 5){
                liveDto.setStreamName(chanel.getString("Channel"));
                redisTemplate.opsForSet().add("Channel",chanel.getString("Channel"));
                break;
            }
        }

        if(liveDto.getStreamName() == null){
            String[] channelStr = new String[] {"6","7","8","9","10"};
            Set<String> channel = redisTemplate.opsForSet().difference("Channel", Arrays.asList(channelStr));
            if(channel.size() > 0){
                liveDto.setStreamName((String) channel.toArray()[0]);
            }
        }

        liveDto.setName(uav.getName());
        liveDto.setAction("play");
        //将播放地址存入redis
        redisTemplate.opsForValue().set(RedisConstant.UAV_LIVE_STATE_ +liveDto.getId(),JSONObject.toJSONString(liveDto),1800, TimeUnit.SECONDS);
        //将播放地址广播出去
        producer.sendTopic("topic_live_room",JSONObject.toJSONString(liveDto));
        return new ResponseInfo(liveDto.getPushAddress());
    }



    /**
     * 获取用户签名和房间号
     * @return
     */
    @PostMapping("/getRoomAndUserSign")
    @ValidateCustom(CallDto.class)
    public ResponseInfo getRoomAndUserSign(@RequestBody String info, HttpServletRequest request) {
        CallDto callDto = JSONObject.parseObject(info, CallDto.class);
        TeamInfoBean teamBean = teamInfoService.getById(callDto.getTeamId());
        List<RoomUserDto> roomUserList = new ArrayList<>();
        long callingUserId = JwtUtils.getUserId(request.getHeader(UserConstants.TOKEN));
        UserBaseBean callingUser = userBaseService.getById(callingUserId);
        String callingUserName = callingUser.getUsername();
        String callingNickName = callingUser.getNickname();
        CallDto resp = getCalledUser(callingUserId,callingUserName,callingNickName,callDto.getIsFail(),callingUserId,teamBean.getRoomId(),callDto.getType());
        resp.setTeamId(teamBean.getId());
        //发送消息给接收对象
        if(callDto.getType() == 1){
            //calledId 可能为多个用户id
            List<CallDto> callDtoList = new ArrayList<>();
            //添加发起者信息
            roomUserList.add(new RoomUserDto(callingUserId, callingUserName));
            for(int i = 0;i<callDto.getCalledId().length;i++){
                CallDto calledUserDto = getCalledUser(callingUserId,callingUserName,callingNickName,callDto.getIsFail(),callDto.getCalledId()[i],teamBean.getRoomId(),callDto.getType());
                RoomUserDto calledRommUser = new RoomUserDto(calledUserDto.getUserId(),calledUserDto.getUserName());
                roomUserList.add(calledRommUser);
                callDtoList.add(calledUserDto);
            }
            for(CallDto item:callDtoList){
                item.setRoomUserList(roomUserList);
                producer.sendTopic("topic_call_member",JSONObject.toJSONString(item));
            }
        }else{
            List<MemberVo> baseBeanList = userBaseService.listByTeamId(callDto.getTeamId());
            List<CallDto> callDtoList = new ArrayList<>();
            for(MemberVo item:baseBeanList){
                CallDto calledUserDto = getCalledUser(callingUserId,callingUserName,callingNickName,callDto.getIsFail(),item.getId(),teamBean.getRoomId(),callDto.getType());
                RoomUserDto calledRommUser = new RoomUserDto(calledUserDto.getUserId(),calledUserDto.getUserName());
                roomUserList.add(calledRommUser);
                callDtoList.add(calledUserDto);
            }
            for(CallDto item:callDtoList){
                item.setRoomUserList(roomUserList);
                producer.sendTopic("topic_call_member",JSONObject.toJSONString(item));
            }
        }
        resp.setRoomUserList(roomUserList);
        return new ResponseInfo(resp);
    }

    @SuppressWarnings("all")
    private UserBaseBean getUserSign(Integer isFail,Long userId){
        UserBaseBean baseBean = userBaseService.getById(userId);
        //判断签名是否为空并且是否过期
        if(isFail == 1
                || StringUtils.isEmpty(baseBean.getUserSig())
                || System.currentTimeMillis() > baseBean.getSignExpireTime().getTime()){
            String sign = LiveUtil.genSig(baseBean.getUsername());
            baseBean.setUserSig(sign);
            baseBean.setSignExpireTime(new Date(System.currentTimeMillis()+ AppProfile.SIGN_EXPIRE_TIME*1000));
            userBaseService.updateById(baseBean);
        }
        return baseBean;
    }

    private CallDto getCalledUser(Long callingUserId,String callingUserName,String callingNickName,Integer isFail,Long userId,Integer roomId,Integer type){
        CallDto callDto = new CallDto();
        UserBaseBean baseBean = getUserSign(isFail, userId);
        //返回签名对象给api
        callDto.setCallingUser(callingUserId);
        callDto.setCallingName(callingUserName);
        callDto.setCallingNickName(callingNickName);
        callDto.setUserId(baseBean.getId());
        callDto.setUserSign(baseBean.getUserSig());
        callDto.setUserName(baseBean.getUsername());
        callDto.setRoomId(roomId);
        callDto.setType(type);
        callDto.setIsFail(isFail);
        return callDto;
    }

    /**
     * 解散房间
     * @return
     */
    @PostMapping("/dissolveRoom")
    public ResponseInfo dissolveRoom(@RequestBody String info) {
        JSONObject jsonObject = JSONObject.parseObject(info);
        if(info == null || jsonObject.getLong("roomId") == null){
            return new ResponseInfo().failed("房间号不能为空");
        }
        Long roomId = jsonObject.getLong("roomId");
        return new ResponseInfo(LiveUtil.dissolveRoom(roomId));
    }

    /**
     * 开启录像
     * @return
     */
    @PostMapping("/record")
    public ResponseInfo record(@RequestBody String info, HttpServletRequest request) {
        JSONObject jsonObject = JSONObject.parseObject(info);
        if(jsonObject == null || jsonObject.getInteger("channel") == null){
            return new ResponseInfo().failed("通道信息不能为空");
        }
        RestTemplate client = new RestTemplate();
        Long userId = JwtUtils.getUserId(request.getHeader(UserConstants.TOKEN));
        //登录获取LiveNVR Token
        loginLiveNvr(userId);
        String liveUrl;
        //拼接录屏接口链接
        if(("off").equals(jsonObject.getString("action"))){
            liveUrl = getLiveUrl(LiveNVRUrl.STOP_RECORD, jsonObject, userId);
        }else{
            liveUrl = getLiveUrl(LiveNVRUrl.START_RECORD, jsonObject, userId);
        }

        JSONObject result = client.getForEntity(liveUrl, JSONObject.class).getBody();
        return new ResponseInfo(result);
    }

    /**
     * 查询录像
     * @return
     */
    @PostMapping("/searhRecord")
    public ResponseInfo searhRecord(@RequestBody String info, HttpServletRequest request) {
        JSONObject jsonObject = JSONObject.parseObject(info);
        RestTemplate client = new RestTemplate();
        Long userId = JwtUtils.getUserId(request.getHeader(UserConstants.TOKEN));
        //登录获取LiveNVR Token
        loginLiveNvr(userId);
        String liveUrl;
        //拼接录屏接口链接
        liveUrl = getLiveUrl(LiveNVRUrl.QUERY_DEVICES, jsonObject, userId);
        JSONObject result = client.getForEntity(liveUrl, JSONObject.class).getBody();
        return new ResponseInfo(result);
    }


    // LiveNVR登录方法
    private  void loginLiveNvr(Long userId){
        String url = HttpProfile.REQ_HTTP+ LiveProfile.INTER_DOMAIN+ LiveNVRUrl.LOGIN+"?username=admin&password="+Md5Utils.hash("admin");
        log.info("loginurl ===>,{}",url);
        RestTemplate client = new RestTemplate();
        JSONObject result = client.getForEntity(url, JSONObject.class).getBody();
        log.info("ddddmmmmmmmmmm="+result);
        JSONObject liveQing = result.getJSONObject("LiveQing");
        JSONObject body = liveQing.getJSONObject("Body");
        String Token = body.getString("URLToken");
        redisTemplate.opsForValue().set(LiveNVRUrl.LIVE_ADMIN + userId,Token);
    }

    // 拼接请求链接
    private String getLiveUrl(String method, JSONObject jsonObject, Long userId){
        Object token = redisTemplate.opsForValue().get(LiveNVRUrl.LIVE_ADMIN + userId);
        if(token == null){
            return "";
        }
        String url = HttpProfile.REQ_HTTP+ LiveProfile.INTER_DOMAIN+ method+"?token="+token;
        if(jsonObject != null){
            if(jsonObject.getInteger("channel") != null){
                url += "&channel="+jsonObject.getInteger("channel");
            }
            if(jsonObject.getInteger("duration") != null){
                url += "&duration="+jsonObject.getInteger("duration");
            }
            if(jsonObject.getInteger("savedays") != null){
                url += "&savedays="+jsonObject.getInteger("savedays");
            }
            if(jsonObject.getInteger("start") != null){
                url += "&start="+jsonObject.getInteger("start");
            }
            if(jsonObject.getInteger("q") != null){
                url += "&q="+jsonObject.getString("q");
            }
        }

        return url;
    }







}
