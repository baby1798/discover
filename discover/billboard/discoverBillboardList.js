/**
* @name:
* @desc:
* @example:
* @depend:
* @date: 2017/04/19
* @author: allinmd-zh
*/
$(document).ready(function () {
    var tool = {
       "getUrlName": function (name) {
           var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
           var r = window.location.search.substr(1).match(reg);
           if (r != null)return unescape(r[2]);
           return null;
       }
   };
    if(getpara().listType==0){
        window.onload = Log.createBrowse(176, '贡献榜');
    }else if(getpara().listType==1){
        window.onload = Log.createBrowse(177, '活跃榜');
    }else if(getpara().listType==2){
        window.onload = Log.createBrowse(178, '推荐榜');
    }
   var arrange = {
       ele: {
           "describe":"页面初始化存在的静态元素",
           "rule":$(".ev-checkRule"),//查看规则按钮
           "tab":$(".ev-tabRank"),//顶部个榜单tab栏
           "contributions":$(".al-contributions"),
           "recommendTab":$(".ev-recommendTabRank"),//推荐榜单下面的分类tab栏
           "rankContainer":$(".al-rankContainer .al-rankList"),//榜单html容器
           "banner":$(".al-rankBanner img"),
           "customerObj":$("#sesCustomerId"),
           "auth":$("#sesAuth"),
           "praise":null,
           "upBillBoard":$(".iWant"),
           "returnBack":$(".al-indexHeaderItem a"),
           "billboardUser":$(".billboard .al-rankBanner"),  //用户自己帮单容器
           "toggle":$(".listMore")   //展开关闭按钮
       },
       template:{
           "describe":"页面所有逻辑使用的字符串模板",
           produce:function(type,data){
               /*
                * 函数名称：produce
                * 描述：产生html字符串，不做任何逻辑判断
                * 参数说明：
                * -------1、type,规定要产生的模板类型，string,必须
                * -------2、data，动态数据，array,必须
                * 返回值说明：
                *  -------1、htmlStr，返回相应类型的html字符串，string
                * */
               //调用示例：produce("pay",data)
               var str = "";
               for(var typeNum = 0;typeNum<type.length;typeNum++){
                   str+=this.demo[type[typeNum]];
               }
               String.prototype.temp = function(obj) {
                   return this.replace(/\$\w+\$/gi, function(matchs) {
                       var returns = obj[matchs.replace(/\$/g, "")];
                       return (returns + "") == "undefined"? "": returns;
                   });
               };
               var htmlStr = "";
               for(var i = 0;i<data.length;i++){
                   htmlStr+=str.temp(data[i]);
               }
               return htmlStr;
           },
           "demo":{
               "describe0":
               '<p>周贡献 <span>$totalNum$</span>（被浏览数 $browseNum$）</p></aside></a></li>',
               "describe1":"<ul class=\"describeLi\">"+
               "	<li>评论<span>$reviewNum$</span></li>"+
               "	<li>分享<span>$shareNum$</span></li>"+
               "	<li>浏览<span>$browseNum$</span></li>"+
               "</ul>"+
               "</aside>"+
               "</a>"+
               "</li>",
               "rank":"<li data-userId='$customerId$'>"+
               "<a href=\"/pages/personal/others_contribution.html?cid=$customerId$\">"+
               "<i class=\"$rankIcon$ placing placingIcon rankIcon\">$customerRanking$</i>"+
               "<img src=\"$logoUrl$\" alt=\"\">"+
               "<aside class=\"describe\">"+
               "<p class=\"$rankStateClass$\">"+
               "$fullName$<i>$rankStateDes$</i>"+
               "</p>"+
               "<p>"+
               "	$medicalTitleShow$<span>$company$</span>"+
               "</p>"
           }
       },
       ajaxPort:{
           "describe":"整个页面使用到的接口",
           "list":"/mcall/customer/toplist/getTopList/",  //list.json
           "praise":"/mcall/customer/prefer/createTop/",  //点赞列表praise.json
           "scrollList":"/mcall/customer/pundits/getPunditsCustomerList/",//推荐榜列表scroll.json
           "contributions":"/mcall/customer/resource/toplist/getResTopList/",//"contributions.json",
           "share":"/mcall/comm/data/share/getMapList3/",
           "banner":"/mcall/customer/toplist/getToplistBanner/"
       },
       parameter:{
           "describe":"整个页面使用到的全局变量",
           "indexType":parseInt(tool.getUrlName("listType")),//展示界面类型，1贡献榜，2，活跃榜，3，推荐榜
           "recommendType":"",//推荐榜界面类型，0全部，1关节，2脊柱，3创伤，4其他,
           "rankData":[],
           "ranking":[],
           "recommendData":[[],[],[],[],[]],
           "pageIndex":[0,0,[0,0,0,0,0]],
           "contributions":[],
           "sceneType":75,
           "in":"", //记录展示条数
           "identity":"",
           "nums":1
       },
       singleDom: function(elei,ev_operate) {
           var attLength = elei.picNum;
           var attUrl = '';
           if (attLength != 0) {
               attUrl = elei.picUrl.split('|');
               for(var i= 0,l=attUrl.length;i<l;i++){
                   if(attUrl[i].indexOf('http')==-1){
                       attUrl.splice(i,1);
                   }
               }
               attLength = attUrl.length;
           }
           var _html = module.indexListTem.list({
               refType: elei.itemType,
               resUrl: elei.itemUrl,
               resName: elei.itemTitle,
               resDesc: elei.itemAbstract,
               isAward: elei.resourceSign,
               isAttend: elei.isAttend,
               isNew: elei.isNew,
               isHot: elei.isHot,
               tplPath: elei.tplPath,
               resAuthor: elei.ownerName,
               resWatchCount: elei.browseNum.toWKH(),
               attUrl: attUrl,
               attLength: attLength,
               id: elei.itemId,
               playTime: elei.playTime?elei.playTime.substring(0,8):"",
               videoType:elei.videoType,
               score:elei.currentStarLevel,
               scoreNum:elei.currentScoreNum,
               ev_operate:ev_operate,
               resourceSign:elei.resourceSign
           });
           return _html;
       },
       tool:{
           "describe":"整个页面纯方法型函数",
           "exhibition":function () {
               /*
                * 函数名称：exhibition
                * 描述：根据榜单的点击展示不同的界面
                * 参数说明：
                * -------1、type,展示榜单界面的类型,number,必须
                * 返回值说明：
                *  无返回值
                *  */
               //调用示例：
               //exhibition(0)
               var t = arrange;
               if(t.parameter.indexType<2){
                   t.manageData.applyData({
                       port: t.ajaxPort.list,
                       postData: {
                           platformId:localStorage.getItem('department'), //平台id，1-骨科，1-手外
                           toplistType:parseInt(tool.getUrlName("listType"))+1,  //榜单类型，1-贡献
                           customerId:localStorage.getItem('userId')||"", //用户id
                           logoUseFlag:10,//固定传10就好
                           pageIndex:1,
                           pageSize:10
                       },
                       success: function (data) {
                           if(data.responseObject.responseData.top_list.length<10){
                               $('.listMore').attr("style","display:none");
                           }
                           //这是在页面展示排行前三名的类别
                           $.each(data.responseObject.responseData.top_list,function(index,value){
                               switch(parseInt(value.customerRanking)){
                                   case 1:
                                       value.rankIcon="first";
                                       value.customerRanking="";
                                       break;
                                   case 2:
                                       value.rankIcon="second";
                                       value.customerRanking="";
                                       break;
                                   case 3:
                                       value.rankIcon="third";
                                       value.customerRanking="";
                                       break;
                               }
                               if(value.isNew==1){
                                   value.rankStateClass="new";
                                   value.rankStateDes="最新";
                               }
                               if(value.specialType>=5){
                                   value.rankStateClass="continuity";
                                   value.rankStateDes='连续'+value.specialType+'周';
                               }
                               if(value.isNew==1 && value.specialType>=5){
                                   value.rankStateClass="continuity";
                                   value.rankStateDes='连续'+value.specialType+'周';
                               }
                               var newLogoUrl=value.logoUrl.substr(6,value.logoUrl.length);
                               value.logoUrl=newLogoUrl;
                               var browse=value.browseNum.toWKH();
                               var share=value.shareNum.toWKH();
                               var review=value.reviewNum.toWKH();
                               var total=value.totalNum.toWKH();
                               value.browseNum=browse;
                               value.shareNum=share;
                               value.reviewNum=review;
                               value.totalNum=total;
                               var s = comm.getStrLen(value.company,28);
                               value.company=s;
                           });
                           var describeType = t.parameter.indexType;
                               t.parameter.rankData = data.responseObject.responseData.top_list;
                               t.ele.rankContainer.html(t.template.produce(["rank","describe"+describeType],t.parameter.rankData));
                               var data = data.responseObject.responseData.my_top_list;
                               if($.isEmptyObject(data)){
                                   t.parameter.sceneType=75;
                               }else{
                                   if(data.customerRanking==0 || data.customerRanking>20){
                                       t.parameter.sceneType=75;
                                   }else if(data.customerRanking<20){
                                       t.parameter.sceneType=74;
                                   }
                               }
                               var rankLevel = parseInt(data.customerRanking);
                               var auth = parseInt(data.isAuthed);
                               var str="";
                               var message="",rank="";
                               if(tool.getUrlName("listType")==0){
                                   if(rankLevel>20 || rankLevel==0){
                                       message="发布更多资源可跻身榜单";
                                       rank="未上榜";
                                       str='<figure class="rankingNone">'+rank+'</figure></section>';
                                   }else{
                                       if(rankLevel==1){
                                           message="发布更多资源可保持排名";
                                           rank='第'+data.customerRanking+'名';
                                       }else{
                                           message="发布更多资源可提高排名";
                                           rank='第'+data.customerRanking+'名';
                                       }
                                       str='<figure class="ranking">'+rank+'</figure></section>';
                                   }
                                   str= '<section class="billboardUser">'+
                                   '   <a href="/pages/personal/personal_index.html?cid='+data.customerId+'">'+
                                   '       <img src='+data.logoUrl+' alt="">'+
                                   '   <aside class="describe">'+
                                   '       <p>'+data.fullName+'</p>'+
                                   '       <p>周贡献'+data.totalNum+'</p>'+
                                   '       <p>'+message+'</p>'+
                                   '   </aside>'+
                                   '   </a>'+str;
                                   if(user.getLoginStatus() && auth==1){
                                       t.ele.billboardUser.after(str);
                                   }
                               }else if(tool.getUrlName("listType")==1){
                                   if(rankLevel>20 || rankLevel==0){
                                       message="评论/分享/浏览更多资源可跻身榜单";
                                       rank="未上榜";
                                       str='<figure class="rankingNone">'+rank+'</figure></section>';
                                   }else{
                                       if(rankLevel==1){
                                           message="评论/分享/浏览更多资源可保持排名";
                                           rank='第'+data.customerRanking+'名';
                                       }else{
                                           message="评论/分享/浏览更多资源可提高排名";
                                           rank='第'+data.customerRanking+'名';
                                       }
                                       str='<figure class="ranking">'+rank+'</figure></section>';
                                   }
                                   str='<section class="billboardUser">'+
                                   '   <a href="/pages/personal/personal_index.html?cid='+data.customerId+'">'+
                                   '       <img src='+data.logoUrl+' alt="">'+
                                   '   <aside class="describe">'+
                                   '       <p>'+data.fullName+'</p>'+
                                   '       <ul class="describeLi">'+
                                   '           <li>评论<span>'+data.reviewNum+'</span></li>'+
                                   '           <li>分享<span>'+data.shareNum+'</span></li>'+
                                   '           <li>浏览<span>'+data.browseNum+'</span></li>'+
                                   '       </ul>'+
                                   '       <p>'+message+'</p>'+
                                   '   </aside>'+
                                   '   </a>'+str;
                                   if(user.getLoginStatus() && auth==1){
                                       t.ele.billboardUser.after(str);
                                   }
                               }
                           t.tool.newShare();
                           },failed:function() {
                                t.tool.newShare();
                                t.ele.rankContainer.empty().append('<li class="listNone"><img src="/images/img50/pages/discover/billboard/listNone.png"></li>');
                                $('.listMore').attr("style", "display:none").nextAll().remove();
                           }
                   });
               }
               return t;
           },
           "theirCon": function () {
               var t = arrange;
               t.manageData.applyData({
                   port: t.ajaxPort.contributions,
                   postData: {
                       platformId:localStorage.getItem('department'),           //平台id，1-骨科，1-手外
                       toplistType:parseInt(tool.getUrlName("listType"))+1||"",       //榜单类型，1-贡献
                       customerId:localStorage.getItem('userId')||"",               //用户id
                       logoUseFlag:1
                    },
                   success: function (data) {
                       if(data.responseObject.responseStatus){
                           if(tool.getUrlName("listType")==0) {
                               $('.billboardListDetail').prepend('<section class="title">他们贡献了</section>');
                           }else if(tool.getUrlName("listType")==1){
                               $('.billboardListDetail').prepend('<section class="title">他们评论了</section>');
                           }
                       }
                       t.parameter.contributions = data.responseObject.responseData.data_list;
                       var resultHtml = "";
                       $.each(t.parameter.contributions,function(index,el){
                           if (el.itemType == 1 || el.itemType == 2 || el.itemType == 4 || el.itemType == 7) {
                               resultHtml+=t.singleDom(el);
                           }
                       });
                       t.ele.contributions.html(resultHtml);
                       $(".ev_recBox").attr("scrollPagination", "disabled").append('<section class="listNoMore">~  没有更多了  ~</section>');
                       $(".ev_recBox .al-contentDelete").remove();
                   }
               });
               return t;
           },
           "newShare":function() {
               var t = arrange;
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
                           url: t.ajaxPort.share,
                           async:false,
                           data: {paramJson:$.toJSON({
                               customerId:localStorage.getItem('userId')||"",
                               sceneType:t.parameter.sceneType,          // 74代表本人已上榜分享，75本人未上榜分享
                               resourceType: 0,                               //资源类型传0，代表所有类型
                               platformId:localStorage.getItem('department'),
                               toplistType:parseInt(tool.getUrlName("listType"))+1
                           })},
                           type:"post",
                           dataType:"json",
                           success:function(data){
                               if(comm.hasResponseData(data)&&data.responseObject.responseData.data_list){
                                   var sList = data.responseObject.responseData.data_list[0].share_channel;
                                   var _shareObj = {
                                       title: '',
                                       summary: '',
                                       sinaTitle: '',
                                       wxTitle: '',
                                       wxDesc: ''
                                   };
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
           }
       },
       handle:{
           "describe":"整个页面操作型函数",
           upBillBoard:function(){
               var t = arrange;
               t.ele.upBillBoard.off("click").on("click",function(){
                   window.onload = Log.createBrowse(179, '申请上榜页');
                   window.location.href = "//m.allinmd.cn/pages/discover/billboard/i_want.html";
               });
               return t;
           },//推荐榜点击跳转上榜页面
           "setBanner":function () {
               var t = arrange;
               var data = function(parameter){
                   if(tool.getUrlName("listType")==0 && localStorage.getItem('department')==1){
                       parameter=444;
                   }else if(tool.getUrlName("listType")==0 && localStorage.getItem('department')==2){
                       parameter=459;
                   }else if(tool.getUrlName("listType")==1 && localStorage.getItem('department')==1){
                       parameter=445;
                   }else if(tool.getUrlName("listType")==1 && localStorage.getItem('department')==2){
                       parameter=460;
                   }else if(tool.getUrlName("listType")==2 && localStorage.getItem('department')==1){
                       parameter=446;
                   }else if(tool.getUrlName("listType")==2 && localStorage.getItem('department')==2){
                       parameter=461;
                   }
                   return parameter;
               };
               var date = new Date();
               var updateTime = 7-date.getDay()+1;
                   t.manageData.applyData({
                       port: t.ajaxPort.banner,
                       postData: {
                           customerId:localStorage.getItem('userId')||"",
                           isValid:1,
                           toplistType:parseInt(tool.getUrlName("listType"))+1,
                           platformId:localStorage.getItem('department'),
                           adPositionId:data()
                       },
                       success: function(data){
                           var str="";
                           $.each(data.responseObject.responseData.data_list[0],function(index,data){
                               if(tool.getUrlName("listType")==0){
                                   str= '<a href='+data[0].linkUrl+'>'+
                                        '   <img src='+data[0].adAttUrl+'>'+
                                        '</a>'+
                                        '<figcaption><i></i>贡献榜将于'+updateTime+'天后更新</figcaption>';
                               }else if(tool.getUrlName("listType")==1){
                                   str= '<a href='+data[0].linkUrl+'>'+
                                        '   <img src='+data[0].adAttUrl+'>'+
                                        '</a>'+
                                   '    <figcaption><i></i>活跃榜将于'+updateTime+'天后更新</figcaption>';
                               }else if(tool.getUrlName("listType")==2){
                                   str= '<a href='+data[0].linkUrl+'>'+
                                        '   <img src='+data[0].adAttUrl+'>'+
                                        '</a>'+
                                        '<figcaption><i></i>推荐榜整点更新排名</figcaption>';
                               }
                           });
                           t.ele.billboardUser.html(str);
                       }
                   });
               return t;
           },
           "toggle":function(){
             var t = arrange;
               t.ele.toggle.off('click').on('click',function(){
                   t.parameter.nums++;
                   var params,comdata;
                   if(tool.getUrlName("listType")==0||tool.getUrlName("listType")==1){
                       params=t.ajaxPort.list;
                       comdata={
                           platformId:localStorage.getItem('department'), //平台id，1-骨科，1-手外
                           toplistType:parseInt(tool.getUrlName("listType"))+1,  //榜单类型，1-贡献
                           customerId:localStorage.getItem('userId')||"", //用户id
                           logoUseFlag:10,  //固定传10就好
                           pageIndex: t.parameter.nums,
                           pageSize:10
                       }
                   }else if(tool.getUrlName("listType")==2){
                       params=t.ajaxPort.scrollList;
                       comdata={
                           logoUseFlag:4,
                           sortType:8,
                           sessionCustomerId:localStorage.getItem('userId')||"",
                           visitSiteId:1,
                           platformId:localStorage.getItem('department'),
                           punditsGroup:t.parameter.recommendType,
                           pageIndex: t.parameter.nums,
                           pageSize:10
                       }
                   }
                   if($(this).hasClass("down")){
                       var
                           moreRank = function(){
                           $('.listMore').removeClass('down').addClass("up").html("收起排名<i></i>").off('click').on('click',function(){
                               t.parameter.nums=1;
                               //$('.pageRemove').remove();
                               t.ele.rankContainer.find('li[class=pageHide]').attr('style','display:none');
                               $(this).removeClass("up").html("更多排名<i></i>");
                               t.handle.toggle();
                           });
                       };
                       t.manageData.applyData({
                           port:params,
                           postData:comdata,
                           success:function(data){
                               if(data.responseObject.responseData.top_list) {
                                   $.each(data.responseObject.responseData.top_list, function (index, value) {
                                       if (value.isNew == 1) {
                                           value.rankStateClass = "new";
                                           value.rankStateDes = "最新";
                                       } else if (value.specialType >= 5) {
                                           value.rankStateClass = "continuity";
                                           value.rankStateDes = '连续' + value.specialType + '周';
                                       }
                                       var newLogoUrl = value.logoUrl.substr(6, value.logoUrl.length);
                                       value.logoUrl = newLogoUrl;
                                       var browse = value.browseNum.toWKH();
                                       var share = value.shareNum.toWKH();
                                       var review = value.reviewNum.toWKH();
                                       var total = value.totalNum.toWKH();
                                       value.browseNum = browse;
                                       value.shareNum = share;
                                       value.reviewNum = review;
                                       value.totalNum = total;
                                       var s = comm.getStrLen(value.company,28);
                                       value.company=s;
                                   });
                               }
                               if(data.responseObject.responseData.data_list){
                                   t.parameter.in+=data.responseObject.responseData.data_list.length;
                                   if(t.parameter.in>=50){
                                       t.parameter.in=10;
                                       moreRank();
                                   }
                                   var str="";
                                   $.each(data.responseObject.responseData.data_list, function (index, value) {
                                       var s = comm.getStrLen(value.customerPunditsEntity.company,22);
                                       value.customerPunditsEntity.company=s;
                                       var newLogoUrl=value.customerAtt.logoUrl.substr(6,value.customerAtt.logoUrl.length);
                                       value.customerAtt.logoUrl=newLogoUrl;
                                       var isTopStatus="";
                                       if(value.other.isTopStatus==1){
                                           isTopStatus="active";
                                       }else if(value.other.isTopStatus==0){
                                           isTopStatus="";
                                       }
                                       if($.isEmptyObject(value.customerStatistic)){
                                           value.customerStatistic.fansNum="";
                                           value.customerStatistic.contributionCount="";
                                           value.customerStatistic.topicNum="";
                                       }
                                       if(value.customerStatistic.contributionCount==0){
                                           contributionCount = '贡献<span>'+value.customerStatistic.contributionCount+'</span>';
                                       }else{
                                           contributionCount = '贡献<span>'+value.customerStatistic.contributionCount.toWKH()+'</span>';
                                       }
                                       if(value.customerStatistic.fansNum==0){
                                           fansNum = '粉丝<span>'+value.customerStatistic.fansNum+'</span>';
                                       }else{
                                           fansNum = '粉丝<span>'+value.customerStatistic.fansNum.toWKH()+'</span>';
                                       }
                                       if(value.customerStatistic.topicNum==0){
                                           topicNum = '';
                                       }else{
                                           topicNum = '评论<span>'+value.customerStatistic.topicNum.toWKH()+'</span>';
                                       }

                                       str+='<li data-userid="'+value.customerPunditsEntity.customerId+'">'+
                                            '   <a href="/pages/personal/others_contribution.html?cid='+value.customerPunditsEntity.customerId+'">'+
                                            '       <i class="'+value.other.states+' placing">'+ value.other.customerRanking+'</i>'+
                                            '       <img src='+value.customerAtt.logoUrl+' alt="">'+
                                            '       <aside class="describe">'+
                                            '           <p>'+value.customerPunditsEntity.customerName+'</p>'+
                                            '           <p>'+value.customerPunditsEntity.medicalTitleShow+'<span>'+value.customerPunditsEntity.company+'</span></p>'+
                                            '           <ul class="describeLi">'+
                                            '               <li>'+contributionCount+'</li>'+
                                            '               <li>'+fansNum+'</li>'+
                                            '               <li>'+topicNum+'</li>'+
                                            '           </ul>'+
                                            '       </aside>'+
                                            '   </a>'+
                                            '   <aside class="crown '+isTopStatus+'"><i>顶</i>'+value.other.topNum.toWKH()+'</aside></li>';
                                   });
                                   t.ele.rankContainer.append(str);
                               }
                               var describeType = t.parameter.indexType;
                               if(describeType>1){
                                   t.parameter.ranking = data.responseObject.responseData.data_list;
                                   if(t.parameter.ranking.length<10){
                                       moreRank();
                                   }
                                   t.ele.rankContainer.find('li[data-userid]').each(function(i){
                                       if(i>9){
                                           $(this).addClass('pageHide');
                                       }
                                   })
                                   t.handle.praise();
                               }else{
                                   t.parameter.rankData = data.responseObject.responseData.top_list;
                                   if(t.parameter.rankData.length<10){
                                       moreRank();
                                   }
                                   t.ele.rankContainer.append(t.template.produce(["rank","describe"+describeType],t.parameter.rankData));
                                   t.ele.rankContainer.find('li[data-userid]').each(function(i){
                                       if(i>9){
                                           $(this).addClass('pageHide');
                                       }
                                   })
                               }
                           },
                           failed:function(data){
                                    moreRank();
                           }
                       });
                   }else{
                       if(t.ele.toggle.hasClass("up")){
                           t.ele.rankContainer.find('li[style]').attr("style","display:none");
                           $('.listMore').removeClass("up").html("更多排名<i></i>")
                       }else{
                           t.ele.rankContainer.find('li[style]').attr("style","display:block");
                           $('.listMore').addClass("up").html("收起排名<i></i>");
                       }
                   }
               });
               return t;
           },
           //设置banner ,Tab切换那个页面就换成那个页面的banner
           "checkRule":function () {
               var t = arrange;
               t.ele.rule.off("click").on("click",function () {
                   //查看规则
                   window.onload = Log.createBrowse(180, '榜单规则');
                   window.location.href = "//m.allinmd.cn/pages/discover/billboard/discover_billboard_rule.html";
               });
               return t;
           },//点击跳转规则页面
           "changeTab":function () {
               var t = arrange;
               t.ele.tab.off("click").on("click",function () {
                   g_sps.jump($(this),$(this).attr("data-href"));
               });
               return t;
           },//顶部Tab切换选项
           "changeRecommend":function () {
               var t = arrange;
               var titleHeader = $(".allTitle");
               var titleList = $(".titleList");
               titleHeader.on("click",function(e){
                   e.preventDefault();
                   titleList.toggle();
                   $(this).toggleClass('up')
               });
               var describeType = t.parameter.indexType;
               if(describeType==2){
                   t.manageData.applyData({
                       port: t.ajaxPort.scrollList,
                       postData: {
                           logoUseFlag:4,
                           sortType:8,
                           sessionCustomerId:localStorage.getItem('userId')||"",
                           visitSiteId:1,
                           platformId:localStorage.getItem('department'),
                           punditsGroup: t.parameter.recommendType,
                           pageIndex:1,
                           pageSize:10
                       },
                       success: function (data) {
                           if(data.responseObject.responseData.my_top_list.customerRole==3 || data.responseObject.responseData.my_top_list.customerRole==0){
                               t.parameter.identity=true;
                           }
                           if(data.responseObject.responseData.data_list.length<10){
                               $('.listMore').attr("style","display:none");
                           }
                           t.parameter.in=data.responseObject.responseData.data_list.length;
                           var str="";
                           if(data.responseObject.responseData.data_list) {
                               $.each(data.responseObject.responseData.data_list, function (index, value) {
                                   var newLogoUrl = value.customerAtt.logoUrl.substr(6, value.customerAtt.logoUrl.length);
                                   value.customerAtt.logoUrl = newLogoUrl;
                                   if (value.other.customerRanking == 1) {
                                       value.other.states = "first";
                                       value.other.customerRanking = "";
                                   } else if (value.other.customerRanking == 2) {
                                       value.other.states = "second";
                                       value.other.customerRanking = "";
                                   } else if (value.other.customerRanking == 3) {
                                       value.other.states = "third";
                                       value.other.customerRanking = "";
                                   }

                                   var isTopStatus = "";
                                   if (value.other.isTopStatus == 1) {
                                       isTopStatus = "active";
                                   } else if (value.other.isTopStatus == 0) {
                                       isTopStatus = "";
                                   }
                                   var topicNum;
                                   if(value.customerStatistic.topicNum==0){
                                       topicNum = '';
                                   }else{
                                       topicNum = '评论<span>'+value.customerStatistic.topicNum.toWKH()+'</span>';
                                   }
                                   var s = comm.getStrLen(value.customerPunditsEntity.company,22);
                                   value.customerPunditsEntity.company=s;

                                   str+='<li data-userid="' + value.customerPunditsEntity.customerId + '">'+
                                        '   <a href="/pages/personal/others_contribution.html?cid=' + value.customerPunditsEntity.customerId + '">'+
                                        '       <i class="' + value.other.states + ' placing">' + value.other.customerRanking + '</i>'+
                                        '       <img src=' + value.customerAtt.logoUrl + ' alt="">'+
                                        '       <aside class="describe">'+
                                        '           <p>' + value.customerPunditsEntity.customerName + '</p>'+
                                        '           <p>' + value.customerPunditsEntity.medicalTitleShow + '<span>' + value.customerPunditsEntity.company + '</span></p>'+
                                        '           <ul class="describeLi">'+
                                        '               <li>贡献<span>'+value.customerStatistic.contributionCount.toWKH()+'</span></li>'+
                                   '                    <li>粉丝<span>'+value.customerStatistic.fansNum.toWKH()+'</span></li>'+
                                   '                    <li>'+topicNum+'</li>'+
                                        '           </ul>'+
                                        '       </aside>'+
                                        '   </a>'+
                                        '   <aside class="crown ' + isTopStatus + '"><i>顶</i>' + value.other.topNum.toWKH() + '</aside>'+
                                        '</li>';
                               });
                           }
                           t.ele.rankContainer.html(str);
                           t.handle.praise();
                           var mydata=data.responseObject.responseData.my_top_list;
                           if($.isEmptyObject(mydata)){
                               t.parameter.sceneType=75;
                           }else{
                               if(mydata.customerRanking==0 || mydata.customerRanking>20){
                                   t.parameter.sceneType=75;
                               }else if(mydata.customerRanking<20){
                                   t.parameter.sceneType=74;
                               }
                           }
                           t.tool.newShare();
                       },
                       failed:function() {
                           t.tool.newShare();
                           $('.titleCont').remove();
                           $(".billboardList").attr("style","padding-bottom:rem");
                           t.ele.rankContainer.empty().append('<li class="listNone"><img src="/images/img50/pages/discover/billboard/listNone.png"></li>');
                           $('.listMore').attr("style", "display:none").nextAll().remove();
                       }
                   })
               }
               t.ele.recommendTab.off("click").on("click", function () {
                   $(this).attr("style","color:#2899E6").siblings().removeAttr("style");
                   titleHeader.html("<span >"+$(this).html()+"</span><i></i>");
                   titleList.toggle();
                   t.parameter.nums=1;
                   t.parameter.recommendType = parseInt($(this).attr("data-recommendType"));
                   if(isNaN(t.parameter.recommendType)){
                       t.parameter.recommendType="";
                   }
                       $(".ev-recommendTabRank.active").removeClass("active");
                       $(this).addClass("active");
                           t.manageData.applyData({
                               port: t.ajaxPort.scrollList,
                               postData: {
                                   logoUseFlag:4,
                                   sortType:8,
                                   sessionCustomerId:localStorage.getItem('userId')||"",
                                   visitSiteId:1,
                                   platformId:localStorage.getItem('department'),
                                   punditsGroup: t.parameter.recommendType
                               },
                               success: function (data) {
                                   if(data.responseObject.responseData.my_top_list.customerRole==3 || data.responseObject.responseData.my_top_list.customerRole==0){
                                       t.parameter.identity=true;
                                   }
                                   var data = data.responseObject.responseData.data_list;

                                   if(data.length<10){
                                       $('.listMore').attr("style","display:none");
                                       $('.billboardList').attr("style","padding-bottom:2rem");
                                   }else{
                                       $('.listMore').removeClass('up').addClass('down').attr("style","display:block").html("更多排名<i></i>");
                                       t.handle.toggle();
                                       $('.billboardList').attr("style","padding-bottom:2rem");
                                   }
                                   $('.listNoMore').remove();
                                   var str="";
                                   if(data.length<2){
                                       $('.billboardList').attr("style","padding-bottom:5rem");
                                   }
                                   $.each(data,function(index,value){
                                       if(value.other.customerRanking==1){
                                           value.other.states="first";
                                           value.other.customerRanking="";
                                       }else if(value.other.customerRanking==2){
                                           value.other.states="second";
                                           value.other.customerRanking="";
                                       }else if(value.other.customerRanking==3){
                                           value.other.states="third";
                                           value.other.customerRanking="";
                                       }
                                       if(value.other.isTopStatus==1){
                                           isTopStatus="active";
                                       }else if(value.other.isTopStatus==0){
                                           isTopStatus="";
                                       }
                                       var topicNum;
                                       if(value.customerStatistic.topicNum==0){
                                           topicNum = '';
                                       }else{
                                           topicNum = '评论<span>'+value.customerStatistic.topicNum.toWKH()+'</span>';
                                       }
                                       var s = comm.getStrLen(value.customerPunditsEntity.company,22);
                                       value.customerPunditsEntity.company=s;
                                       str+='<li data-userid="'+value.customerPunditsEntity.customerId+'">'+
                                            '   <a href="/pages/personal/others_contribution.html?cid='+value.customerPunditsEntity.customerId+'">'+
                                            '       <i class="'+value.other.states+' placing">'+value.other.customerRanking+'</i>'+
                                            '       <img src='+value.customerAtt.logoUrl+' alt="">'+
                                            '   <aside class="describe">'+
                                            '       <p>'+value.customerPunditsEntity.customerName+'</p>'+
                                            '       <p>'+value.customerPunditsEntity.medicalTitleShow+'<span>'+value.customerPunditsEntity.company+'</span></p>'+
                                            '       <ul class="describeLi">'+
                                            '           <li>贡献<span>'+value.customerStatistic.contributionCount.toWKH()+'</span></li>'+
                                       '                <li>粉丝<span>'+value.customerStatistic.fansNum.toWKH()+'</span></li>'+
                                       '                <li>'+topicNum+'</li>'+
                                            '       </ul>'+
                                            '   </aside>'+
                                            '   </a>'+
                                            '   <aside class="crown '+isTopStatus+'"><i>顶</i>'+value.other.topNum.toWKH()+'</aside>'+
                                            '</li>';
                                   });
                                   t.ele.rankContainer.html(str);
                                   t.handle.praise();

                               },failed:function(){
                                   t.ele.rankContainer.empty().append('<li class="listNone"><img src="/images/img50/pages/discover/billboard/listNone.png"></li>');
                                   $('.listMore').attr("style","display:none").nextAll().remove();
                                   $(".billboardList").attr("style","padding-bottom:rem");
                               }
                           });
               });
               return t;
           },
           "praise":function () {
               var t = arrange;
               t.ele.praise = $(".crown");
               t.ele.praise.off("click").on("click",function(){
                   var isThis = $(this);
                   var text = $(this).text();
                   var num = text.substr(1,text.length);
                   user.privExecute({
                           operateType: 'auth',
                           callback: function () {
                               if(!t.parameter.identity){
                                   if(!isThis.hasClass("active")){
                                       t.manageData.applyData({
                                           port: t.ajaxPort.praise,
                                           postData: {
                                               customerId:localStorage.getItem('userId'),
                                               usefulType:10,            //赞类型（1-视频，2-文库，3-会议， 10-顶人）
                                               upDownType:2,           //赞、踩 类型(0踩,1赞,2顶)
                                               refId:isThis.parent().attr("data-userId"),             //被顶人的id
                                               visitSiteId:2,
                                               platformId:localStorage.getItem('department')
                                           },
                                           success: function (data) {
                                               var praiseOnOff = data.responseObject.responseStatus;
                                               if(praiseOnOff){
                                                   var praiseNum = parseInt(num)+1;
                                                   var testRex = /[\u4e07]|[\u5343]/g;
                                                   var testStr = isThis.html();
                                                   if(testRex.test(testStr)){
                                                       isThis.addClass("active");
                                                   }else{
                                                       isThis.addClass("active").html('<i>顶</i>' + praiseNum + '');
                                                   }
                                                   popup("已点赞");
                                               }
                                           }
                                       });
                                   }else{
                                       popup("每天只能顶一次哦");
                                   }
                               }
                           }
                       });

               });
               return t;
           }//点赞
       },
       manageData:{
           "describe":"整个页面操作数据型函数",
           "applyData":function(options){
               /*
                * 函数名称：applyData
                * 描述：关于ajax参数请求的二次封装
                * 参数说明：
                * -------1、options是一个对象
                * options字段说明：
                * -------1、get,请求方式，boolean,可选，不传默认为get方式
                * -------2、port,请求接口，string,必须，
                * -------3、postData,请求参数，json,必须，
                * -------4、failed,请求失败的回调，function,可选，
                * -------5、success,请求成功的回调，function,可选，
                * 返回值说明：
                *  无返回值
                *  */
               //调用示例：
               // t.applyData({
               //     port: port,
               //     postData: option.initData,
               //     success: function (data) {
               //     },
               //     failed: function () {
               //     }
               // });
               var postType = (options.get) ? "GET" : "POST";//默认是post方式，除非特别传参指名要get方式。
               var postData = {"paramJson": $.toJSON(options.postData)};
               $.ajax({
                   url: options.port,    //请求的url地址
                   dataType: "json",   //返回格式为json
                   async: options.async?options.async:true, //请求是否异步，默认为异步，这也是ajax重要特性
                   data: postData,    //参数值
                   type: postType,   //请求方式
                   beforeSend: function () {
                       comm.loading.show();
                       //请求前的处理
                   },
                   success: function (data) {
                       //请求成功时处理
                       var realNoData = ((data.responseObject.responseMessage) == "NO DATA");
                       var realStatus = data.responseObject.responseStatus;
                       var len = (data.responseObject.responseData.data_list)?(data.responseObject.responseData.data_list.length==0):false;
                       if (realNoData || !realStatus || len) {
                           options.failed && options.failed(data);
                       } else {
                           options.success && options.success(data);
                       }
                   },
                   complete: function () {
                       comm.loading.hide();
                       //请求完成的处理
                   },
                   error: function () {
                       //请求出错处理
                   }
               });
           },
           "unique":function(arrOr,key) {
               /*
                * 函数名称：unique
                * 描述：这个方法试用于数组下面每项均为json，json内有唯医键值来标识该项，依赖此唯一键值对其进行去重
                * 参数说明：
                * -------1、arr,准备去重的数组，array，必须
                * -------2、key，依赖的键名，string,必须
                * 返回值说明：
                *  -------1、array,返回一个去重就得新数组
                * */
               var arr = JSON.parse(JSON.stringify(arrOr));
               //调用示例：
               var newArr = [];
               var len = arr.length;
               var isRepeat;

               for(var i=0; i<len; i++) {  //第一次循环
                   isRepeat = false;
                   for(var j=i+1; j<len; j++) {  //第二次循环
                       if(arr[i][key] === arr[j][key]){
                           isRepeat = true;
                           break;
                       }
                   }
                   if(!isRepeat){
                       newArr.push(arr[i]);
                   }
               }
               return newArr;
           }
       },
       init:function(){
           var t = this;
           t.handle.checkRule().handle.changeTab().handle.setBanner().tool.exhibition().tool.theirCon().handle.changeRecommend().handle.upBillBoard().handle.toggle();
           //初始化展示榜单，查看规则注册事件，顶部tab切换注册事件，推荐榜单注册事件;
           $('.ev_backBtn').click(function(){
               comm.creatEvent({
                   triggerType:'全站功能按钮点击',
                   keyword:"返回",
                   actionId:41,
                   async:false
               });
               history.back();
           });
           $('.al-contentDelete').removeClass();
       }
   };
   arrange.init();
});

