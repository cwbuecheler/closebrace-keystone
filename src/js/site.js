$(document).ready(function(){

  var isAdsBlocked = false;

  $('#btnSearch').on('click', function() {
    $('#searchBox').css('display') === 'block' ? $('#searchBox').hide() : $('#searchBox').show();
  });

  if(document.getElementById('sauWs0UJTcvwx')) {
    isAdsBlocked = false;
  }
  else {
    isAdsBlocked = true;
  }

  if(isAdsBlocked === true) { displayAdNotice('adblock-notice'); }

  function displayAdNotice(displaySpan) {
    $('.' + displaySpan).html('Ad revenue is what allow us to keep this site running. If you\'re blocking ads, we\'d appreciate it if you added us to your whitelist or considered our <a href="/go-pro/">affordable CloseBrace Pro plan</a> instead. You can also <a href="/privacy-policy#ads">learn more about our anti-invasive advertising policy</a> by clicking here. Thanks!');
  }

});

