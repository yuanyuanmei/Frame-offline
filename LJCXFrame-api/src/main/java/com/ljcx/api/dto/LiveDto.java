package com.ljcx.api.dto;

import com.ljcx.framework.live.common.profile.HttpProfile;
import com.ljcx.framework.live.common.profile.LiveProfile;
import com.ljcx.framework.live.tencent.LiveUtil;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import javax.validation.constraints.NotNull;
import java.io.Serializable;

@Data
@ToString
@AllArgsConstructor
@NoArgsConstructor
@NotNull(message = "直播信息不能为空")
public class LiveDto implements Serializable {

    private static final long serialVersionUID = 4043470238789599973L;


    @NotNull(message = "id不能为空")
    private Long id;

    /**
     * 团队Id
     */
    @NotNull(message = "团队Id不能为空")
    private Long teamId;

    private String name;

    /**
     * 流名称
     */
    private String streamName;
    /**
     * 开启播放鉴权后生成的鉴权串。
     */
    private String txSecret;
    /**
     * 推流地址
     */
    private String pushAddress;

    /**
     * rmtp播放地址
     */
    private String rtmpPlayAddress;

    /**
     * 关闭或者播放
     */
    private String action = "close";

    /**
     * 指定通道号
     * @return
     */
    private Integer channel;


    /**
     * 录像时间(秒)
     * @return
     */
    private Integer duration;

    /**
     * 录像保存时长(天)
     * @return
     */
    private Integer savedays;


    public String getStreamName() {
        return streamName;
    }

    public String getTxSecret() {
        return LiveUtil.getSafeUrl(this.streamName);
    }

    public String getPushAddress() {
        return HttpProfile.REQ_RTMP+ LiveProfile.PUSH_DOMAIN+LiveProfile.APP_NAME
                +"/"+streamName;
    }

    public String getRtmpPlayAddress() {
        return HttpProfile.REQ_HTTP+ LiveProfile.PLAY_DOMAIN+streamName+".flv";
    }
}
