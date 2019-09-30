/**
 * 功能描述： 发现—— 申请权威专家
 * 使用方法:
 * 注意事件：	
 * 引入来源：  作用：
 *
 * Created by allinmd-qkl on 2016/08/23.
 */

$(function() {
    var DiscoverAddMaster = function() {
        var that = this;
        var $that = $(this);
        user.privExecute({ //所有页面都要加认证权限
            operateType: 'auth', //'login','auth','conference'
            callback: function() {}
        });
        this.XHRList = {
            apply: '/mcall/customer/pundits/apply/create/'
        };
    };
    DiscoverAddMaster.prototype = {
        init: function() {
            var that = this;
            this.configGiveUpTips();
            this.messageCheck();
            $('.EV-applyUserMsgSend').on('click', function() {
                if ($('.EV-applyUserName').val().length === 0) {
                    popup('请填写申请人');
                    return false;
                }
                if ($('.EV-applyUserPhone').val().length === 0) {
                    popup('请填写手机号');
                    return false;
                }
                if ($('.EV-applyUserReason').val().length === 0) {
                    popup('请填写申请理由');
                    return false;
                }

                if ($('.al-saveBtnBox').hasClass('al-msgWriting')) {
                    return false;
                } else {
                    var phone = $('.EV-applyUserPhone').val();
                    var phoneReg = /^(13[0-9]|14[0-9]|15[0-9]|17[0-9]|18[0-9])\d{8}$/;
                    if (!phoneReg.test($.trim(phone))) {
                        popup('请填写正确的手机号');
                        return false;
                    } else {
                        $(".EV-applyUserMsgSend").unbind("click");
                        that.sendApplyMessage();
                    }
                }
            });

            $(".EV-applyUserName").val(localStorage.getItem('trueName'));
        },
        messageCheck: function() {
            $(".EV-applyUserName,.EV-applyUserPhone,.EV-applyUserReason").on("keyup", function(e) {

                if ($(".EV-applyUserName").val().length === 0 || $(".EV-applyUserPhone").val().length === 0 || $(".EV-applyUserReason").val().length === 0) {
                    $('.al-saveBtnBox').addClass('al-msgWriting');
                } else {
                    $('.al-saveBtnBox').removeClass('al-msgWriting');
                }
            });
            $(".EV-applyUserReason").on("keyup", function() {
            	$(".EV-inputLengthTips").text(500 - parseInt($(".EV-applyUserReason").val().length));
                if (parseInt($(this).val().length) > 450) {
                    $('.EV-inputLengthTips').show();
                   
                    if (parseInt($(".EV-inputLengthTips").text()) <= 0) {
                        $(this).val($(this).val().substring(0, 500));
                        $(".EV-inputLengthTips").text(0);
                        return false;
                    }
                } else {
                    $('.EV-inputLengthTips').hide();
                }
            });
            $('.EV-applyUserReason').on("blur focus",function(){
                if ($('.EV-applyUserReason').val().length>500) {
                    $('.EV-applyUserReason').val($('.EV-applyUserReason').val().substring(0,500));
                }
            });
        },

        sendApplyMessage: function() {
            var applyMessage = {
                customerId: localStorage.getItem('userId'),
                customerName: localStorage.getItem('trueName'),
                applyCustomerName: $('.EV-applyUserName').val(),
                applyMobile: $(".EV-applyUserPhone").val(),
                applyReason: $('.EV-applyUserReason').val(),
                updatePlatformId:TempCache.getItem('department')
            };
            $.ajax({
                    url: this.XHRList.apply,
                    type: 'POST',
                    dataType: 'json',
                    timeout: 10000,
                    data: {
                        paramJson: $.toJSON(applyMessage)
                    }
                })
                .done(function(data) {
                    if (data.responseObject.responseStatus) {
                        comm.alertBox({
                            title: "发送成功<br />请静候佳音",
                            ensure: "继续浏览",
                            ensureCallback:function(){
                                window.location='/pages/discover/discover_expert.html';
                            }
                        });
                    } else {
                        sendError();
                    }
                }).fail(function() {
                    sendError();
                });
        },
        configGiveUpTips: function() {
            $(".EV-configGiveUp").on('click', function(e) {
                $('.EV-configGiveUpTipsBox').addClass('on');
                comm.creatEvent({
                    triggerType:'全站功能按钮点击',
                    keyword:"返回",
                    actionId:41,
                    async:false
                });
                $('.EV-cancelBtn,.EV-continueConfig').on('click', function() {
                    $('.EV-configGiveUpTipsBox').removeClass('on');
                });

                $('.EV-giveUpConfig').on("click", function() {
                    $('.EV-configGiveUpTipsBox').removeClass('on');
                    window.location = "/pages/discover/discover_expert.html";
                });
            });
        }
    };
    var discoverAddMaster = new DiscoverAddMaster();

    discoverAddMaster.init();
});
