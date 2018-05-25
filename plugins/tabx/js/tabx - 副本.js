(function( $ ) {
	"use strict";
    var pluginName = 'tabx';
    var defaultId=1000000;
    var moretab = false;
    var contextMenuTab;

    var default_tab={
    	text:'默认页面',
    	url:'#',
    	closeable:true,
    	ele:'',
    	id:defaultId+''
    };
    var defaults = {
        confirmRemove: null,
        postSuccess: null,
        postFail: null,
		matchOptionsByText: false,
		displayTitle: 'click to edit',
		data: null,
		showIndex: 0, //默认显示页索引
		marginRight:30
    };
		
	// The actual plugin constructor
    function Tabx(element, options) {
        this.element = element;
		this.$element = $(element);
        this.options = $.extend({}, defaults, options);
        this._defaults = defaults;
		this.url='';

		
		//element
		this.tab_container=null;
		this.tab_content=null;
		this.tab_list_btn = null;
		window._isFullScreen = false;

        this.init();
    }
	
	Tabx.prototype.contextmenu = {
		options : {
			items: [{
					text: '<div id="tabClose"><span class="glyphicon glyphicon-remove red"></span> close</div>',
					onclick: function(e) {
						//console.log(this);
						//Tabx.
					}
				},
				{
					text: '<span style="margin-left:17px;"></span> closeOthers' ,
					onclick: function(e) {
					}
				},
				{
					text: '<span style="margin-left:17px;"></span> closeAll' ,
					onclick: function(e) {
					}
				},
				{
					divider: true
				},
				{
					text: '<span style="margin-left:17px;"></span> closeRight' ,
					onclick: function(e) {
						
					}
				},
				{
					text: '<span style="margin-left:17px;"></span> closeLeft' ,
					onclick: function(e) {
						
					}
				},
				{
					divider: true
				},
				{
					text: '<span class="glyphicon glyphicon-refresh green"></span> reload' ,
					onclick: function(e){
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
	}
	
	Tabx.prototype.init = function () {
		if (!this.options.data || this.options.data.length == 0) {
            console.error("请指定tab页数据");
            return;
        }
        var $this = this;
        //当前显示的显示的页面是否超出索引
        if (this.options.showIndex < 0 || this.options.showIndex > this.options.data.length - 1) {
            //console.error("showIndex超出了范围");
            //指定为默认值
            this.options.showIndex = this.default.showIndex;
        }
		
        this.tab_container = $('<div class="page-tabs-content">').css('margin-left', '0px');
        this.tab_content = $('<div class="tab-content" id="tab-content">');
        this.tab_list_btn = $('<ul class="dropdown-menu dropdown-menu-right" id="tab_list">');

        var tab;

        if(this.options.data && this.options.data.length>0){
        	var id='';
        	var tmpele='';
        	for(var i=0; i<this.options.data.length; i++){
        		tab = this.options.data[i];
        		tab.id = !tab.id || tab.id==''?generateTabId():tab.id+'';

        		tmpele = this.initTab(tab);
        		
        		if(this.options.showIndex==i){
        			tmpele.addClass("active");
        		} 
        		this.tab_container.append(tmpele);

				//add tab content
				tmpele = $('<div class="tab-pane fade in">').attr('id', "iframe_"+tab.id);
				if(this.options.showIndex==i){
					tmpele.addClass('active');
				}
				tmpele.append($("<p>").html(tab.id));//TODO
				this.tab_content.append(tmpele);

				//add listbtn
				//this.tab_list_btn.append($('<li></li>').append($('<a>').html(tab.id)));//TODO
				this.tab_list_btn.append($("<li>").data("ref", tab.id).append($("<a>").html(tab.id)).on('click', function(){
					var ref = $(this).data("ref");
					$this.selectTab(ref);
				}));
        	}

        }

        this.$element.append($('<div class="content-tabs">')
        	.append($('<button class="roll-nav roll-left tabLeft">').append($('<i class="fa fa-backward">'))
        		.on('click', $.proxy(this.scrollTabLeft, this)))//leftbtn
        	.append($('<nav class="nav nav-tabs page-tabs menuTabs" id="tab-menu">').append(this.tab_container))//tabs
        	.append($('<button class="roll-nav roll-right tabRight">').append($('<i class="fa fa-forward">'))
        		.on('click', $.proxy(this.scrollTabRight, this)))//rightbtn
        	.append($('<div class="btn-group roll-nav roll-right">')
        		.append($('<button class="dropdown tabClose" data-toggle="dropdown">').append($('<i class="fa fa-caret-down">')))
        		.append(this.tab_list_btn)
        		)//dorpbtn
        	.append($('<button class="roll-nav roll-right fullscreen"><i class="fa fa-arrows-alt"></i></button>')
        		.on('click', $.proxy(this.fullScreen, this)))//max
        	)//tab-tools
        .append($('<div class="content-iframe " style="background-color: #ffffff; ">').append(this.tab_content));//iframe

        //隐藏左右按钮
        $(".tabLeft, .tabRight, .btn-group").hide();

    };

    //初始化TAB页面
    Tabx.prototype.initTab = function(obj){
    	var $this = this;
    	var tmpele='';
    	/*var id = !obj.id || obj.id==''?generateTabId():obj.id+'';*/
    	//add tab
		tmpele = $('<a class="menu_tab" data-toggle="tab">').attr('href','#'+obj.id).data('ref',obj.id).attr('id', pluginName+'_'+obj.id).append($("<span>").html(!obj.text || obj.text==''?obj.id:(obj.text+"-"+obj.id)));
		if(obj.closeable){
			tmpele.append($('<i class="fa fa-remove page_tab_close" style="cursor: pointer"></i>').on('click', function(){
				console.log("close.closeCurrentTab.............");
				$this.closeCurrentTab(this);
				return false;
			}));
		}
		
		tmpele.on('click', function(){
			$(".nav-tabs a").removeClass("active");
			$(this).addClass("active");
		}).contextify(this.contextmenu.options);
		return tmpele;
    }

    //计算多个jq对象的宽度和
    Tabx.prototype.calSumWidth  = function (element) {
	    var width = 0;
	    $(element).each(function () {
	        width += $(this).outerWidth(true);
	    });
	    return width;
	};

	//add tab
    Tabx.prototype.addTab = function (obj) {
    	var $this = this;
    	if(!obj){
    		default_tab.id = !obj.id || obj.id==''?generateTabId():obj.id;
    		default_tab.text = default_tab.id;
    		obj = default_tab;
    	}else{
    		if(!obj.id || obj.id==''){
    			obj.id = generateTabId();
    		}
    		if(!obj.text || obj.text==''){
    			obj.text = obj.id;
    		}
    	}
		
		$(".nav-tabs a").removeClass("active");
		$(".tab-content div").removeClass("active");
		var tmpele = this.initTab(obj).addClass('active');

		this.tab_container.append(tmpele);
					
		this.tab_content.append($('<div class="tab-pane fade in active">').attr("id", obj.id).append($("<p>").html('vvvvvvvvvvvvv:::'+obj.id)));
		
		this.tab_list_btn.append($("<li>").data("ref", obj.id).append($("<a>").html(obj.id)).on('click', function(){
			var ref = $(this).data("ref");
			$this.selectTab(ref);
		}));
		
		
		var tabOuterWidth = this.calSumWidth($(".content-tabs").children().not(".menuTabs"));
		var visibleWidth = $(".content-tabs").outerWidth(true) - tabOuterWidth;
		if(moretab){			
			var scrollVal = this.calSumWidth($(".page-tabs-content a:last").prevAll())-visibleWidth+$(".page-tabs-content a:last").prev().outerWidth(true);
			scrollVal +=this.options.marginRight;
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

    }

    Tabx.prototype.selectTab = function(ref){    	
		$(".page-tabs-content .active").removeClass("active");
		$(".tab-content div.active").removeClass('active');
		
		$(".page-tabs-content a#"+pluginName+"_"+ref).addClass("active");
		$(".tab-content div#iframe_"+ref).addClass('active');
		this.scroll2Tab($(".page-tabs-content .active"));
    }

    //关闭指字的TAB
    Tabx.prototype.closeCurrentTab = function(ele){
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
			var tabOuterWidth = this.calSumWidth($(".content-tabs").children().not(".menuTabs"));
			var visibleWidth = $(".content-tabs").outerWidth(true) - tabOuterWidth;
			if(moretab){
				var scrollVal = $(".nav-tabs .page-tabs-content .active").outerWidth(true);
				if (page_tabs_content_width- visibleWidth>scrollVal) {
					$('.page-tabs-content').animate({
						marginLeft: (visibleWidth -$(".page-tabs-content").width()-this.options.marginRight)+ 'px'
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

    //找到指定的TAB
    Tabx.prototype.findTabTitle = function(pageId){
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

    //滚动条滚动到指定的TAB
    Tabx.prototype.scroll2Tab = function (element) {
	    //element是tab(a标签),装有标题那个
	    //div.content-tabs > div.page-tabs-content
	    var marginLeftVal = this.calSumWidth($(element).prevAll()),//前面所有tab的总宽度
	        marginRightVal = this.calSumWidth($(element).nextAll());//后面所有tab的总宽度
	    //一些按钮(向左,向右滑动)的总宽度
	    var tabOuterWidth = this.calSumWidth($(".content-tabs").children().not(".menuTabs"));
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

	//滚动条滚动到左边
	Tabx.prototype.scrollTabLeft = function () {
		console.log("scrollTabLeft.....");		
	    var marginLeftVal = Math.abs(parseInt($('.page-tabs-content').css('margin-left')));
		if(marginLeftVal==0){//已是第一个
			debug('已是最左边.....');
			return false;
		}
	    var tabOuterWidth = this.calSumWidth($(".content-tabs").children().not(".menuTabs"));
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
	        if (this.calSumWidth($(tabElement).prevAll()) > visibleWidth) {
	            while ((offsetVal + $(tabElement).outerWidth(true)) < (visibleWidth) && tabElement.length > 0) {
	                offsetVal += $(tabElement).outerWidth(true);
	                tabElement = $(tabElement).prev();
	            }
	            scrollVal = this.calSumWidth($(tabElement).prevAll());
	        }
	    }
	    $('.page-tabs-content').animate({
	        marginLeft: 0 - scrollVal + 'px'
	    }, "fast");
	};

	//滚动条滚动到右边
	Tabx.prototype.scrollTabRight = function () {
		console.log("scrollTabRight.....");
		
	    var marginLeftVal = Math.abs(parseInt($('.page-tabs-content').css('margin-left')));
	    var tabOuterWidth = this.calSumWidth($(".content-tabs").children().not(".menuTabs"));
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
	        scrollVal = this.calSumWidth($(tabElement).prevAll());
	        if (scrollVal > 0) {
	            $('.page-tabs-content').animate({
	                marginLeft: 0 - scrollVal + 'px'
	            }, "fast");
	        }
	    }
	}

	Tabx.prototype.fullScreen = function(){
		debug("vvvvvvvvvvv");
		if(window._isFullScreen){
			// 判断各种浏览器，找到正确的方法
	        var exitMethod = document.exitFullscreen || //W3C
	            document.mozCancelFullScreen ||    //Chrome等
	            document.webkitExitFullscreen || //FireFox
	            document.webkitExitFullscreen; //IE11
	        if (exitMethod) {
	            exitMethod.call(document);
	        }else if (typeof window.ActiveXObject !== "undefined") {//for Internet Explorer
	            var wscript = new ActiveXObject("WScript.Shell");
	            if (wscript !== null) {
	                wscript.SendKeys("{F11}");
	            }
	        }

		}else {
			var de = document.documentElement;
	        if (de.requestFullscreen) {
	            de.requestFullscreen();
	        } else if (de.mozRequestFullScreen) {
	            de.mozRequestFullScreen();
	        } else if (de.webkitRequestFullScreen) {
	            de.webkitRequestFullScreen();
	        }
	        else {
	            console.warn({message: "该浏览器不支持全屏！", type: "danger"});
	        }
		}
		window._isFullScreen=!window._isFullScreen;
	}
	
	function generateTabId(){
		defaultId +=1;
		return defaultId;
	}
	
	 // preventing against multiple instantiations
    $.fn[pluginName] = function (options) {
        if(this==null){
        	return null;
        }
        var data = this.data(pluginName);
        if(!data){
        	data = new Tabx(this, options);
        	this.add(pluginName, data);
        }
        return data;
    };
	
	var debug = function(message) {
		if(window.console && window.console.log) {
			console.log(message);
		} else {
			alert(message);
		}
	}; 
}( jQuery ));
