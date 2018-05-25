var moretab = false;
(function() {
	$(".nav-tabs").on('click', 'a',function(){
		$(".nav-tabs a").removeClass("active");
		$(this).addClass("active");
	});
	
		
	var count = 0;
	//var moretab = false;
		
	$("#addtabbtn").on('click', function(){
		console.log("addtabbtn");
		
		$(".nav-tabs a").removeClass("active");
		$(".tab-content div").removeClass("active");
		
		$(".nav-tabs .page-tabs-content").append($('<a data-toggle="tab">').attr("href","#tab"+count).addClass('active menu_tab').data('ref', 'tab'+count).attr('tabid', 'tab'+count)
			.append($("<span>").html('tab'+count))
			.append($('<i class="fa fa-remove page_tab_close" style="cursor: pointer"></i>').on('click', function(){
				console.log("close..............");
				closeCurrentTab(this);
				return false;
			})).contextify(options));
			
		$(".tab-content").append($('<div class="tab-pane fade in active">').attr("id", "tab"+count).append($("<p>").html('vvvvvvvvvvvvv:::tab'+count)));
		
		$("#tab_list").append($("<li>").data("ref", "tab"+count).append($("<a>").html('tab'+count)).on('click', function(){
			var ref = $(this).data("ref");
			
			$(".page-tabs-content .active").removeClass("active");
			$(".tab-content div.active").removeClass('active');
			
			$(".page-tabs-content a[tabid='"+ref+"']").addClass("active");
			$(".tab-content div[id='"+ref+"']").addClass('active');
			scroll2Tab($(".page-tabs-content .active"));
		}));
		count++;
		
		
		var tabOuterWidth = calSumWidth($(".content-tabs").children().not(".menuTabs"));
		var visibleWidth = $(".content-tabs").outerWidth(true) - tabOuterWidth;
		if(moretab){			
			var scrollVal = calSumWidth($(".page-tabs-content a:last").prevAll())-visibleWidth+$(".page-tabs-content a:last").prev().outerWidth(true);
			scrollVal +=20;
			$('.page-tabs-content').animate({
                marginLeft: 0 - scrollVal + 'px'
            }, "fast");
			
		}else{
			if ($(".page-tabs-content").width() >= visibleWidth) {
				moretab=true;
				var scrollVal = $(".nav-tabs .page-tabs-content .active").outerWidth(true);
				$('.page-tabs-content').animate({
					marginLeft: 0 - scrollVal + 'px'
				}, "fast");
				
				$(".tabLeft, .tabRight, .btn-group").show();
				$(".content-tabs nav.page-tabs").addClass('more-tabs');
			}
		}
		
	});
	
	$(".tabLeft, .tabRight, .btn-group").hide();
	
		
	var contextMenuTab;
	var options = {
			items: [{
					text: '<div id="tabClose"><span class="glyphicon glyphicon-remove red"></span> close</div>',
					onclick: function(e) {
						
						closeCurrentTab($(contextMenuTab).find("i"));
						
					}
				},
				{
					text: '<span style="margin-left:17px;"></span> closeOthers' ,
					onclick: function(e) {
						var ref = $(contextMenuTab).data('ref');
						if($(contextMenuTab).hasClass('inittab')){
							$(contextMenuTab).parent().find('a').not(contextMenuTab).remove();
						}else{
							$(contextMenuTab).parent().find('a').not(contextMenuTab).not(':first').remove();
						}
						
						
						$(".tab-content div").not($("#"+ref)).not(':first').remove();
						$("#tab_list li").not("li[ref='"+ref+"']").not(":first").remove();
						
						moretab=false;
						$('.page-tabs-content').animate({
							marginLeft: '0px'
						}, "fast");
						$(".tabLeft, .tabRight, .btn-group").hide();
						$(".content-tabs nav.page-tabs").removeClass('more-tabs');
						
						$(contextMenuTab).addClass("active");
						$(".tab-content div#"+ref).addClass('active');
					}
				},
				{
					text: '<span style="margin-left:17px;"></span> closeAll' ,
					onclick: function(e) {
						$(contextMenuTab).parent().find('a').not(':first').remove();
						
						$(".tab-content div").not(':first').remove();	
						$("#tab_list li").not(":first").remove();
						
						moretab=false;
						$('.page-tabs-content').animate({
							marginLeft: '0px'
						}, "fast");
						$(".tabLeft, .tabRight, .btn-group").hide();
						$(".content-tabs nav.page-tabs").removeClass('more-tabs');
						
						$(".page-tabs-content a:first").addClass("active");
						$(".tab-content div:first").addClass('active');
					}
				},
				{
					divider: true
				},
				{
					text: '<span style="margin-left:17px;"></span> closeRight' ,
					onclick: function(e) {
						//$(contextMenuTab).nextAll().find('i.page_tab_close').trigger('click');
						var ref = $(contextMenuTab).data('ref');
						console.log("closeOthers ... ref:"+ref);
						$(contextMenuTab).nextAll('a').remove();
						$(".tab-content div#"+ref).nextAll("div").remove();	
						$("#tab_list li[ref='"+ref+"']").nextAll().remove();
						
						if($(contextMenuTab).prev('a.active').length==0){
							$(contextMenuTab).addClass('active');
							$(".tab-content div:first").addClass('active');
							$(".tab-content div#"+ref).addClass('active');	
						}
						
						
						var tabOuterWidth = calSumWidth($(".content-tabs").children().not(".menuTabs"));
						var visibleWidth = $(".content-tabs").outerWidth(true) - tabOuterWidth;
						if ($(".page-tabs-content").width() >= visibleWidth) {
							moretab=true;
							var scrollVal = $(".nav-tabs .page-tabs-content .active").outerWidth(true);
							scrollVal = calSumWidth($(contextMenuTab).prevAll())+scrollVal-visibleWidth+20;
							$('.page-tabs-content').animate({
								marginLeft: 0 - scrollVal + 'px'
							}, "fast");
							
							$(".tabLeft, .tabRight, .btn-group").show();
							$(".content-tabs nav.page-tabs").addClass('more-tabs');
						}else{
							
							$(".tabLeft, .tabRight, .btn-group").hide();
							$(".content-tabs nav.page-tabs").removeClass('more-tabs');
							$('.page-tabs-content').animate({
								marginLeft: '0px'
							}, "fast");
							moretab=false;
						}
						
					}
				},
				{
					text: '<span style="margin-left:17px;"></span> closeLeft' ,
					onclick: function(e) {
						//$(contextMenuTab).parent().prevAll().find('i.page_tab_close').trigger('click');
						var ref = $(contextMenuTab).data('ref');
						$(contextMenuTab).prevAll().not(":last").remove();
						$(".tab-content div#"+ref).prevAll().not(":last").remove();
						
						var tabOuterWidth = calSumWidth($(".content-tabs").children().not(".menuTabs"));
						var visibleWidth = $(".content-tabs").outerWidth(true) - tabOuterWidth;
						if ($(".page-tabs-content").width() >= visibleWidth) {
							moretab=true;
							var scrollVal = $(".nav-tabs .page-tabs-content .active").outerWidth(true);
							scrollVal = calSumWidth($(contextMenuTab).prevAll())+scrollVal-visibleWidth+20;
							$('.page-tabs-content').animate({
								marginLeft: 0 - scrollVal + 'px'
							}, "fast");
							
							$(".tabLeft, .tabRight, .btn-group").show();
							$(".content-tabs nav.page-tabs").addClass('more-tabs');
						}else{
							$(".tabLeft, .tabRight, .btn-group").hide();
							$(".content-tabs nav.page-tabs").removeClass('more-tabs');
							$('.page-tabs-content').animate({
								marginLeft: '0px'
							}, "fast");
							moretab=false;
						}
						
						
					}
				},
				{
					divider: true
				},
				{
					text: '<span class="glyphicon glyphicon-refresh green"></span> reload' ,
					onclick: function(e){
						EasyBootstrapTabs.refreshTab($(contextMenuTab).attr('href').substring(1));
					}
				}
			],
			before: function(o, options) {
				contextMenuTab = o;
				if($(o).find('i.page_tab_close').length == 0) {
					setTimeout(function() {
						$('#tabClose span').removeClass('red');
						var tabParent = $('#tabClose').parent();
						tabParent.parent().addClass('disabled');
						tabParent.css({
							'color': '#C6C6C6',
							'cursor': 'default'
						});
					}, 0)
				} else {
					setTimeout(function() {
						$('#tabClose sapn').addClass('red');
						var tabParent = $('#tabClose').parent();
						tabParent.parent().removeClass('disabled');
						tabParent.css({
							'color': '#333333',
							'cursor': 'pointer'
						});
					}, 0)
				}
					
			}
		}
	$('.page-tabs-content a').contextify(options);
	

})();

function closeCurrentTab(ele){
	console.log('closeCurrentTab....'); 
	
	if(!$(ele).parent().hasClass("active")){//如果关闭不是当前TAB
		var ref = $(ele).parent().data("ref");
		
		$(ele).parent().remove();						
		$(".tab-content div#"+ref).remove();	
		$("#tab_list li[ref='"+ref+"']").remove();
		
		return;
	}
	
	var lastone = false;
	var next_active_tab = $(".page-tabs-content .active").next('a');
	console.log("next_active111_tab:"+next_active_tab.length);
	if(next_active_tab.length==0){
		next_active_tab = $(".page-tabs-content .active").prev('a');
		lastone = true;
	}
	
	var page_tabs_content_width = $(".page-tabs-content").width();
	
	var ref = $(".page-tabs-content .active").data("ref");
	$(".page-tabs-content .active, .tab-content .active").remove();	
	$("#tab_list li[ref='"+ref+"']").remove();
	
	next_active_tab.addClass("active");
	$(".tab-content div[id='"+next_active_tab.data('ref')+"']").addClass('active');
	
	if(lastone){
		var tabOuterWidth = calSumWidth($(".content-tabs").children().not(".menuTabs"));
		var visibleWidth = $(".content-tabs").outerWidth(true) - tabOuterWidth;
		if(moretab){
			var scrollVal = $(".nav-tabs .page-tabs-content .active").outerWidth(true);
			if (page_tabs_content_width- visibleWidth>scrollVal) {
				$('.page-tabs-content').animate({
					marginLeft: (visibleWidth -$(".page-tabs-content").width()-20)+ 'px'
				}, "fast");
				
			}else{
				moretab=false;
				$('.page-tabs-content').animate({
					marginLeft: '0px'
				}, "fast");
				$(".tabLeft, .tabRight, .btn-group").hide();
				$(".content-tabs nav.page-tabs").removeClass('more-tabs');
			}
			
		}
	}
	
	
}

function findTabTitle(pageId) {
    var $ele = null;
    $(".page-tabs-content").find("a.menu_tab").each(function () {
        var $a = $(this);
        if ($a.attr(pageIdField) == pageId) {
            $ele = $a;
            return false;//退出循环
        }
    });
    return $ele;
}

//计算多个jq对象的宽度和
var calSumWidth = function (element) {
    var width = 0;
    $(element).each(function () {
        width += $(this).outerWidth(true);
    });
    return width;
};


var scroll2Tab = function (element) {
    //element是tab(a标签),装有标题那个
    //div.content-tabs > div.page-tabs-content
    var marginLeftVal = calSumWidth($(element).prevAll()),//前面所有tab的总宽度
        marginRightVal = calSumWidth($(element).nextAll());//后面所有tab的总宽度
    //一些按钮(向左,向右滑动)的总宽度
    var tabOuterWidth = calSumWidth($(".content-tabs").children().not(".menuTabs"));
    // tab(a标签)显示区域的总宽度
    var visibleWidth = $(".content-tabs").outerWidth(true) - tabOuterWidth;
    //将要滚动的长度
    var scrollVal = 0;
	if(marginLeftVal+$(element).next().outerWidth(true) < visibleWidth){
		scrollVal = 0;
	}else {
		if(marginRightVal-(element).outerWidth(true) < visibleWidth){
			scrollVal = marginLeftVal;
			var tabElement = element;
			if(marginRightVal+$(tabElement).outerWidth(true)+$(tabElement).prev().outerWidth(true)<=visibleWidth){
				while (marginRightVal+$(tabElement).outerWidth(true)+$(tabElement).prev().outerWidth(true)<=visibleWidth) {
					scrollVal -= $(tabElement).outerWidth();
					marginRightVal+=$(tabElement).outerWidth();
					tabElement = $(tabElement).prev();
				}
			}else{
				scrollVal = marginLeftVal-$(element).outerWidth(true)-$(element).prev().outerWidth(true);
			}
		}else{
			scrollVal = marginLeftVal-$(element).outerWidth(true)-$(element).prev().outerWidth(true);
		}
		
	}
    //执行动画
    $('.page-tabs-content').animate({
        marginLeft: 0 - scrollVal + 'px'
    }, "fast");
};

var scrollToTab = function (element) {
    //element是tab(a标签),装有标题那个
    //div.content-tabs > div.page-tabs-content
    var marginLeftVal = calSumWidth($(element).prevAll()),//前面所有tab的总宽度
        marginRightVal = calSumWidth($(element).nextAll());//后面所有tab的总宽度
    //一些按钮(向左,向右滑动)的总宽度
    var tabOuterWidth = calSumWidth($(".content-tabs").children().not(".menuTabs"));
    // tab(a标签)显示区域的总宽度
    var visibleWidth = $(".content-tabs").outerWidth(true) - tabOuterWidth;
    //将要滚动的长度
    var scrollVal = 0;
    if ($(".page-tabs-content").outerWidth(true) < visibleWidth) {
        //所有的tab都可以显示的情况
        scrollVal = 0;
    } else if (marginRightVal <= (visibleWidth - $(element).outerWidth(true) - $(element).next().outerWidth(true))) {
        //向右滚动
        //marginRightVal(后面所有tab的总宽度)小于可视区域-(当前tab和下一个tab的宽度)
        if ((visibleWidth - $(element).next().outerWidth(true)) > marginRightVal) {
            scrollVal = marginLeftVal;
            var tabElement = element;
            while ((scrollVal - $(tabElement).outerWidth()) > ($(".page-tabs-content").outerWidth() - visibleWidth)) {
                scrollVal -= $(tabElement).prev().outerWidth();
                tabElement = $(tabElement).prev();
            }
        }
    } else if (marginLeftVal > (visibleWidth - $(element).outerWidth(true) - $(element).prev().outerWidth(true))) {
        //向左滚动
        scrollVal = marginLeftVal - $(element).prev().outerWidth(true);
    }
    //执行动画
    $('.page-tabs-content').animate({
        marginLeft: 0 - scrollVal + 'px'
    }, "fast");
};

//滚动条滚动到左边
var scrollTabLeft = function () {
	console.log("scrollTabLeft.....");
	
	if($(".menu_tab:first").hasClass("active")){//已是第一个
		return false;
	}
	
    var marginLeftVal = Math.abs(parseInt($('.page-tabs-content').css('margin-left')));
    var tabOuterWidth = calSumWidth($(".content-tabs").children().not(".menuTabs"));
    var visibleWidth = $(".content-tabs").outerWidth(true) - tabOuterWidth;
    var scrollVal = 0;
    if ($(".page-tabs-content").width() < visibleWidth) {
        return false;
    } else {
        var tabElement = $(".menu_tab:first");
        var offsetVal = 0;
        while ((offsetVal + $(tabElement).outerWidth(true)) <= marginLeftVal) {
            offsetVal += $(tabElement).outerWidth(true);
            tabElement = $(tabElement).next();
        }
        offsetVal = 0;
        if (calSumWidth($(tabElement).prevAll()) > visibleWidth) {
            while ((offsetVal + $(tabElement).outerWidth(true)) < (visibleWidth) && tabElement.length > 0) {
                offsetVal += $(tabElement).outerWidth(true);
                tabElement = $(tabElement).prev();
            }
            scrollVal = calSumWidth($(tabElement).prevAll());
        }
    }
    $('.page-tabs-content').animate({
        marginLeft: 0 - scrollVal + 'px'
    }, "fast");
};
//滚动条滚动到右边
var scrollTabRight = function () {
	console.log("scrollTabRight.....");
	
	if($(".menu_tab:last").hasClass("active")){//已是最后一个
		return false;
	}
	
    var marginLeftVal = Math.abs(parseInt($('.page-tabs-content').css('margin-left')));
    var tabOuterWidth = calSumWidth($(".content-tabs").children().not(".menuTabs"));
    var visibleWidth = $(".content-tabs").outerWidth(true) - tabOuterWidth;
    var scrollVal = 0;
    if ($(".page-tabs-content").width() < visibleWidth) {
        return false;
    } else {
        var tabElement = $(".menu_tab:first");
        var offsetVal = 0;
        while ((offsetVal + $(tabElement).outerWidth(true)) <= marginLeftVal) {
            offsetVal += $(tabElement).outerWidth(true);
            tabElement = $(tabElement).next();
        }
        offsetVal = 0;
        while ((offsetVal + $(tabElement).outerWidth(true)) < (visibleWidth) && tabElement.length > 0) {
            offsetVal += $(tabElement).outerWidth(true);
            tabElement = $(tabElement).next();
        }
        scrollVal = calSumWidth($(tabElement).prevAll());
        if (scrollVal > 0) {
            $('.page-tabs-content').animate({
                marginLeft: 0 - scrollVal + 'px'
            }, "fast");
        }
    }
};