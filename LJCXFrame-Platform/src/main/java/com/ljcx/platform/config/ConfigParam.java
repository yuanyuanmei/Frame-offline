package com.ljcx.platform.config;

import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.PropertySource;
import org.springframework.stereotype.Component;


@Component
@PropertySource("classpath:local-config.properties")
@ConfigurationProperties(prefix = "local")
@Data
public class ConfigParam {

    private String mapurl;

    private float[] mapextent;

    private int mapzoom;

    private int mapminzoom;

    private int mapmaxzoom;

    private float[] mapcenter;

    private String websocketurl;




}
