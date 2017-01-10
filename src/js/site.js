$(document).ready(function(){

  /* Site Globals */
  var isAdsBlocked = false;

  /* Event Catchers */
  $('#btnSearch').on('click', function(e) {
    e.preventDefault();
    $('#searchBox').css('display') === 'block' ? $('#searchBox').hide() : $('#searchBox').show();
  });

  $('#lnkSearchClose').on('click', function(e) {
    e.preventDefault();
    $('#searchBox').hide();
  });

  $('a.expand').on('click', function(e) {
    e.preventDefault();
    var expand = '#' + $(this).attr('rel');
    $(expand).show();
  });

  /* Check for ad blockers */
  if(document.getElementById('sauWs0UJTcvwx')) {
    isAdsBlocked = false;
  }
  else {
    isAdsBlocked = true;
  }
  if(isAdsBlocked === true) { displayAdNotice('adblock-notice'); }

  /* Functions */
  function displayAdNotice(displaySpan) {
    $('.' + displaySpan).html('Ad revenue is what allow us to keep this site running. If you\'re blocking ads, we\'d appreciate it if you added us to your whitelist or considered our <a href="/go-pro/">affordable CloseBrace Pro plan</a> instead. You can also <a href="/privacy-policy#ads">learn more about our anti-invasive advertising policy</a> by clicking here. Thanks!');
  }

  /*

                var desktopScript = '//p187396.clksite.com/adServe/banners?tid=187396_340807_0';
                var mobileScript = '//p187396.clksite.com/adServe/banners?tid=187396_340807_3';
                  var s = document.createElement("script");
                  s.type = "text/javascript";
                  s.src = mobileScript;
                  s.dataset.cfasync = false;
                  // Use any selector
                  $("#adInsertSidebarTop").append(s);

                    /*
                  if (actual('width', 'px') > 849 ) {
                    $('#adInsertSidebarTop').html(mobileScript);
                  }
                  else {
                    $('#adInsertSidebarTop').html(mobileScript);
                  } */

});

