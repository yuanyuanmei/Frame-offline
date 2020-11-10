package com.ljcx.platform.controller.bussiness;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.ljcx.common.constant.RedisConstant;
import com.ljcx.framework.activemq.ActivemqProducer;
import com.ljcx.framework.annotations.ValidateCustom;
import com.ljcx.framework.live.common.profile.HttpProfile;
import com.ljcx.framework.live.common.profile.LiveProfile;
import com.ljcx.framework.live.livenvr.LiveNVRUrl;
import com.ljcx.platform.beans.UavInfoBean;
import com.ljcx.platform.beans.mongo.UavInfoMongo;
import com.ljcx.platform.dto.ChannelDto;
import com.ljcx.platform.dto.LiveDto;
import com.ljcx.platform.dto.UavInfoDto;
import com.ljcx.platform.service.UavInfoService;
import com.ljcx.common.utils.ResponseInfo;
import com.ljcx.framework.sys.service.IGenerator;
import io.swagger.annotations.Api;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.math.NumberUtils;
import org.apache.shiro.authz.annotation.RequiresPermissions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.util.Arrays;
import java.util.Objects;
import java.util.Random;
import java.util.Set;
import java.util.concurrent.TimeUnit;


/**
 * 无人机controller
 */
@Api(value = "无人机模块")
@RestController
@RequestMapping("/team/uav")
@Slf4j
public class UavInfoController {

    @Autowired
    private IGenerator generator;

    @Autowired
    private UavInfoService uavInfoService;

    @Autowired
    private RedisTemplate<String, String> redisTemplate;

    @Autowired
    private ActivemqProducer producer;

    @PostMapping("/pageList")
    public ResponseInfo pageList(@RequestBody String info) {
        UavInfoDto uavInfoDto = JSONObject.parseObject(info, UavInfoDto.class);
        return new ResponseInfo(uavInfoService.pageList(uavInfoDto));
    }

    /**
     * 获取无人机状态
     * @param info
     * info(uavInfoDto 对象)
     * @return
     */
    @PostMapping("/getState")
    //@RequiresPermissions("team:equipment:query")
    public ResponseInfo getState(@RequestBody String info) {
        JSONObject jsonObject = JSONObject.parseObject(info);
        if(jsonObject == null || jsonObject.getLong("teamId") == null){
            return new ResponseInfo().failed("团队Id不能为空");
        }
        return uavInfoService.getState(jsonObject.getLong("teamId"));
    }

    /**
     * 获取推流地址和播放地址
     * @return
     */
    @PostMapping("/getPushAddress")
    @ValidateCustom(LiveDto.class)
    public ResponseInfo getPushAddress(@RequestBody String info) {
        LiveDto liveDto = JSONObject.parseObject(info, LiveDto.class);
        UavInfoBean uav = uavInfoService.getById(liveDto.getId());
        Random random = new Random();
        RestTemplate client = new RestTemplate();
        String url = HttpProfile.REQ_HTTP+ LiveProfile.INTER_DOMAIN+ LiveNVRUrl.GET_CHANNELS;
        JSONObject result = client.getForEntity(url, JSONObject.class).getBody();
        JSONObject liveQing = result.getJSONObject("LiveQing");
        JSONObject body = liveQing.getJSONObject("Body");
        JSONArray channels = body.getJSONArray("Channels");
        for(int i =0;i<channels.size();i++){
            JSONObject chanel = (JSONObject) channels.get(i);
            if(chanel.getInteger("Online") == 0 &&  chanel.getInteger("Channel") > 5){
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
        return new ResponseInfo(liveDto);
    }
    /**
     * 获取通道信息
     * @return
     */
    @PostMapping("/getChannels")
    @ValidateCustom(ChannelDto.class)
    public ResponseInfo getChannels(@RequestBody String info) {
        ChannelDto channelDto = JSONObject.parseObject(info, ChannelDto.class);
        RestTemplate client = new RestTemplate();
        String url = HttpProfile.REQ_HTTP+ LiveProfile.INTER_DOMAIN+ LiveNVRUrl.GET_CHANNELS+"?1=1";
        if(!Objects.isNull(channelDto.getChannel())){
            url += "&channel="+channelDto.getChannel();
        }
        if(!Objects.isNull(channelDto.getLimit())){
            url += "&limit="+channelDto.getLimit();
        }
        JSONObject result = client.getForEntity(url, JSONObject.class).getBody();
        JSONObject liveQing = result.getJSONObject("LiveQing");
        JSONObject body = liveQing.getJSONObject("Body");
        JSONArray channels = body.getJSONArray("Channels");
        return new ResponseInfo(channels.get(0));
    }

    /**
     * 飞机面板
     * @return
     */
    @PostMapping("/planPanel")
    @ValidateCustom(UavInfoDto.class)
    public ResponseInfo planPanel(@RequestBody String info) {
        UavInfoDto uavInfoDto = JSONObject.parseObject(info, UavInfoDto.class);
        return new ResponseInfo(uavInfoService.planPanel(uavInfoDto));
    }

    /**
     * 飞行路线
     * @return
     */
    @PostMapping("/findRoutes")
    public ResponseInfo findRoutes(@RequestBody String info) {
        UavInfoMongo uavInfoMongo = JSONObject.parseObject(info, UavInfoMongo.class);
        return uavInfoService.findRoutes(uavInfoMongo);
    }


}
