package com.ljcx.platform.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.ljcx.platform.beans.CarInfoBean;
import com.ljcx.platform.dto.CarInfoDto;

/**
 * 设备车信息表
 *
 * @author dm
 * @date 2019-11-14 15:55:00
 */
public interface CarInfoService extends IService<CarInfoBean> {

    IPage<CarInfoBean> pageList(CarInfoDto carInfoDto);
}

