package com.ljcx.api.service.impl;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.ljcx.api.beans.PanoramaBean;
import com.ljcx.api.dao.PanoramaDao;
import com.ljcx.api.dto.PanoramaDto;
import com.ljcx.api.service.PanoramaService;
import com.ljcx.framework.sys.beans.SysFileBean;
import com.ljcx.framework.sys.dao.SysFileDao;
import com.ljcx.framework.sys.service.IGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
public class PanoramaServiceImpl extends ServiceImpl<PanoramaDao, PanoramaBean> implements PanoramaService {

    @Autowired
    private IGenerator generator;

    @Autowired
    private PanoramaDao panoramaDao;

    @Autowired
    private SysFileDao fileDao;

    @Override
    public IPage<PanoramaBean> pageList(PanoramaDto panoramaDto) {
        IPage<PanoramaBean> page = new Page<>();
        page.setCurrent(panoramaDto.getPageNum());
        page.setSize(panoramaDto.getPageSize());
        return panoramaDao.pageList(page,panoramaDto);
    }

    @Override
    @Transactional
    public PanoramaBean save(PanoramaDto panoramaDto) {
        PanoramaBean panoramaBean = generator.convert(panoramaDto, PanoramaBean.class);
        if(panoramaDto.getFileId() != null){
            SysFileBean fileBean = fileDao.selectById(panoramaDto.getFileId());
            panoramaBean.setFilePath(fileBean.getFilePath());
        }
        saveOrUpdate(panoramaBean);
        return panoramaBean;
    }

}
