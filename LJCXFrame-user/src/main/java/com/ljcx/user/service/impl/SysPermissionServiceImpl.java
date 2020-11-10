package com.ljcx.user.service.impl;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.ljcx.framework.sys.service.IGenerator;
import com.ljcx.user.beans.SysPermissionBean;
import com.ljcx.user.dao.SysPermissionDao;
import com.ljcx.user.dao.SysRoleDao;
import com.ljcx.user.dto.PermissionDto;
import com.ljcx.user.dto.RoleDto;
import com.ljcx.user.service.SysPermissionService;
import com.ljcx.user.vo.PermsVo;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
public class SysPermissionServiceImpl extends ServiceImpl<SysPermissionDao, SysPermissionBean> implements SysPermissionService {

    @Autowired
    private IGenerator generator;

    @Autowired
    private SysRoleDao roleDao;

    @Autowired
    private SysPermissionDao permissionDao;

    @Override
    public IPage<SysPermissionBean> pageList(PermissionDto permissionDto) {
        IPage<SysPermissionBean> page = new Page<>();
        page.setCurrent(permissionDto.getPageNum());
        page.setSize(permissionDto.getPageSize());
        return permissionDao.pageList(page,permissionDto);
    }

    @Override
    public int saveRolePermission(RoleDto roleDto) {
        permissionDao.delPermissionsByRoleId(roleDto.getId());
        roleDao.saveRolePermission(roleDto.getId(),roleDto.getPermissionIds());
        return 1;
    }

    @Override
    public PermsVo treeList() {
        List<PermsVo> allPerms = permissionDao.list();
        log.info(allPerms.toString());
        PermsVo parent = new PermsVo();
        parent.setName("权限列表");
        parent.setId(0);
        parent.setChildren(childrenTreeList(parent.getId(),allPerms));
        return parent;
    }

    /**
     * 递归获得子树
     * @param parentId
     * @param permissionList
     * @return
     */
    private List<PermsVo> childrenTreeList(Integer parentId, List<PermsVo> permissionList) {
        List<PermsVo> children = new ArrayList<>();
        permissionList.stream().forEach(permission->{
            if(parentId.equals(permission.getParentId())){
                permission.setChildren(childrenTreeList(permission.getId(),permissionList));
                children.add(permission);
            }
        });
        return children;
    }
}
