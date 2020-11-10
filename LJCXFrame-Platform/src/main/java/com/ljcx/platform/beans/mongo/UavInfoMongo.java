package com.ljcx.platform.beans.mongo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.bson.types.ObjectId;

@Data
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class UavInfoMongo {


    private ObjectId objectId;

    private Long uavId;

    private Long teamId;

    /**
     * 序列号
     */
    private String no;
    /**
     * 型号
     */
    private String model;

    /**
     * 名称
     */
    private String name;
    /**
     * 速度
     */
    private Double speed;
    /**
     * 高度
     */
    private Double high;
    /**
     * 航向
     */
    private String course;
    /**
     * 电池
     */
    private Integer electricity;

    /**
     * 网络
     */
    private String network;

    /**
     * 飞行状态
     */
    private Integer inFlight;

    private String position;

    private Long createUser;

    /**
     * 任务航行时长
     */
    private String flyTime;

    /**
     * 记录Id
     */
    private Long recordsId;

    /**
     * 时间戳
     */
    private Long createTimeStamp;

    /**
     * 当地时间戳
     */
    private Long localTimeStamp;

}
