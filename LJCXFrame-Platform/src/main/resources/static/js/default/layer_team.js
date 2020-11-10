/**
 * 用户管理列表
**/
$(function () {
    var layer_team = {
        currentTeam: {id:0,admin:0,canSelect:0},
        parentData: {},
        table: null,
        src: '',
        tree: null,
        init: function () {
            this.bindTree();
            this.bindEvent();
            this.checkboxJs();
        },
        url: {
            "treeList": "team/list/treeList",
            "adminList": "team/list/adminList",
            "userList" : "user/pageList",
            "carList":"team/car/pageList",
            "uavList":"team/uav/pageList",
            "saveTeam":"team/list/save",
            "cancelTeam":"team/list/cancelTeam",
            "equipmentList":"team/list/equipmentList",
            "bindTeam":"team/list/bindTeam",
            "delTeam":"team/list/del",
            "userSave":"account/save",
            "userUpdate":"user/update",
        },

        //团队树
        bindTree: function () {
            var that = this;
            layui.config({
                base: "/static/libs/layui/lay/treeSelect/"
            }).use(['jquery', 'table', 'eleTree'], function () {
                var $ = layui.jquery;
                var eleTree = null;
                eleTree = layui.eleTree;
                Ajax.postJson("../../" + that.url.adminList, null, JSON.stringify({'id': 0}), "", function (res) {
                    if (res.code == 200) {
                        layer_team.tree = eleTree.render({
                            elem: '.ele1',
                            data: res.data,
                            style: {
                                folder: { // 父节点图标
                                    enable: true // 是否开启：true/false
                                },
                                line: { // 连接线
                                    enable: true // 是否开启：true/false
                                }
                            },
                            showCheckbox: false,
                            highlightCurrent: true,
                            expandOnClickNode: false,
                            //contextmenuList: [{eventName: "addSame", text: "添加同级节点"},{eventName: "addChild", text: "添加子节点"},{eventName: "upd", text: "编辑"}],
                            defaultExpandAll: true,
                        });
                        that.loadlayer_team();
                    } else {
                        layer.alert(res.msg)
                    }
                }, null);

                eleTree.on("nodeClick(data1)", function (d) {
                    layer_team.currentTeam = d.data.currentData; // 点击节点对于的数据
                    layer_team.parentData = d.data.parentData.data;
                    that.loadlayer_team();
                })

            });
        },

        //列表加载
        loadlayer_team: function () {
            var that = this;
            that.uavList();
            that.memberList();
        },

        //无人机列表
        uavList: function () {
            var that = this;
            // 表格绑定事件
            layui.use('table', function () {   //这个代表引用layui文件modules里面的table.js,所以检查modules是否有table.js
                var table1 = layui.table;
                table1.render({
                    elem: '#uav'    //对应table里面的id
                    , url: "../../" + that.url.uavList //请求数据的地址
                    , method: "post"
                    , id: 'uavTable'
                    , cols: [[
                        {type: 'checkbox', width: '100',}
                        , {field: 'id', width: '100', title: '编号',align: 'center'}
                        , {field: 'name', width: '200', title: '无人机名称',align: 'center'}
                        , {field: 'no', width: '180', title: '无人机SN码',align: 'center'}
                        , {field: 'model', width: '200', title: '型号',align: 'center'}
                        , {field: '', width: '180', title: '操作', templet: '#optTplUav', hide: layer_team.currentTeam.admin == 0}
                    ]]
                    //,toolbar:"#toolbarDemo"
                    , page: true
                    , contentType: 'application/json; charset=utf-8'
                    , where: {
                        teamId: layer_team.currentTeam.id
                        , type: 'query'
                    }
                    , request: {pageName: 'pageNum', limitName: 'pageSize'}
                    , response: {statusCode: 200}
                    //,tool: '#optTplUav'
                    , parseData: function (res) { //res 即为原始返回的数据
                        console.log(res);
                        return {
                            "code": res.code, //解析接口状态
                            "msg": res.msg, //解析提示文本
                            "count": res.data.total, //解析数据长度
                            "data": res.data.records //解析数据列表
                        };
                    }
                });

                //操作按钮
                table1.on('tool(uav)',
                    function (obj) {
                        var that = this;
                        console.log(obj)
                        switch (obj.event) {
                            case 'removeUav':
                                var data = obj.data;
                                layer.confirm('确认要解除绑定吗？',
                                    function (index) {
                                        var ids = []
                                        ids.push(data.id)
                                        var json = {
                                            "mtype": 1,
                                            "id": layer_team.currentTeam.id,
                                            "mIds": ids
                                        }
                                        layer_team.cancelTeam(json, obj);
                                    });
                                break;
                        }
                        ;
                    });
            });
        },

        //成员列表
        memberList: function () {
            var that = this;
            // 表格绑定事件
            layui.use('table', function () {   //这个代表引用layui文件modules里面的table.js,所以检查modules是否有table.js
                var table3 = layui.table;
                table3.render({
                    elem: '#member'    //对应table里面的id
                    , url: "../../" + that.url.userList //请求数据的地址
                    , method: "post"
                    , id: 'memberTable'
                    , cols: [[
                        {type: 'checkbox',width: 50}
                        , {field: 'id', width: 80, title: '编号',align: 'center'}
                        , {field: 'nickname', width: 150, title: '昵称',align: 'center'}
                        , {field: 'teamName', width: 317, title: '所属团队',align: 'center'}
                        , {field: 'username', width: 150, title: '用户名',align: 'center'}
                        , {field: 'phone', width: 150, title: '手机号码',align: 'center'}
                        , {
                            field: '',
                            width: 100,
                            title: '操作',
                            templet: '#optTplMember',
                            hide: layer_team.currentTeam.admin == 0
                        }
                    ]]
                    //,toolbar:"#toolbarDemo"
                    , page: true
                    , contentType: 'application/json; charset=utf-8'
                    , where: {
                        teamId: layer_team.currentTeam.id
                        , type: 'query'
                    }
                    , request: {pageName: 'pageNum', limitName: 'pageSize'}
                    , response: {statusCode: 200}
                    //,tool: '#optTplMember'
                    , parseData: function (res) { //res 即为原始返回的数据
                        console.log(res);
                        return {
                            "code": res.code, //解析接口状态
                            "msg": res.msg, //解析提示文本
                            "count": res.data.total, //解析数据长度
                            "data": res.data.records //解析数据列表
                        };
                    }
                });

                //操作按钮
                table3.on('tool(member)',
                    function (obj) {
                        console.log(obj)
                        var that = this;
                        switch (obj.event) {
                            case 'removeMember':
                                var data = obj.data;
                                layer.confirm('确认要解除绑定吗？',
                                    function (index) {
                                        var ids = []
                                        ids.push(data.id)
                                        var json = {
                                            "mtype": 3,
                                            "id": layer_team.currentTeam.id,
                                            "mIds": ids
                                        }
                                        layer_team.cancelTeam(json, obj);
                                    });
                                break;
                        }
                        ;
                    });
            });
        },

        //取消团队
        cancelTeam : function(json,obj){
            var that = this;
            //发异步删除数据
            Ajax.postJson("../../" + that.url.cancelTeam, null, JSON.stringify(json), "", function (res) {
                if (res.code == 200) {
                    $(obj).attr("tr").remove();
                    layer.msg('已解除!', {
                        icon: 1,
                        time: 1000
                    });
                }else{
                    layer.msg(res.msg);
                }
            }, null);
        },

        //点击事件
        bindEvent: function () {

            $("#teamEditTap ul li").on('click', function (e) {
                var _team_item = $(e.target).attr("data-item");
                // active 样式切换
                $("#teamEditTap ul li").removeClass("layui-this");
                $(e.target).addClass("layui-this");

                for(var i=0;i<$(".teamTable").length;i++){
                    var item = $(".teamTable")[i];
                    $(item).removeClass("layui-show");
                    if ($(item).attr("data-filter") === _team_item){
                        $(item).addClass("layui-show");
                    }
                }
            });

            $("#addTeamButton").on('click',function () {
                if(layer_team.currentTeam.admin == 0){
                    layer.alert("没有该团队添加权限");
                    return
                }
                $("#teamAdminName").val(layer_team.currentTeam.nickname);
                $("#parentTeamName").val(layer_team.currentTeam.name);
                $("#teamAdminId").val(layer_team.currentTeam.userId);
                $("#parentTeamId").val(layer_team.currentTeam.id);
                $("#prePath").val(layer_team.currentTeam.path);
                $("#teamEditTap").hide();
                $("#edit-addTeam").show();

            });

            $("#editTeamButton").on('click',function () {
                if(layer_team.currentTeam.admin == 0){
                    layer.alert("没有该团队编辑权限");
                    return
                }
                $("#teamId").val(layer_team.currentTeam.id);
                $("#teamName").val(layer_team.currentTeam.name);
                $("#teamAdminName").val(layer_team.currentTeam.nickname);
                $("#teamAdminId").val(layer_team.currentTeam.userId);
                $("#parentTeamId").val(layer_team.parentData.id);
                $("#parentTeamName").val(layer_team.parentData.name);
                $("#teamEditTap").hide();
                $("#edit-addTeam").show();
            });

            $("#delTeamButton").on('click',function () {
                if(layer_team.currentTeam.admin == 0){
                    layer.alert("没有该团队编辑权限");
                    return
                }
                layer.confirm('确认要删除吗？',
                    function(index) {
                        Ajax.postJson("../../" + layer_team.url.delTeam, null, JSON.stringify({'id':layer_team.currentTeam.id}), "", function (res) {
                            if (res.code == 200) {
                                layer.alert(res.msg);
                                var node = layer_team.tree.getNode(layer_team.currentTeam.id);
                                layer_team.tree.removeNode(node);
                            }else{
                                layer.alert(res.msg);
                            }
                        }, null);

                    });
            });


            //绑定按钮
            $("#bindButton").off('click').on('click',function () {
                if(layer_team.currentTeam.id == 0){
                    layer.alert("请选择一个团队进行操作");
                    return;
                }
                Ajax.postJson("../../" + requestConfig.teamUrl.equipmentList, null, JSON.stringify({'id':equipment.teamId}), "", function (res) {
                    if (res.code == 200) {
                        //equipment.data = res.data;
                    }else{
                        layer.alert(res.msg)
                    }
                }, null);
            });

            //添加按钮
            $("#addMemberButton").on('click',function () {
                if(layer_team.currentTeam.id == 0){
                    layer.alert("请选择一个团队进行操作");
                    return
                }
                $("#edit-addMember").show();
                $("#teamEditTap").hide();
            });

            $("#bindMemberButton").on('click',function () {
                if(layer_team.currentTeam.id == 0){
                    layer.alert("请选择一个团队进行操作");
                    return
                }
                layer_team.equipmentInfo();
                $("#bindEquipmentDiv").show();
                $("#teamEditTap").hide();
            });

            //团队编辑取消
            $(".cancelTeam").on('click',function () {
                $("#teamEditTap").show();
                $("#edit-addTeam").hide();
                $("#edit-addMember").hide();
                $("#bindEquipmentDiv").hide();
            });

            //提交设备绑定表单
            $("#saveEquipment").on('click',function () {
                layer_team.equipmentSave();
            });

            //提交用户
            $("#saveUser").on('click',function () {
                layer_team.userSave();
                $("#bindEquipmentDiv").show();
                $("#edit-addMember").hide();
            });

            //提交团队表单
            $("#saveTeam").on('click',function () {
                var that = this;
                layui.use('form', function(){
                    var form = layui.form;
                    //监听提交
                    form.on('submit(TeamForm)',
                        function(data) {
                            $.ajax({
                                type : 'POST',
                                dataType : "json",
                                url : "../../" + layer_team.url.saveTeam,
                                data : JSON.stringify(data.field),
                                contentType : "application/json; charset=utf-8",
                                cache : false,
                                async : false,
                                success : function(res) {
                                    if (res.code == 200) {
                                        //发异步，把数据提交给php
                                        layer.alert("保存成功", {
                                                icon: 6
                                            },
                                            function() {
                                                //父页面刷新
                                                $("#edit-addTeam").hide();
                                                $("#add-addTeam").hide();
                                                $("#teamEditTap").show();
                                                //tree刷新
                                                // if(data.field.id > 0){
                                                //     var node = layer_team.tree.getNode(data.field.id);
                                                //     node.name = data.field.name;
                                                //     layer_team.tree.editNodeName(node);
                                                // }else{
                                                //     var node = res.data.data;
                                                //
                                                //     layer_team.tree.addNode(node.id,node);
                                                // }
                                                //更新团队
                                                layer_team.bindTree();
                                                //关闭当前frame
                                                var index = layer.open();
                                                layer.close(index);
                                            });
                                    }else{
                                        layer.alert(res.data.msg)
                                    }
                                },
                            });
                            return false;
                        });
                });


            });

        },
        //设备信息
        equipmentInfo: function(){
            var that = this;
            Ajax.postJson("../../" + that.url.equipmentList, null, JSON.stringify({'id':layer_team.currentTeam.id}), "", function (res) {
                layui.use(['form','element'], function(){
                    var form = layui.form,
                        element = layui.element;
                    if($(res.data).length > 0){
                        var equipment = $(res.data)[0];
                        $("#id").val(equipment.id);
                        $("#name").val(equipment.name);
                        var uavHtml = "";
                        for(var i = 0; i < equipment.uavs.length; i++){
                            var uav = equipment.uavs[i];
                            uavHtml += "<input name=\"uavIds\" lay-skin=\"primary\" type=\"checkbox\" title="+uav.name+" value="+uav.id+">";
                        }
                        $("#uavList").html(uavHtml);
                        var memberHtml = "";
                        for(var i = 0; i < equipment.members.length; i++){
                            var member = equipment.members[i];
                            memberHtml += "<input name=\"memberIds\" lay-skin=\"primary\" type=\"checkbox\" title="+member.nickname+" value="+member.id+">";
                        }
                        $("#memberList").html(memberHtml);
                        form.render('checkbox');
                    }
                });
            }, null);
        },

        checkboxJs: function(){
            layui.use(['form','layer'], function(){
                $ = layui.jquery;
                var form = layui.form
                    ,layer = layui.layer;

                form.on('checkbox(father)', function(data){

                    if(data.elem.checked){
                        $(data.elem).parent().siblings('td').find('input').prop("checked", true);
                        form.render();
                    }else{
                        $(data.elem).parent().siblings('td').find('input').prop("checked", false);
                        form.render();
                    }
                });
            });

            var _hmt = _hmt || []; (function() {
                var hm = document.createElement("script");
                hm.src = "https://hm.baidu.com/hm.js?b393d153aeb26b46e9431fabaf0f6190";
                var s = document.getElementsByTagName("script")[0];
                s.parentNode.insertBefore(hm, s);
            })();
        },


        equipmentSave: function () {
            layui.use('form', function(){
                var form = layui.form;
                //监听提交
                form.on('submit(equipmentForm)',
                    function(data) {
                        //获取checkbox[name='like']的值
                        var uavIds = new Array();
                        $("input:checkbox[name='uavIds']:checked").each(function(i){
                            uavIds[i] = $(this).val();
                        });

                        var carIds = new Array();
                        $("input:checkbox[name='carIds']:checked").each(function(i){
                            carIds[i] = $(this).val();
                        });

                        var memberIds = new Array();
                        $("input:checkbox[name='memberIds']:checked").each(function(i){
                            memberIds[i] = $(this).val();
                        });

                        var json = {
                            "id": layer_team.currentTeam.id,
                            "uavIds" : uavIds,
                            "carIds" : carIds,
                            "memberIds" : memberIds
                        }
                        Ajax.postJson("../../" + layer_team.url.bindTeam, null, JSON.stringify(json), "", function (data) {
                            if (data.code == 200) {
                                //发异步，把数据提交给php
                                layer.alert("保存成功", {
                                        icon: 6
                                    },
                                    function() {
                                        //父页面刷新
                                        //关闭当前frame
                                        var index = layer.open();
                                        layer.close(index);
                                        $("#bindEquipmentDiv").hide();
                                        $("#teamEditTap").show();

                                    });
                            }else{
                                layer.alert(data.msg)
                            }
                        }, null);
                        return false;
                    });
            });
        },
        
        userSave: function () {
            layui.use('form', function() {
                var form = layui.form;
                //监听提交
                form.on('submit(userForm)',
                    function (data) {
                        //获取checkbox[name='like']的值
                        data.field.roleIds = [3];
                        var url = "";
                        if(data.field.id > 0){
                            url = "../../" + layer_team.url.userUpdate;
                        }else{
                            url = "../../" + layer_team.url.userSave;
                        }
                        data.field.teamId = layer_team.currentTeam.id;
                        Ajax.postJson(url, null, JSON.stringify(data.field), "", function (data) {
                            if (data.code == 200) {
                                //发异步，把数据提交给php
                                layer.alert("保存成功", {
                                        icon: 6
                                    },
                                    function () {
                                        var index = layer.open();
                                        layer.close(index);
                                    });
                            } else {
                                layer.alert(data.msg)
                            }
                        }, null);
                        return false;
                    });
            });
        }


    }

    window.layer_team = layer_team;
    layer_team.init();

});




