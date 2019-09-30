/**
 * 功能描述：  发现——首页
 * 使用方法:
 * 注意事件：
 * 引入来源：  作用：发现页改版
 *
 * Created by Administrator on 2017/09/25.
 */
$(function() {
    var discoverIndex = {
        params:{
            customerId:TempCache.getItem('userId')||'',       //获取用户ID
            platformId :TempCache.getItem('department')||1,   //获取平台ID
            specialId:getpara().columnId||'',                 //获取栏目ID
            sortType:0,      //为0默认，1为最新
            tagId:"",        //点击的时候保存标签ID
            _topHeader: $(".fixedHeader").height(),     //获取固定头部的距离
            _top:0,          //获取专科列表到最上面的距离
            scrolls:0,       //获取window滚动的距离
            grade:"",        //单独配置给后台,一级筛选传1,二级筛选传2
            firstTagRecord:"",  //一级标签记录
            sceneType:''      //分享
        },
        publicData:[], //储存筛选的变量
        data:{},       //存储的滚动请求参数
        path:{
            share:"/mcall/comm/data/share/getMapList3/",             //分享按钮
            follow:"/mcall/customer/follow/resource/create/",        //关注按钮
            cancelFollow:"/mcall/customer/follow/resource/delete/",  //取消关注
            course: '/mcall/cms/course/getHotCourseList/'            //课程地址
        },
        init: function() {
            var t = this;
            window.onload = Log.createBrowse(218, '特色栏目详情页');
            t.featureDetail();       //详情页介绍
            t.firstList();        //优先使用缓存数据
            t.scrollFunc();       //滚动固定
            t.newHotFunc();       //新热切换
            $('.ev_backBtn').click(function(){
                comm.creatEvent({
                    triggerType:'全站功能按钮点击',
                    keyword:"返回",
                    actionId:41,
                    async:false
                });
                history.back();
                //window.location.href='//m.allinmd.cn/pages/discover/discover_feature_column.html';
            });
        },
        featureDetail:function(){
            var t = this;
            comm.loading.show();
            t.ajaxFn({
                url: "/mcall/special/getSpecialInfo/",
                param:{paramJson: $.toJSON({
                    "customerId": t.params.customerId,
                    "specialId":  t.params.specialId,
                    "visitSiteId":2
                })
                },
                fn:function(data) {
                    comm.loading.hide();
                    if(comm.hasResponseData(data)){
                        var item = data.responseObject.responseData.data_list[0];
                        if(item.seoName){
                            document.title=item.seoName+'-唯医,allinmd';
                        }else{
                            document.title=item.specialTitle+'-唯医,allinmd';
                        }
                        if(item.specialTitle){
                            $('.seoName').html(comm.getStrLen(item.specialTitle,14));
                        }
                        if(item.seoKeyword){
                            $("[name='keywords']").attr({"content":""+item.seoKeyword+""});
                        }
                        if(item.seoDescribe){
                            $("[name='description']").attr({"content":""+item.seoDescribe+""});
                        }

                        //处理背景图
                        var url = '';
                        if(item.linkUrl){
                            url = item.linkUrl;
                        }
                        $('.boneClassCont').attr('style','background:#fff url('+url+') no-repeat;background-size:contain;');
                        ////end

                        if(item.specialType){
                            switch (parseInt(item.specialType)){
                                case 1:
                                    t.params.sceneType = 77;
                                    break;
                                case 2:
                                    t.params.sceneType = 76;
                                    break;
                                case 3:
                                    t.params.sceneType = 78;
                                    break;
                            }
                        }

                        t.handCommMethod();
                        var templat = $('#title-templaye').html();
                        var func = Handlebars.compile(templat);
                        var str = func(item);
                        $('.boneClass').prepend(str);

                        if(item.followState==1){
                            $('.Ev-FollowBtn').addClass('active').html('关注');
                        }
                        if(item.specialContent){
                            //$('.introduction').show();
                            if(comm.getByteLen(item.specialContent)>66){
                                $('.introduction a').show();
                            }
                        }
                        if(item.hasAnyFollow==0){
                            $('.promptBoneClass').attr('style','display:block');
                            $('.promptBoneClass').on('click',function(event){
                                event.stopPropagation();
                            });
                        }

                        //关注功能
                        t.friending();
                        //更多信息隐藏显示
                        $('.introduction a').on('click',function(){
                            function rem(opx) {
                                var px = parseInt(opx);
                                return (px / 75) + 'rem';
                            }
                            var h1rem = window.screen.availHeight-260;
                            $('.introductionMore').attr('style','height:'+rem(h1rem)+'');
                            $('.introductionBg').attr('style','display:block;overflow:auto');
                            $('.boneClassCont').css('overflow','hidden').css('height',$(window).height());
                            comm.creatEvent({
                                triggerType:'功能按钮',
                                keyword:'栏目介绍-更多信息',
                                browsetype_url:getpara().columnId,
                                actionId:11041,
                                browsetype:218
                            });
                        });
                        $('.introductionMore i').on('click',function(){
                            $('.introductionBg').attr('style','display:none');
                            $('.boneClassCont').css('overflow','').css('height','');
                        });
                    }
                    t.recommendDoctor();
                    t.share();
                },
                error:function(){
                    comm.loading.hide();
                }
            });
        },
        friending:function(){
            var t = this;
            $(".Ev-FollowBtn").off("click").on("click", function () {//关注，点击进行关注
                var that = $(this);
                user.privExecute({
                    operateType: 'auth',
                    callback: function () {
                        if(that.hasClass('active')){
                            comm.confirmBox({
                                title: "是否取消关注",
                                ensure: "确定",
                                cancel: "取消",
                                ensureCallback:function(){
                                    t.ajaxFn({
                                        url: t.path.cancelFollow,
                                        param:{paramJson: $.toJSON({
                                            "refId": t.params.specialId,
                                            "followType":"8",
                                            "refName":that.parent().text(),
                                            "customerId":t.params.customerId
                                        })
                                        },
                                        fn: function (data) {
                                            if (data && data.responseObject && data.responseObject.responseStatus) {
                                                var _n = $(".Ev-followNum").text();
                                                var testRex = /[\u4e07]|[\u5343]/g;
                                                if(!testRex.test(_n)){
                                                    if (parseInt(_n) - 1 > 0) {
                                                        $(".Ev-followNum").text(parseInt(_n) - 1);
                                                    } else {
                                                        $(".Ev-followNum").text(0);
                                                    }
                                                }
                                                that.removeClass('active');
                                                //$('.promptBoneClass').attr('style','display:block');
                                            }
                                        },
                                        error: function () {
                                            comm.loading.hide();
                                        }
                                    });
                                },
                                cancelCallback:function(){

                                }
                            });
                        }else{
                            var _n = $(".Ev-followNum").text();
                            comm.creatEvent({
                                triggerType:'关注',
                                keyword:that.prev().text(),
                                actionId:11022,
                                push_message_id:getpara().columnId,
                                browsetype:218
                            });
                            t.ajaxFn({
                                url: t.path.follow,
                                param:{paramJson: $.toJSON({
                                    "refId":t.params.specialId,
                                    "followType":"8",
                                    "refName":that.parent().text(),
                                    "customerId":t.params.customerId
                                })
                                },
                                fn:function(data) {
                                    comm.loading.hide();
                                    if (data && data.responseObject && data.responseObject.responseStatus) {
                                        //$(".al-scrollShareBtn .shareTip").attr('style','display:block');
                                        var testRex = /[\u4e07]|[\u5343]/g;
                                        if(!testRex.test(_n)){
                                            $(".Ev-followNum").text(parseInt(_n) + 1);
                                        }
                                        $('.promptBoneClass').attr('style','display:none');
                                        that.addClass('active');
                                        popup('已关注');
                                    }
                                },
                                error:function(){
                                    comm.loading.hide();
                                }
                            });
                        }
                    }
                });

            });
        },
        recommendDoctor:function(){
            var t = this;
            comm.loading.show();
            t.ajaxFn({
                url: "/mcall/special/getRecommendAuthor/",
                param:{paramJson: $.toJSON({
                    "customerId": t.params.customerId,
                    "specialId":  t.params.specialId
                })
                },
                fn:function(data) {
                    comm.loading.hide();
                    if(comm.hasResponseData(data)){
                        var item = data.responseObject.responseData.data_list;
                        if(item.length>0) {
                            t.handCommMethod();
                            var templat = $('#recommendDoctor-templaye').html();
                            var func = Handlebars.compile(templat);
                            var str = func(item[0]);
                            $('.boneClassNav').show().before(str);
                        }
                    }
                    t.params._top = $(".boneClassNav").offset().top;
                },
                error:function(){
                    comm.loading.hide();
                }
            });
        },
        firstList:function(){
            var t = this;
            comm.loading.show();
            t.ajaxFn({
                url: "/mcall/special/getSpecialCategoryList/",
                param:{paramJson: $.toJSON({
                    "customerId": t.params.customerId,
                    "specialId": t.params.specialId
                })
                },
                fn:function(data) {
                    comm.loading.hide();
                    if(comm.hasResponseData(data)){
                        var item = data.responseObject.responseData.data_list;
                        if(item.length>0) {

                            t.statisticsSecond(data.responseObject.responseData);
                            //t.renderTemplate("#boneClassNav-template",item,".boneClass");
                            t.publicData = t.statisticsSecond(data.responseObject.responseData).data_list;
                            //TempCache.setItem(t.params.specialId,JSON.stringify(item));
                            t.upData();
                            t.loadTag();
                        }
                    }
                },
                error:function(){
                    comm.loading.hide();
                }
            });
        },
        upData:function(){
            var t = this;
            //t.publicData = JSON.parse(TempCache.getItem(t.params.specialId));
            if(TempCache.getItem(t.params.specialId)){
                var secondActiveId = "";
                var firstActiveId = "";
                var cache = JSON.parse(TempCache.getItem(t.params.specialId));
                $.each(cache,function(i,v){
                    if(v.activeOnOff){
                        t.params.firstTagRecord = v.categoryId;
                        $.each(v.sonCategoryList,function(index,value){
                            if(value.activeOnOff){
                                secondActiveId = value.sonCategoryId;
                                firstActiveId = v.categoryId;
                            }
                        });
                    }
                });
                $.each(t.publicData,function(i,v){
                    if(v.categoryId == firstActiveId){
                        v.activeOnOff = true;
                        t.params.firstTagRecord = v.categoryId;
                        $.each(v.sonCategoryList,function(index,value){
                            if(value.sonCategoryId == secondActiveId ){
                                value.activeOnOff = true;
                            }else{
                                value.activeOnOff = false;
                            }
                        });
                    }else{
                        v.activeOnOff = false;
                    }
                });
            }else{
                $.each(t.publicData,function(index,value){
                    if(index==0){
                        value.activeOnOff = true;
                    }else{
                        value.activeOnOff = false;
                    }
                    if(value.sonCategoryList){
                        $.each(value.sonCategoryList,function(i,v){
                            if(index==0 && i==0){
                                v.activeOnOff = true;
                            }else{
                                v.activeOnOff = false;
                            }
                        })
                    }
                });
            }
        },
        statisticsSecond: function (data) {
            var t = this;
            var returnData = [];
            var originalData = JSON.parse(JSON.stringify(data));
            var dataJson = {
                resourceNum: 0,
                sonCategoryId: "",
                sonCategoryName: "全部"
            };
            $.each(originalData.data_list, function (i, v) {
                var dataJson = {
                    resourceNum: v.totalResourceNum,
                    sonCategoryId: "",
                    sonCategoryName: "全部",
                    treeLevel: ""
                };
                if (v.sonCategoryList) {
                    //v.sonCategoryList.unshift(dataJson);
                    $.each(v.sonCategoryList, function (si, sv) {
                        if (sv.sonCategoryId.length !== "" && sv.sonCategoryName !== "全部") {
                            sv.treeLevel = 2;
                            returnData.push(sv);
                        }
                    });
                }
            });
            dataJson.resourceNum = originalData.data_list[0]["totalResourceNum"];
            returnData.unshift(dataJson);
            originalData.data_list[0]["sonCategoryList"] = returnData;
            originalData.data_list[0]["treeLevel"] = "";
            var dataJsonAdd = {
                resourceNum: 11,
                sonCategoryId: "11",
                sonCategoryName: "测试二级栏",
                treeLevel: "2"
            };
            /*for(var num = 0;num<100;num++){
             originalData.data_list[0].sonCategoryList.push(dataJsonAdd);
             }*/
            //t.parameter.tabList = originalData;
            //console.log(originalData);
            return originalData;
        },
        loadTag:function(){
            var t = this;
            var str = "", html = '';
            var flag = '';           //记录当前的一级标签循环变量
            //节点到底可以有多长活动文库节点到底可以有多 //21
            $.each(t.publicData,function(index,value){
                if(value.activeOnOff){
                    t.params.tagId = value.categoryId;
                    t.params.grade = 1;
                    str += '<li data-id="'+value.categoryId+'" flag="1" class="active">'+value.categoryName+'</li>';
                    if(value.sonCategoryList){
                        $.each(value.sonCategoryList,function(i,v){
                            if(comm.getByteLen(v.sonCategoryName)>18){
                                v.sonCategoryName = comm.getStrLen(v.sonCategoryName,18);
                            }
                            if(v.activeOnOff){
                               html+='<li son-id="'+ v.sonCategoryId+'" flag="2" class="active">'+v.sonCategoryName+'<span>'+ v.resourceNum+'</span></li>';
                            }else{
                               html+='<li son-id="'+ v.sonCategoryId+'" flag="2">'+v.sonCategoryName+'<span>'+ v.resourceNum+'</span></li>';
                            }
                        })
                    }
                }else{
                    str += '<li data-id="'+value.categoryId+'" flag="1">'+value.categoryName+'</li>';
                }
            });
            var string = '<aside class="boneClassNavCont">' +
                    '<ul>'+str+'</ul>' +
                    '</aside>';
            var secondString = '<aside class="tagList" style="display: none">' +
                '<ul class="oneColumn">'+html+'</ul>' +
                '<div class="packUp" style="display: none"><p>展开</p></div>' +
                '</aside>';
            $('.boneClassNav').html(string);
            $('.boneClassNav').after(secondString);
            t.firstFilter(); //初始化一级点击
            t.tagFilter();   //初始化/重置二级点击
            t.scrollFunc();
            t.dataList();
        },
        updataTag:function(obj){
            var t = this;
            //console.log(t.publicData,obj,obj.attr('data-id'),obj.attr('flag'));
            if(parseInt(obj.attr('flag'))==1){
                $.each(t.publicData,function(index,value){
                    if(obj.text()===value.categoryName){
                        t.params.firstTagRecord = value.categoryId;
                        value.activeOnOff = true;
                        if(value.sonCategoryList){
                            $.each(value.sonCategoryList,function(i,v){
                                if(i==0){
                                    v.activeOnOff = true;
                                }else{
                                    v.activeOnOff = false;
                                }
                            });
                        }
                    }else{
                        value.activeOnOff = false;
                        if(value.sonCategoryList){
                            $.each(value.sonCategoryList,function(i,v){
                                v.activeOnOff = false;
                            });
                        }
                    }
                });
            }else{
                $.each(t.publicData,function(index,value){
                    if(value.sonCategoryList){
                        $.each(value.sonCategoryList,function(i,v){
                            if(obj.text()===v.categoryName){
                                v.activeOnOff = true;
                            }else{
                                v.activeOnOff = false;
                            }
                        });
                    }
                });
            }
            TempCache.setItem(t.params.specialId,JSON.stringify(t.publicData));
        },
        firstFilter:function(){
            var t = this;
            //一级筛选点击事件和取值
            var disposeData = function(){
                var datad = $('.oneColumn li');
                var wid = 0;
                $.each(datad,function(index,value){
                    wid += parseInt(this.clientWidth);
                });
                var dataW = $('.oneColumn').width();
                //console.log(wid);
                //console.log(dataW);
                if(wid>dataW){
                    $('.packUp').attr('style','display:block').html('<p>展开</p>');
                    $('.packUp').prev().removeAttr('style');
                }
                if(wid<dataW){
                    $('.packUp').attr('style','display:none').html('<p>展开</p>');
                    $('.packUp').prev().removeAttr('style');
                }
            };
            if(t.params.tagId!=""){
                $('.tagList').attr('style','display:block');
                disposeData();
            }
            $('.boneClassNav ul li').off('click').on('click',function(){
                var that = $(this);
                t.updataTag($(this));
                var dataId = $(this).attr('data-id');
                if(!$(this).hasClass('active')){
                    if($('.boneClassNav').attr('data-float')==1){
                        comm.creatEvent({
                            triggerType:'筛选排序',
                            trigger_name:"一级筛选",
                            keyword:that.text(),
                            browsetype_url:getpara().columnId,
                            push_message_id:dataId,
                            actionId:11038,
                            browsetype:218
                        });
                    }else{
                        comm.creatEvent({
                            triggerType:'筛选排序',
                            trigger_name:"一级筛选",
                            keyword:$(this).text(),
                            browsetype_url:getpara().columnId,
                            actionId:11039,
                            browsetype:218
                        });
                    }
                    $('.boneClassList').attr('scrollpagination',''); //资源少的时候添加,每次切换的时候删除
                    $('.lastTime').remove();
                    $('.moreMaxHeight').scrollTop(0);
                    t.params.tagId = $(this).attr('data-id');
                    t.params.firstTagRecord = $(this).attr('data-id');
                    t.params.grade = 1;
                    t.params.sortType=0;
                    t.dataProcess();
                    t.dataList();
                    $(this).addClass('active').siblings().removeClass('active');
                    $('.al-terminalSortChangeItem:first').addClass('active').siblings().removeClass('active');
                    $('.packUp').prev().removeClass("moreMaxHeight").addClass("oneColumn");
                    if(dataId!=""){
                        $('.tagList').attr('style','display:block');
                        disposeData();
                    }else{
                        $('.tagList').attr('style','display:none');
                    }
                }
            });
            //二级筛选展开收起
            $('.tagList .packUp').off('click').on('click',function(){
                var prev = $(this).prev(),that = $(this);
                if(prev.hasClass("oneColumn")){
                    comm.creatEvent({
                        triggerType:'展开',
                        actionId:11024
                    });
                    prev.removeClass("oneColumn").addClass("moreMaxHeight");
                    that.html('<span>收起</span>').attr('style','border-top:1px solid #e2e2e2');
                    var data = $('.moreMaxHeight li');
                    var w = 0;
                    $.each(data,function(){
                        w += parseInt($(this).outerWidth(true));
                    });
                    var screenWidth = $('.moreMaxHeight').width();
                    var num = w/screenWidth;
                    switch (parseInt(num)+1){
                        case 6:
                            $('.moreMaxHeight').attr('style','height:7.94667rem;');
                            break;
                        case 5:
                            $('.moreMaxHeight').attr('style','height:6.94667rem;');
                            break;
                        case 4:
                            $('.moreMaxHeight').attr('style','height:5.94667rem;');
                            break;
                        case 3:
                            $('.moreMaxHeight').attr('style','height:4.94667rem;');
                            break;
                        case 2:
                            $('.moreMaxHeight').attr('style','height:3.94667rem;');
                            break;
                    }
                }else{
                    $('.moreMaxHeight').scrollTop(0);
                    prev.removeClass("moreMaxHeight").addClass("oneColumn");
                    that.html('<p>展开</p>').removeAttr('style');
                    $('.oneColumn').removeAttr('style','height:5.94667rem;');
                }
            });
        },
        dataProcess:function(){
            var t = this;
            var str = "";
            $.each(t.publicData,function(index,value){
                if(t.params.tagId == value.categoryId){
                    if(value.sonCategoryList){
                        $.each(value.sonCategoryList,function(i,v){
                            if(comm.getByteLen(v.sonCategoryName)>18){
                                v.sonCategoryName = comm.getStrLen(v.sonCategoryName,18);
                            }
                            if(v.activeOnOff){
                                str += '<li son-id="'+ v.sonCategoryId+'" flag="2" class="active">'+v.sonCategoryName+'<span>'+v.resourceNum+'</span></li>';
                            }else{
                                str += '<li son-id="'+ v.sonCategoryId+'" flag="2">'+v.sonCategoryName+'<span>'+v.resourceNum+'</span></li>';
                            }
                        });
                    }
                }
            });
            $('.oneColumn').html(str);
            $('.moreMaxHeight').html(str);
            t.tagFilter();   //重置二级点击
        },
        tagFilter:function(){
            var t = this;
            //二级筛选点击事件,该方法可用户初始化页面,刷新二级数据从新调用
            $('.oneColumn li,.moreMaxHeight li').off('click').on('click',function() {
                var sonId = $(this).attr('son-id');
                t.params.sortType=0;
                if(!$(this).hasClass('active')) {
                    $('.boneClassList').attr('scrollpagination',''); //资源少的时候添加,每次切换的时候删除
                    $('.lastTime').remove();
                    if(sonId == ""){
                        t.params.tagId = t.params.firstTagRecord;
                        //t.params.tagId = v.categoryId;
                        t.params.grade = 1;
                    }else{
                        t.params.tagId = sonId;
                        t.params.grade = 2;
                    }
                    t.dataList();
                    $(this).addClass('active').siblings().removeClass('active');
                    $('.al-terminalSortChangeItem:first').addClass('active').siblings().removeClass('active');
                }
            });
        },
        newHotFunc: function () {
            var t = this;
            $(".al-terminalSortChangeItem").on("click", function () {
                var that = $(this);
                if(!that.hasClass('active')){
                    that.addClass('active').siblings().removeClass('active');
                    if(that.attr('flag')==0){
                        t.params.sortType = 0;
                        comm.creatEvent({
                            triggerType:'筛选排序',
                            trigger_name:"默认",
                            keyword:that.text(),
                            actionId:11040,
                            browsetype_url:getpara().columnId,
                            browsetype:218
                        });
                    }else if(that.attr('flag')==1){
                        t.params.sortType = 1;
                        comm.creatEvent({
                            triggerType:'筛选排序',
                            trigger_name:"最新",
                            keyword:that.text(),
                            actionId:57,
                            browsetype_url:getpara().columnId,
                            browsetype:218
                        });
                    }
                    t.dataList();
                }
            });
        },
        dataList:function(){
            var t = this;
            var data = {
                customerId: t.params.customerId,
                categoryId:t.params.tagId,
                specialId: t.params.specialId,
                visitSiteId: 2,
                sortType: t.params.sortType,
                categoryLevel:t.params.grade,
                pageIndex:1,
                pageSize:10
            };
            t.data=data;
            comm.loading.show();
            t.ajaxFn({
                url: "/mcall/special/getSpecialCategoryResourceList/",
                param:{paramJson: $.toJSON(data)},
                fn:function(data) {
                    comm.loading.hide();
                    if(comm.hasResponseData(data)){
                        var data_list = data.responseObject.responseData.data_list;
                        if(data_list.length>0){
                            $('.boneScreen').show();
                            t.loadArticle(data_list);
                        }
                        t.scrollPage();
                    }
                },
                error:function(){
                    comm.loading.hide();
                }
            });
        },
        loadArticle:function(data){
            var template="",type = "",state = "",isExist = "",time = "",show = "",img="",videoTime="",attrUrl="";
            for(var i=0;i<data.length;i++){
                switch (parseInt(data[i].resourceType)){
                    case 1:
                        type='<p>视频</p>';break;
                    case 2:
                        type='<p>文库</p>';break;
                    case 4:
                        type='<p>话题</p>';break;
                    case 7:
                        type='<p>病例</p>';break;
                    case 17:
                        type='<p>电子书</p>';break;
                    case 18:
                        type='<p>文章</p>';break;
                    case 19:
                        type='<p style="width: 2.2rem;">电视书视频</p>';break;
                }

                switch(parseInt(data[i].isNew)){
                    case 0:
                        state = '';break;
                    case 1:
                        state = '<b></b>';break;
                }

                var name ="";
                var hospital ="";

                if(data[i].author != "" || data[i].hospital != ""){
                    if(data[i].author.length>5){
                        name = comm.getStrLen(data[i].author,10);
                    }else{
                        name = data[i].author;
                    }
                    if(data[i].hospital.length>10){
                        hospital = comm.getStrLen(data[i].hospital,20);
                    }else{
                        hospital = data[i].hospital;
                    }
                    isExist = '<div>' +
                    '<img src="'+data[i].logoUrl+'">' +
                    '<span>'+name+'</span>' +
                    '<span>'+hospital+'</span>' +
                    '</div>';
                }else{
                    isExist ='';
                }

                if(data[i].bindingTime !=""){
                    time = comm.date.thirdRule(data[i].bindingTime, comm.date.local_time());
                    show = '<span class="time">'+time+'</span>';
                }else{
                    show = '';
                }

                if(data[i].playTime){
                    videoTime = data[i].playTime;
                }else{
                    videoTime = '';
                }

                if(data[i].resourceType==1){
                    img = '<img src="//img50.allinmd.cn/pages/index/videoPlay_btn.png" alt="">';
                }else{
                    img = '';
                }
                if(data[i].attrUrl){
                    attrUrl = '<div class="detailImg">' +
                    '<img src="'+data[i].attrUrl+'">' +
                    '<i class="al-videoPlayBtn">'+img+'</i>' +
                    '<span class="al-videoTime">'+videoTime+'</span>' +
                    '</div>';
                }else{
                    attrUrl = ''
                }
                template += '<li class="slide-wrapper"><a href="'+data[i].webStoragePath+'">'+type+'<div class="titleImg">' +
                '<div class="titleImg">'+
                '<div class="detailText"'+(data[i].attrUrl!=""?'':'style="width:auto;"')+'><span '+(data[i].hasSceen!=1?'':'style="color:#909090"')+'>'+data[i].resoureName+'</span></div>'+state+''+attrUrl+'</div>'+
                                '<div class="personalCont">'
                                    +isExist+
                                    '<div>' +
                                        '<span class="browse">'+data[i].browseNum.toWKH()+'</span>'+show+'</div>' +
                                '</div>' +
                '</a>' +
                            '</li>';
            }
            $('.boneClassList').show().html(template);
         },
        scrollPage:function () {
            var t=this;
            var pagenumber = 2;
            $(".boneClassList").off("scroll").scrollPagination({
                'contentPage':"/mcall/special/getSpecialCategoryResourceList/",
                'contentData': $.extend(t.data, {
                    pageIndex: function () {
                        //return Math.ceil($('.boneClassList .slide-wrapper').length/6)+1;
                        return pagenumber++;
                    }
                }),
                'moreScroll':true,
                'flag':function(){
                    return $('.slide-wrapper').css('transform')!='none'?Math.abs($('.slide-wrapper').css('transform').split(',')[4])==0:true;
                },
                'scrollTarget': $(window),
                'heightOffset': 0,
                'delaytime': 0,
                'type': "get",
                'beforeLoad': function () {
                    comm.loading.show();
                },
                'afterLoad': function () {
                    comm.loading.hide();
                },
                'loader': function (data) {
                    if ($.isEmptyObject(data)) {
                        $(".boneClassList").attr("scrollPagination", "disabled").parent('.boneClass').append('<section class="lastTime">~  没有更多了  ~</section>');
                        return false;
                    } else {
                        if ($.isEmptyObject(data.responseObject.responseData) || (data.responseObject.responseData.data_list && data.responseObject.responseData.data_list.length == 0)) {
                            $(".boneClassList").attr("scrollPagination", "disabled").append('<section class="lastTime">~  没有更多了  ~</section>');
                            return false;
                        }
                        else {
                            var data = data.responseObject.responseData.data_list;
                            //t.loadArticle(result);
                            var template="",type = "",state = "",isExist = "",time = "",show = "",img="",videoTime="",attrUrl="";
                            for(var i=0;i<data.length;i++){
                                switch (parseInt(data[i].resourceType)){
                                    case 1:
                                        type='<p>视频</p>';break;
                                    case 2:
                                        type='<p>文库</p>';break;
                                    case 4:
                                        type='<p>话题</p>';break;
                                    case 7:
                                        type='<p>病例</p>';break;
                                    case 17:
                                        type='<p>电子书</p>';break;
                                    case 18:
                                        type='<p>文章</p>';break;
                                    case 19:
                                        type='<p style="width: 2.2rem;">电视书视频</p>';break;
                                }

                                switch(parseInt(data[i].isNew)){
                                    case 0:
                                        state = '';break;
                                    case 1:
                                        state = '<b></b>';break;
                                }


                                var name ="";
                                var hospital ="";

                                if(data[i].author != "" || data[i].hospital != ""){
                                    if(data[i].author.length>5){
                                        name = comm.getStrLen(data[i].author,10);
                                    }else{
                                        name = data[i].author;
                                    }
                                    if(data[i].hospital.length>10){
                                        hospital = comm.getStrLen(data[i].hospital,20);
                                    }else{
                                        hospital = data[i].hospital;
                                    }
                                    isExist = '<div>' +
                                    '<img src="'+data[i].logoUrl+'">' +
                                    '<span>'+name+'</span>' +
                                    '<span>'+hospital+'</span>' +
                                    '</div>';
                                }else{
                                    isExist ='';
                                }

                                if(data[i].bindingTime !=""){
                                    time = comm.date.thirdRule(data[i].bindingTime, comm.date.local_time());
                                    show = '<span class="time">'+time+'</span>';
                                }else{
                                    show = '';
                                }

                                if(data[i].playTime){
                                    videoTime = data[i].playTime;
                                }else{
                                    videoTime = '';
                                }

                                if(data[i].resourceType==1){
                                    img = '<img src="//img50.allinmd.cn/pages/index/videoPlay_btn.png" alt="">';
                                }else{
                                    img = '';
                                }
                                if(data[i].attrUrl){
                                    attrUrl = '<div class="detailImg">' +
                                    '<img src="'+data[i].attrUrl+'">' +
                                    '<i class="al-videoPlayBtn">'+img+'</i>' +
                                    '<span class="al-videoTime">'+videoTime+'</span>' +
                                    '</div>';
                                }else{
                                    attrUrl = ''
                                }

                                template += '<li class="slide-wrapper"><a href="'+data[i].webStoragePath+'">'+type+'<div class="titleImg">' +
                                '<div class="titleImg">'+
                                '<div class="detailText"'+(data[i].attrUrl!=""?'':'style="width:auto;"')+'><span '+(data[i].hasSceen!=1?'':'style="color:#909090"')+'>'+data[i].resoureName+'</span></div>'+state+''+attrUrl+'</div>'+
                                '<div class="personalCont">'
                                +isExist+
                                '<div>' +
                                '<span class="browse">'+data[i].browseNum.toWKH()+'</span>'+show+'</div>' +
                                '</div>' +
                                '</a>' +
                                '</li>';
                            }
                            $('.boneClassList').append(template);
                            if(data.length<10){
                                $(".boneClassList").attr("scrollPagination", "disabled").parent('.boneClass').append('<section class="lastTime">~  没有更多了  ~</section>');
                            }
                        }
                    }
                }
            });

        },
        scrollFunc: function () {
            var t = this;
            $(window).bind("scroll", function () {
                t.params.scrolls = $(this).scrollTop();
                if ( t.params.scrolls >= 0) {   //滚动>=0隐藏若提示分享
                    //$(".al-scrollShareBtn .shareTip").attr('style','display:none');
                    if ( t.params.scrolls >= t.params._topHeader) {     //滚动>=固定的头部固定否侧隐藏
                        $('.fixedHeader').attr('style','position:fixed;background: #fff');
                    }else{
                        $('.fixedHeader').attr('style','display:none');
                    }
                    if ( t.params.scrolls >= t.params._top) {   //滚动>=专科让专科固定否则还原默认
                        $(".boneClassNav").css({
                            "position": "fixed",
                            "top": t.params._topHeader,
                            "left": 0,
                            "right": 0,
                            "background": "#fff",
                            "z-index": 2,
                            "margin-top":0
                        }).attr('data-float',1);

                    } else {
                        $(".boneClassNav").attr('style','').removeAttr('data-float');
                    }
                }
            });
        },
        share:function() {
            var t = this;
            var shareObj={};
            shareAll({
                fnMessageSuc: function () {
                    comm.shareLog({
                        shareType: "",
                        resourceId: "",
                        resourceType: "",
                        refId: "",
                        isValid: 1,
                        shareSence: 58,
                        shareChannel: 4,
                        shareContent: shareObj.wxTitle
                    });
                },
                fnTimelineSuc: function () {
                    comm.shareLog({
                        shareType: "",
                        resourceId: "",
                        resourceType: "",
                        refId: "",
                        isValid: 1,
                        shareSence: 58,
                        shareChannel: 5,
                        shareContent: shareObj.timeLineTitle
                    });
                },
                qShareLog: function (x) {
                    if (x === 'qzone') {
                        comm.shareLog({
                            shareType: "",
                            resourceId: "",
                            resourceType: "",
                            refId: "",
                            isValid: 1,
                            shareSence: 58,
                            shareChannel: 1,
                            shareContent: shareObj.summary
                        });
                    } else if (x === 'sina') {
                        comm.shareLog({
                            shareType: "",
                            resourceId: "",
                            resourceType: "",
                            refId: "",
                            isValid: 1,
                            shareSence: 58,
                            shareChannel: 3,
                            shareContent: shareObj.sinaTitle
                        });
                    }
                },
                triggerRequest:function(){
                    $.ajax({
                        url: t.path.share,
                        async:false,
                        data: {paramJson:$.toJSON({
                            sceneType:t.params.sceneType,
                            customerId:localStorage.getItem('userId')||"",
                            resourceType: 0,                               //资源类型传0，代表所有类型
                            platformId:localStorage.getItem('department'),
                            specialId:getpara().columnId
                        })},
                        type:"post",
                        dataType:"json",
                        success:function(data){
                            if(comm.hasResponseData(data)&&data.responseObject.responseData.data_list){
                                var sList = data.responseObject.responseData.data_list[0].share_channel;
                                var list = data.responseObject.responseData.data_list[0].share_comm;
                                var _shareObj = {
                                    title: '',
                                    summary: '',
                                    sinaTitle: '',
                                    wxTitle: '',
                                    wxDesc: ''
                                };
                                _shareObj.pic = list.shareImageUrl;
                                //_shareObj.wxTitle = list.shareTitle!="" ? list.shareTitle : document.title;
                                $(sList).each(function (index, element) {
                                    if (element.shareChannel === 'QZone') {
                                        _shareObj.title = element.shareTitle;
                                        _shareObj.summary = element.shareDesc;
                                    }
                                    if (element.shareChannel === 'Sina') {
                                        _shareObj.sinaTitle = element.shareDesc;
                                    }
                                    if (element.shareChannel === 'WechatFriend') {
                                        _shareObj.wxTitle = element.shareTitle;
                                        _shareObj.wxDesc = element.shareDesc;
                                    }
                                    if (element.shareChannel === 'WechatTimeline') {
                                        _shareObj.timeLineTitle = element.shareTitle;
                                    }
                                });
                                shareObj = _shareObj;
                            }else{
                                $('.al-scrollShareBtn').hide();
                            }
                        }
                    });
                    return shareObj;
                }
            }, false, $('.al-scrollShareBtn'));
            return t;
        },
        ajaxFn:function(obj){
            comm.loading.show();
            $.ajax({
                url: obj.url,
                data: obj.param,
                dataType:'json',
                type:'get',
                success:function(data){
                    comm.loading.hide();
                    if(data){
                        obj.fn(data);
                    }
                }
            })
        },
        renderTemplate:function(templateSelector,data,htmlSelector){
            var templat = $(templateSelector).html();
            var func = Handlebars.compile(templat);
            var str = func(data);
            $(htmlSelector).append(str);
        },
        handCommMethod:function(){
            Handlebars.registerHelper("ellipsis",function(v,len){
                return comm.getStrLen(v,len);
            });
            Handlebars.registerHelper("number",function(v){
                return v.toWKH();
            });
        }
    };
    discoverIndex.init();
});
