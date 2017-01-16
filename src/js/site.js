$(document).ready(function(){

  /* Site Globals =================================================== */
  var isAdsBlocked = false;

  /* Config */
  // Avatar Upload Dropzone
  Dropzone.options.avatarUpload = {
    maxFilesize: 1,
    uploadMultiple: false,
    acceptedFiles: '.jpg,.png,.gif',
  };

  /* Event Catchers ================================================= */
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

  // Change Profile Image Link
  document.getElementById('linkChangeImage').addEventListener('click', function(e){
    e.preventDefault();
    // hide self
    this.style.display = 'none';
    // show form
    document.getElementById('avatar-upload').style.display = 'block';
  });

  // Edit Profile Button
  document.getElementById('btnEditProfile').addEventListener('click', function(e){
    e.preventDefault();
    // hide self
    this.style.display = 'none';
    // hide info spans
    var infoSpans = document.getElementsByClassName('display');
    for (var i = 0; i < infoSpans.length; i++) {
      infoSpans[i].style.display = 'none';
    }
    // show input spans
    var editSpans = document.getElementsByClassName('edit');
    for (var t = 0; t < editSpans.length; t++) {
      editSpans[t].style.display = 'inline';
    }
    // show save/cancel buttons
    document.getElementById('btnSubmitProfileEdits').style.display = 'inline';
    document.getElementById('btnCancelProfileEdits').style.display = 'inline';
   });

  // Delete Account Step 1 Click
  document.getElementById('btnDeleteAccountStep1').addEventListener('click', function(e){
    e.preventDefault();
    document.getElementById('deleteAccountText').style.display = 'none';
    document.getElementById('deleteAccountBox').style.display = 'block';
  });

  // Cancel Delete Account
  document.getElementById('btnCancelDeleteAccount').addEventListener('click', function(e){
    e.preventDefault();
    document.getElementById('formDeleteAccount').reset();
    document.getElementById('deleteAccountText').style.display = 'block';
    document.getElementById('deleteAccountBox').style.display = 'none';
  });



  // Cancel Edit Profile Button
  document.getElementById('btnCancelProfileEdits').addEventListener('click', function(e){
    e.preventDefault();
    // hide self & submit buttons
    document.getElementById('btnSubmitProfileEdits').style.display = 'none';
    this.style.display = 'none';
    // hide edit spans
    var editSpans = document.getElementsByClassName('edit');
    for (var t = 0; t < editSpans.length; t++) {
      editSpans[t].style.display = 'none';
    }
    // clear edit spans
    document.getElementById("formEditProfile").reset();
    // show info spans
    var infoSpans = document.getElementsByClassName('display');
    for (var i = 0; i < infoSpans.length; i++) {
      infoSpans[i].style.display = 'inline';
    }
    // show edit button
    document.getElementById('btnEditProfile').style.display = 'inline';
  });

  /* Check for ad blockers */
  if(document.getElementById('sauWs0UJTcvwx')) {
    isAdsBlocked = false;
  }
  else {
    isAdsBlocked = true;
  }
  if(isAdsBlocked === true) { displayAdNotice('adblock-notice'); }

  /* Functions ====================================================== */
  function displayAdNotice(displaySpan) {
    $('.' + displaySpan).html('Ad revenue is what allow us to keep this site running. If you\'re blocking ads, we\'d appreciate it if you added us to your whitelist or considered our <a href="/go-pro/">affordable CloseBrace Pro plan</a> instead. You can also <a href="/privacy-policy#ads">learn more about our anti-invasive advertising policy</a> by clicking here. Thanks!');
  }

});
