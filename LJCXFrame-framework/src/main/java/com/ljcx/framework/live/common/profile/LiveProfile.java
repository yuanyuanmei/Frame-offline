package com.ljcx.framework.live.common.profile;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.PropertySource;
import org.springframework.stereotype.Component;

/**
 * 直播常量
 */
@Component
@PropertySource("classpath:live.properties")
public class LiveProfile {

    /**
     * 推流域名
     */
    public static String PUSH_DOMAIN;

    /**
     * 推流域名别名
     */
    public static String PUSH_CNAME;

    /**
     * 推流key
     */
    public static String PUSH_KEY;

    /**
     * 播放域名
     */
    public static String PLAY_DOMAIN;

    /**
     * 接口域名
     */
    public static String INTER_DOMAIN;

    /**
     * 播放域名别名
     */
    public static String PLAY_CNAME;

    /**
     * 播放key
     */
    public static String PLAY_KEY;

    /**
     * 过期时间
     */
    public static final long EXPIRE_TIME = 2*60*60*1000;

    public static final String APP_NAME = "/live";

    public static final String SUFFIX_FLV = ".flv";

    public static final String SUFFIX_HLS = ".m3u8";


    @Value("${push_domain}")
    public void setPushDomain(String pushDomain) {
        this.PUSH_DOMAIN = pushDomain;
    }

//    @Value("${push_cname}")
//    public void setPushCname(String pushCname) {
//        this.PUSH_CNAME = pushCname;
//    }
//
//    @Value("${push_key}")
//    public void setPushKey(String pushKey) {
//        this.PUSH_KEY = pushKey;
//    }

    @Value("${play_domain}")
    public void setPlayDomain(String playDomain) {
        this.PLAY_DOMAIN = playDomain;
    }

    @Value("${inter_domain}")
    public void setInterDomain(String interDomain) {
        this.INTER_DOMAIN = interDomain;
    }
//    @Value("${play_cname}")
//    public void setPlayCname(String playCname) {
//        this.PLAY_CNAME = playCname;
//    }
//
//    @Value("${play_key}")
//    public void setPlayKey(String playKey) {
//        this.PLAY_KEY = playKey;
//    }
}
