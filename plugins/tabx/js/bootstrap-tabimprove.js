var tabCount = 0;

$(function () {

  $('#myTab a:first').tab('show');

  $('.nav-tabs').tabdrop();

  registerTabComposeEvent();
  registerTabCloseEvent();
});

function registerTabComposeEvent(){

  $(".composeTab").click(function(e){
      
      var tabId = "tab" + tabCount; //this is id on tab content div where the 
      tabCount = tabCount + 1; //increment compose count

      $('.nav-tabs').append('<li><a href="#' + tabId + '" data-toggle="tab"> <span class="close closeTab">&times;</span>'+$(this).html()+'</a></li>');
      $('.tab-content').append('<div class="tab-pane" id="' + tabId + '"></div>');

      craeteNewTabAndLoadUrl("", "./"+$(this).attr('taburl'), "#" + tabId);

      showTab(tabId);
      registerTabCloseEvent();

      $('.nav-tabs').tabdrop('layout');
  });
}

function registerTabCloseEvent() {

  $(".nav-tabs > li.active .closeTab").click(function () {
      //there are multiple elements which has .closeTab icon so close the tab whose close icon is clicked
      var next_active_tab = $(this).parents('li').next('li');
	  console.log("next_active111_tab:"+next_active_tab.length);
	  if(next_active_tab.length==0){
		next_active_tab = $(this).parents('li').prev('li');
	  }
	  console.log("next_active222_tab:"+next_active_tab.length);
	  
	  
	  var tabContentId = $(this).parent().attr("href");
      $(this).parent().parent().remove(); //remove li of tab
	  
	       
	  
	  
	  
      $(tabContentId).remove(); //remove respective tab content

      $('.nav-tabs').tabdrop('layout');
	  console.log("next_active_ta44444444b:"+next_active_tab.length);
	  console.log(next_active_tab.find("a").attr("href"));
	  next_active_tab.find("a").tab('show');
	  
	  
  });
}

function showTab(tabId) {
  $('#myTab a[href="#' + tabId + '"]').tab('show');
}

//need change
function craeteNewTabAndLoadUrl(parms, url, loadDivSelector) {

  $("" + loadDivSelector).load(url, function (response, status, xhr) {
    if (status == "error") {
        var msg = "Sorry but there was an error getting details ! ";
        $("" + loadDivSelector).html(msg + xhr.status + " " + xhr.statusText);
        $("" + loadDivSelector).html("Load Ajax Content Here..."+loadDivSelector);
      }
  });
}
