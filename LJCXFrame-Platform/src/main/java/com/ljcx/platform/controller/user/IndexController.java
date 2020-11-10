package com.ljcx.platform.controller.user;

import com.ljcx.platform.config.ConfigParam;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class IndexController {

    @Autowired
    private ConfigParam configParam;

    // 系统首页
    @GetMapping("/index")
    public String index(ModelMap mmap)
    {
        // 获取配置信息
        mmap.put("localConfig", configParam);
        return "index";
    }
}
