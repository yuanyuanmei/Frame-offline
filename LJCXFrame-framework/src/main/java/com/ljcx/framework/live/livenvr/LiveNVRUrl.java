package com.ljcx.framework.live.livenvr;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.PropertySource;
import org.springframework.stereotype.Component;

/**
 * liveNVR接口
 */
public class LiveNVRUrl {

    /**
     * 账号
     */
    public static final String LIVE_ADMIN = "live_admin_";

    /**
     * 登录
     */
    public static final String LOGIN = "/api/v1/login";

    /**
     * 登出
     */
    public static final String LOGOUT = "/api/v1/logout";

    /**
     * 获取通道列表
     */
    public static final String GET_CHANNELS = "/api/v1/getchannels";

    /**
     * 开启录制
     */
    public static final String START_RECORD = "/api/v1/startrecord";

    /**
     * 结束录制
     */
    public static final String STOP_RECORD = "/api/v1/stoprecord";

    /**
     * 查询录制
     */
    public static final String QUERY_DEVICES = "/api/v1/record/querydevices";



}
