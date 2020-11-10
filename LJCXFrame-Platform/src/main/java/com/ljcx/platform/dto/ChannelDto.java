package com.ljcx.platform.dto;

import com.alibaba.fastjson.annotation.JSONField;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotNull;
import java.io.Serializable;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@NotNull(message = "通道信息不能为空")
public class ChannelDto implements Serializable {

    private static final long serialVersionUID = 4043470238789599973L;


    /**
     * 通道名称
     */
    private Integer channel;

    /**
     * 在线状态
     */
    private Boolean online;


    /**
     * 通道取流状态
     */
    private Boolean streaming;

    /**
     * 分页开始
     */
    private Integer start;

    /**
     * 分页大小
     */
    private Integer limit;

    /**
     * 排序字段
     */
    private String sort;

    /**
     * 分页大小
     */
    private String order;

    /**
     * 分页大小
     */
    private String q;


}
