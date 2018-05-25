(function( $ ) {
	"use strict";
    var pluginName = 'tabx';
    var defaultId=1000000;//默认TABID开始
    var moretab = false;//是否超过一页的TAB（是否有隐藏的TAB)
    var contextMenuTab;//右键菜单选择的当前TAB

    var defaults = {
    	showIndex: 0,
    	iframeHeight:500,//默认IFRAME高度，前台传来的值
		data: null,
		showIndex: 0, //默认显示页索引
		marginRight:30
    };

    var tabx_ele = {
    	tab_label : function(ref){return $(".page-tabs-content a#"+pluginName+"_"+ref);},
    	tab_panel : function(ref){return $(".tab-content div#iframe_"+ref);},
    	tab_list_item : function(ref){return $("#tab_list li#tab_list_"+ref)},
    	active_tab_label : function(){return $(".page-tabs-content .active");},
    	active_tab_panel : function(){return $(".tab-content div.active");}
    }
		
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

	Tabx.prototype.contextmenu = function(){
		var $this = this;
		var options = {
			items: [{
					text: '<div id="tabClose"><span class="glyphicon glyphicon-remove red"></span>关闭当前</div>',
					onclick: function(e) {
						$this.closeCurrentTab($(contextMenuTab).find("i"));
					}
				},
				{
					text: '<span style="margin-left:17px;"></span>关闭其它' ,
					onclick: function(e) {
						$this.closeOthers($(contextMenuTab));
					}
				},
				{
					text: '<span style="margin-left:17px;"></span>关闭所有' ,
					onclick: function(e) {
						$this.closeAll();
					}
				},
				{
					divider: true
				},
				{
					text: '<span style="margin-left:17px;"></span>关闭右边所有' ,
					onclick: function(e) {
						$this.closeCurrentRightTabs($(contextMenuTab));
					}
				},
				{
					text: '<span style="margin-left:17px;"></span>关闭左边所有' ,
					onclick: function(e) {
						$this.closeCurrentLeftTabs($(contextMenuTab));
					}
				},
				{
					divider: true
				},
				{
					text: '<span class="glyphicon glyphicon-refresh green"></span>刷新当前' ,
					onclick: function(e){
						$this.refreshTab($(contextMenuTab));
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
		return options;
	};
	
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
				tmpele = $('<div class="tab-pane fade in"><div class="tab-loading hide"></div></div>').attr('id', "iframe_"+tab.id);
				if(this.options.showIndex==i){
					tmpele.addClass('active');
				}

				tmpele = this.initContent(tmpele, tab.url);
				this.tab_content.append(tmpele);

				//add listbtn
				//this.tab_list_btn.append($('<li></li>').append($('<a>').html(tab.id)));//TODO
				this.tab_list_btn.append($("<li>").data("ref", tab.id).attr("id","tab_list_"+tab.id).append($("<a>").html(tab.text)).on('click', function(){
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

        $('.page-tabs-content a').contextify(this.contextmenu());

            // handle the layout reinitialization on window resize
	    var handleOnResize = function () {
	        var resize;
	        
	        $(window).resize(function () {
	            if (resize) {
	                clearTimeout(resize);
	            }
	            resize = setTimeout(function () {
	                $this.fixIframeCotent();
	            }, 10); // wait 50ms until window resize finishes.
	        });
	        
	    }();
    };

    //初始化TAB页面
    Tabx.prototype.initTab = function(obj){
    	var $this = this;
    	var tmpele='';
    	//add tab
		tmpele = $('<a class="menu_tab" data-toggle="tab">').attr('href','#'+obj.id).data('ref',obj.id).attr('id', pluginName+'_'+obj.id).append($("<span>").html(!obj.text || obj.text==''?obj.id:obj.text));
		if(obj.closeable){
			tmpele.append($('<i class="fa fa-remove page_tab_close" style="cursor: pointer"></i>').on('click', function(){
				$this.closeCurrentTab(this);
				return false;
			}));
		}
		
		tmpele.on('click', function(){
			$(".nav-tabs a").removeClass("active");
			$(this).addClass("active");
			$this.tab_content.find("div.active").removeClass("active");
			$this.tab_content.find("div#iframe_"+obj.id).addClass("active");
		});
		return tmpele;
    }

    Tabx.prototype.initContent = function(ele, url){
    	var $this = this;
    	if (this.options.content) {
            //是否指定TAB内容
            ele.append(options.content);
        } else {
        	//开始显示加载进度条
        	if(typeof(this.options.loading)=='function'){
        		this.options.loading();
        	}else{
        		ele.find('.tab-loading').removeClass('hide');
        	}

    		var $iframe = $("<iframe marginwidth='0' marginheight='0'></iframe>").attr("src", url).css({"width": "100%", "height":"100%"}).attr("frameborder", "no").addClass("tab_iframe").hide();
    		//frameborder="no" border="0" marginwidth="0" marginheight="0" scrolling="yes"  allowtransparency="yes"
    		//iframe 加载完成事件
    		
            $iframe[0].onload=function () {
                //加载完成
                if(typeof($this.options.loaded)=='function'){
					$this.options.loaded();					
                }else{
                	ele.find('.tab-loading').addClass('hide');
                }
                $this.fixIframeCotent();
                $iframe.show();
            };
    		ele.append($iframe);

        }
        return ele;
    }

    //修改IFRAME高度
    Tabx.prototype.fixIframeCotent = function(){
    	var $this = this;
    	setTimeout(function () {
                $(".tab-pane").css({
		            height: (typeof($this.options.iframeHeight)=='function'?$this.options.iframeHeight():$this.options.iframeHeight) -$(".content-tabs").outerHeight(true)
		        });
            }, 50);  
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
    		obj={text:'默认页面', url:'#', closeable:true, ele:'', id:generateTabId()};
    		
    	}else{
    		if(!obj.id || obj.id==''){
    			obj.id = generateTabId();
    		}
    		if(!obj.text || obj.text==''){
    			obj.text = obj.id;
    		}
    	}

    	if(tabx_ele.tab_label(obj.id).length>0){//如果已存在，则直接选择
			$this.selectTab(obj.id);
    		return;
    	}

		
		$(".nav-tabs a").removeClass("active");
		$(".tab-content div").removeClass("active");
		var tmpele = this.initTab(obj).addClass('active');

		this.tab_container.append(tmpele.contextify(this.contextmenu()));

		//add tab content
		tmpele = $('<div class="tab-pane fade in active"><div class="tab-loading hide"></div></div>').attr('id', "iframe_"+obj.id);
		tmpele = this.initContent(tmpele, obj.url);					
		this.tab_content.append(tmpele);

		
		this.tab_list_btn.append($("<li>").data("ref", obj.id).attr("id", "tab_list_"+obj.id).append($("<a>").html(obj.text)).on('click', function(){
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

    //选择指定TAB    
    Tabx.prototype.selectTab = function(ref){  	
		tabx_ele.active_tab_label().removeClass("active");
		tabx_ele.active_tab_panel().removeClass('active');
		
		tabx_ele.tab_label(ref).addClass("active");
		tabx_ele.tab_panel(ref).addClass('active');

		//滚动到当前TAB位置
		this.scroll2Tab($(".page-tabs-content .active"));
    }

    //关闭指定TAB左边
    Tabx.prototype.closeCurrentLeftTabs = function(ele){ 
		var ref = $(ele).data('ref');
		$(ele).prevAll().not(":last").remove();
		tabx_ele.tab_panel(ref).prevAll().not(":last").remove();
		tabx_ele.tab_list_item(ref).prevAll().not(":last").remove();
		
		var tabOuterWidth = this.calSumWidth($(".content-tabs").children().not(".menuTabs"));
		var visibleWidth = $(".content-tabs").outerWidth(true) - tabOuterWidth;
		if ($(".page-tabs-content").width() >= visibleWidth) {
			moretab=true;
			var scrollVal = $(".nav-tabs .page-tabs-content .active").outerWidth(true);
			scrollVal = this.calSumWidth($(ele).prevAll())+scrollVal-visibleWidth+20;
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
    
    //关闭指定TAB右边
    Tabx.prototype.closeCurrentRightTabs = function(ele){ 
    	var ref = $(contextMenuTab).data('ref');
		$(ele).nextAll('a').remove();
		tabx_ele.tab_panel(ref).nextAll("div").remove();	
		tabx_ele.tab_list_item(ref).nextAll().remove();
		
		if($(ele).prev('a.active').length==0){
			$(ele).addClass('active');
			tabx_ele.tab_panel(ref).addClass('active');	
		}
		
		
		var tabOuterWidth = this.calSumWidth($(".content-tabs").children().not(".menuTabs"));
		var visibleWidth = $(".content-tabs").outerWidth(true) - tabOuterWidth;
		if ($(".page-tabs-content").width() >= visibleWidth) {
			moretab=true;
			var scrollVal = $(".nav-tabs .page-tabs-content .active").outerWidth(true);
			scrollVal = calSumWidth($(ele).prevAll())+scrollVal-visibleWidth+20;
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
    
    //关闭指定TAB之外的
    Tabx.prototype.closeOthers = function(ele){ 
		var ref = $(ele).data('ref');
		$(ele).parent().find('a').not(ele).not(':first').remove();
		
		$(".tab-content div").not($("#iframe_"+ref)).not(':first').remove();
		$("#tab_list li").not("#tab_list_"+ref).not(":first").remove();
		
		moretab=false;
		$('.page-tabs-content').animate({
			marginLeft: '0px'
		}, "fast");
		$(".tabLeft, .tabRight, .btn-group").hide();
		$(".content-tabs nav.page-tabs").removeClass('more-tabs');
		
		$(ele).addClass("active");
		tabx_ele.tab_panel(ref).addClass('active');
    }

        //刷新指定TAB
    Tabx.prototype.refreshTab = function(ele){ 
		var ref = $(ele).data('ref');
		if(!ele.hasClass("active")){
			tabx_ele.active_tab_label().removeClass("active");
			tabx_ele.active_tab_panel().removeClass('active');
		}

		$(ele).addClass("active");
		tabx_ele.tab_panel(ref).addClass('active');
		var $iframe = tabx_ele.tab_panel(ref).find("iframe");
		$iframe[0].contentWindow.location.reload(true);//带参数刷新
		//$iframe[0].src=$iframe[0].src;
    }

    Tabx.prototype.closeAll = function(){
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

    //关闭指字的TAB
    Tabx.prototype.closeCurrentTab = function(ele){		
		if(!$(ele).parent().hasClass("active")){//如果关闭不是当前TAB
			var ref = $(ele).parent().data("ref");
			
			$(ele).parent().remove();						
			tabx_ele.tab_panel(ref).remove();	
			tabx_ele.tab_list_item(ref).remove();
			//$("#tab_list li#tab_list_"+ref).remove();
			
			return;
		}
		
		var lastone = false;
		var next_active_tab = tabx_ele.active_tab_label().next('a'); 
		if(next_active_tab.length==0){
			next_active_tab = tabx_ele.active_tab_label().prev('a');
			lastone = true;
		}
		
		var page_tabs_content_width = $(".page-tabs-content").width();
		
		var ref = tabx_ele.active_tab_label().data("ref");
		//$(".page-tabs-content .active, .tab-content .active").remove();	
		tabx_ele.active_tab_label().remove();
		tabx_ele.active_tab_panel().remove();
		tabx_ele.tab_list_item(ref).remove();
		
		next_active_tab.addClass("active");
		tabx_ele.tab_panel(next_active_tab.data('ref')).addClass('active');
		
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
	    var marginLeftVal = Math.abs(parseInt($('.page-tabs-content').css('margin-left')));
		if(marginLeftVal==0){//已是第一个
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
