/**
 * 功能描述：  发现——首页
 * 使用方法:
 * 注意事件：
 * 引入来源：  作用：发现页改版
 *
 * Created by Administrator on 2016/08/18.
 */

$(function() {
    var discoverList = {
        params:{
            customerId:TempCache.getItem('userId')||'',
            platformId : TempCache.getItem('department')||1,
            queryTime:0,
            data:""
        },
        path:{
            list: '/mcall/special/getSpecialList/',
            follow: "/mcall/customer/follow/resource/create/",       //关注
            cancelFollow:"/mcall/customer/follow/resource/delete/"  //取消关注
        },
        init: function() {
            var t = this;
            window.onload = Log.createBrowse(217, '特色栏目列表页');
            t.content();
        },
        content:function(){
            var t = this;
            var data = {
                "customerId": t.params.customerId,
                "sortType":"1",
                "isValid":"1",
                "platformId": t.params.platformId,
                "pageIndex":1,
                "pageSize":10
            };
            t.params.data=data;
            $.ajax({
                url: t.path.list ,
                type:'GET',
                dataType:'json',
                data:{
                    paramJson: $.toJSON(data)
                },
                beforeSend:function(){
                    comm.loading.show();
                },
                success:function(data){
                    if(comm.hasResponseData(data)){
                        var item = data.responseObject.responseData.data_list;
                        if(item.length>0){
                            var timeLabel = function(vl){
                                if(vl){
                                    var newTime = comm.date.diffDay_one(vl, comm.date.local_time());
                                    return  newTime;
                                }
                            };
                            var followLabel = function(v1,v2,options){
                                if(v1==v2){

                                    return options.fn(this);

                                }else{
                                    return options.inverse(this);
                                }
                            };
                            Handlebars.registerHelper("ellipsis",function(v,len){
                                return comm.getStrLen(v,len);
                            });
                            Handlebars.registerHelper("time",timeLabel);
                            Handlebars.registerHelper("follow",followLabel);
                            t.renderTemplate('#table-template',data.responseObject.responseData,".characteristicColumn");
                            t.followClickFunc();
                            t.scrollPage();
                        }
                    }
                },
                complete:function(){
                    comm.loading.hide();
                },
                error: function () {
                    console.log("XHR error...");
                }
            })
        },
        followClickFunc: function () {
            var t = this;
            $(".Ev-FollowBtn").off("click").on("click", function () {       //关注，点击进行关注
                var that = $(this);
                user.privExecute({
                    operateType: 'auth',
                    callback: function () {
                        if(that.hasClass('active')){
                            $('.al-unfollow').addClass('on');
                            $('#EV-unfollowBtn').off("click").on("click",function(){
                                comm.creatEvent({
                                    triggerType:'关注',
                                    keyword:that.prev().text(),
                                    actionId:11022,
                                    browsetype:217
                                });
                                $.ajax({
                                    url: t.path.cancelFollow,
                                    data:{paramJson: $.toJSON({
                                        "refId": that.attr('follow-id'),
                                        "followType":"8",
                                        "refName": that.prev().text(),
                                        "customerId": t.params.customerId
                                    })
                                    },
                                    type:"post",
                                    dataType:"json",
                                    success: function (data) {
                                        if (data && data.responseObject && data.responseObject.responseStatus) {
                                            $('.al-unfollow').removeClass('on');
                                            that.removeClass('active').html('关注');
                                        }
                                    },
                                    error: function () {
                                        comm.loading.hide();
                                    }
                                });
                            });
                            $('#EV-cancelUploadImg').off("click").on("click",function(){
                                $('.al-unfollow').removeClass('on');
                            });
                        }else{
                            comm.creatEvent({
                                triggerType:'关注',
                                keyword:that.prev().text(),
                                actionId:11022,
                                push_message_id:that.attr('follow-id'),
                                browsetype:217
                            });
                            $.ajax({
                                url: t.path.follow,
                                data:{paramJson: $.toJSON({
                                    "refId": that.attr('follow-id'),
                                    "followType":"8",
                                    "refName": that.prev().text(),
                                    "customerId": t.params.customerId
                                })
                                },
                                success:function(data) {
                                    comm.loading.hide();
                                    if (data && data.responseObject && data.responseObject.responseStatus) {
                                        popup('已关注');
                                        that.addClass('active').html('已关注');
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
        scrollPage:function () {
            var t=this;
            var pagenumber = 2;
            $(".discoverV2").off("scroll").scrollPagination({
                'contentPage': t.path.list,
                'contentData': $.extend(t.params.data, {
                    pageIndex: function() {
                        return pagenumber++;
                    }
                }),
                'scrollTarget': $(window),
                //'heightOffset': $(window).height(),
                'delaytime': 0,
                'type': "get",
                'dataType': "json",
                'beforeLoad': function () {
                    comm.loading.show();
                },
                'afterLoad': function () {
                    comm.loading.hide();
                },
                'loader': function(data) {
                    comm.loading.hide();
                    if ($.isEmptyObject(data)) {
                        $(".discoverV2").attr("scrollPagination", "disabled").append('<section class="lastTime">~  到底了  ~</section>');
                        //alert("没有内容了");
                        return false;
                    } else {
                        if ($.isEmptyObject(data.responseObject.responseData) || (data.responseObject.responseData.data_list && data.responseObject.responseData.data_list.length == 0)) {
                            $(".discoverV2").attr("scrollPagination", "disabled").append('<section class="lastTime">~  到底了  ~</section>');
                            //alert("没有内容了2");
                            return false;
                        } else {
                            var items = data.responseObject.responseData;
                            t.params.queryTime++;
                            t.renderTemplate('#table-template',items,".characteristicColumn");
                            t.followClickFunc();
                            if (items.data_list.length < t.params.queryTime) {
                                $(".discoverV2").attr("scrollPagination", "disabled").append('<section class="lastTime">~  到底了  ~</section>');
                                return false;
                            }
                        }
                    }
                }
            });
        },
        renderTemplate:function(templateSelector,data,htmlSelector){
                var templat = $(templateSelector).html();
                var func = Handlebars.compile(templat);
                var str = func(data);
                $(htmlSelector).append(str);
        }
    };
    discoverList.init();
});
