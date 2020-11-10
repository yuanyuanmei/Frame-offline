package com.ljcx.framework.sys.vo;

import lombok.Data;

import java.io.Serializable;

@Data
public class SysFileVo implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;


    private String fileName;

    private String url;

    private String suffix;

    private String thumbPath;

    private String thumbUrl;



}
