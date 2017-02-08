document.addEventListener("DOMContentLoaded", function() {

  /* Perform on Load ================================================ */
  /* Check for ad blockers */
  if(document.getElementById('sauWs0UJTcvwx')) {
    isAdsBlocked = false;
  }
  else {
    isAdsBlocked = true;
  }
  if(isAdsBlocked === true) { displayAdNotice('adblock-notice'); }

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

  // Global ESC key catcher
  document.onkeydown = function(evt) {
    evt = evt || window.event;
    var isEscape = false;
    if ("key" in evt) {
      isEscape = (evt.key == "Escape" || evt.key == "Esc");
    } else {
      isEscape = (evt.keyCode == 27);
    }
    if (isEscape) {
      // contains things to do if the esc key is clicked

      // Close the search box is it's open
      if(idExists('searchBox')) {
        document.getElementById('searchBox').style.display = 'none';
      }
    }
  };

  // Main header search button
  if(idExists('btnSearch')) {
    document.getElementById('btnSearch').addEventListener('click', function(e){
      e.preventDefault();
      document.getElementById('searchBox').style.display === 'block' ?
        document.getElementById('searchBox').style.display = 'none' :
        document.getElementById('searchBox').style.display = 'block';
      document.getElementById("formMainSearch").focus();
    });
  }

  // Main header search close link
  if(idExists('lnkSearchClose')) {
    document.getElementById('lnkSearchClose').addEventListener('click', function(e){
      e.preventDefault();
      document.getElementById('searchBox').style.display = 'none';
    });
  }

  // Main header click outside of search box
  if(idExists('searchBox')) {
    var searchBox = document.getElementById('searchBox');
    var searchBtn = document.getElementById('btnSearch');
    document.addEventListener('click', function(e){
      var isClickInside = searchBox.contains(event.target);
      var isClickButton = searchBtn.contains(event.target);
      if(!isClickInside && !isClickButton && searchBox.style.display === 'block') {
        document.getElementById('searchBox').style.display = 'none';
      }
    });
  }

  // Expand links in tutorials / articles
  var expandLinks = document.querySelectorAll('a.expand');
  if (expandLinks.length > 0) {
    for (var i = 0; i < expandLinks.length; i++) {
      expandLinks[i].addEventListener('click', function(e) {
        e.preventDefault();
        this.style.display = 'none';
        var expand =  this.rel;
        document.getElementById(expand).style.display = 'block';
      });
    }
  }

  // Change Profile Image Link
  if(idExists('linkChangeImage')) {
    document.getElementById('linkChangeImage').addEventListener('click', function(e){
      e.preventDefault();
      // hide self
      this.style.display = 'none';
      // show form
      document.getElementById('avatar-upload').style.display = 'block';
    });
  }

  // Edit Profile Button
  if(idExists('btnEditProfile')) {
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
  }

  // Delete Account Step 1 Click
  if(idExists('btnDeleteAccountStep1')) {
    document.getElementById('btnDeleteAccountStep1').addEventListener('click', function(e){
      e.preventDefault();
      document.getElementById('deleteAccountText').style.display = 'none';
      document.getElementById('deleteAccountBox').style.display = 'block';
    });
  }

  // Cancel Delete Account
  if(idExists('btnCancelDeleteAccount')) {
    document.getElementById('btnCancelDeleteAccount').addEventListener('click', function(e){
      e.preventDefault();
      document.getElementById('formDeleteAccount').reset();
      document.getElementById('deleteAccountText').style.display = 'block';
      document.getElementById('deleteAccountBox').style.display = 'none';
    });
  }

  // Cancel Edit Profile Button
  if(idExists('btnCancelProfileEdits')) {
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
  }

  // Comments - Add Comment
  if(idExists('btnAddComment')) {
    document.getElementById('btnAddComment').addEventListener('click', function(e){

    // put together our submission
    var commentPacket = {
      author: document.getElementById('hidUserID').value,
      content: document.getElementById('textAddComment').value,
      inReplyTo: null,
      relatedPost: document.getElementById('hidPostID').value,
      state: 'published',
      isPublished: true,
    }

    // Ajax submit the comment
    aja()
      .method('post')
      .url('/api/comments/create')
      .cache(false)
      .body(commentPacket)
      .on('200', function(response){
        // Reload the window to show the comment
        window.location.reload();
      })
       .on('40x', function(response){
          //something is definitely wrong
          // 'x' means any number (404, 400, etc. will match)
          console.log(response);
      })
      .on('500', function(response){
          //oh crap
          console.log(response);
      })
      .go();
    });
  }

  // Comments - Delete Comment
  if(classExists('link-delete-comment')) {
    var deleteLinks = document.getElementsByClassName('link-delete-comment');
    for (var i = 0; i < deleteLinks.length; i++) {
      deleteLinks[i].addEventListener('click', function(e) {
        e.preventDefault();
        var targetCommentID = this.dataset.commentid;
        var userID = this.dataset.userid;
        var deleteConf = confirm('Are you sure you want to delete this comment?');
        // Ajax delete the comment
        if(deleteConf) {
          aja()
          .method('post')
          .url('/api/comments/' + targetCommentID + '/remove')
          .data({ userID: userID })
          .cache(false)
          .on('200', function(response){
            // Reload the window to show the comment has been removed
            window.location.reload();
          })
           .on('40x', function(response){
              //something is definitely wrong
              // 'x' means any number (404, 400, etc. will match)
              console.log(response);
          })
          .on('500', function(response){
              //oh crap
              console.log(response);
          })
          .go();
        }
      });
    }
  }

  // Comments - Flag Comment
  if(classExists('link-flag-comment')) {
    var flagLinks = document.getElementsByClassName('link-flag-comment');
    for (var i = 0; i < flagLinks.length; i++) {
      flagLinks[i].addEventListener('click', function(e){
        e.preventDefault();
        var targetCommentID = this.dataset.commentid;
        var flagger = this.dataset.flagger;
        var flagConf = confirm('Are you sure you want to flag this comment as abuse / spam / in violation of the community guidelines?');
        if (flagConf) {
          aja()
          .method('post')
          .url('/api/comments/flag')
          .body({ flagger: flagger, id: targetCommentID })
          .cache(false)
          .on('200', function(response){
            // Reload the window to show the comment has been removed
            window.location.reload();
          })
           .on('40x', function(response){
              //something is definitely wrong
              // 'x' means any number (404, 400, etc. will match)
              console.log(response);
          })
          .on('500', function(response){
              //oh crap
              console.log(response);
          })
          .go();
        }
      });
    }
  }



  /* Functions ====================================================== */
  function displayAdNotice(displaySpan) {
    var displaySpans = document.getElementsByClassName(displaySpan);
    if (displaySpans.length > 0) {
      for (var i = 0; i < displaySpans.length; i++) {
        displaySpans[i].innerHTML = 'Ad revenue is what allows us to keep this site running. If you\'re blocking ads, we\'d appreciate it if you added us to your whitelist or considered our <a href="/go-pro/">affordable CloseBrace Pro plan</a> instead. You can also <a href="/privacy-policy#ads">learn more about our anti-invasive advertising policy</a> by clicking here. Thanks!';
      }
    }
  }

  function idExists(el) {
    if (document.getElementById(el)) {
      return true;
    }
    return false;
  }

  function classExists(className) {
    if (document.getElementsByClassName(className).length > 0) {
      return true;
    }
    return false;
  }

});
