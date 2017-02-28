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

  // Clear values if window is resized
  window.onresize = function() {
    if(idExists('userMenu')) {
      document.getElementById('userMenu').style.display = '';
    }
    if(idExists('mainNav')) {
      document.getElementById('mainNav').style.display = '';
    }
  }

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

      // Close the user menu if it's open
      if(idExists('userMenu') && getComputedStyle(document.querySelector('#mainNav')).position === 'absolute') {
        document.getElementById('userMenu').style.display = 'none';
      }

      // Close the modal if it's open
      if(idExists('modal')) {
        document.getElementById('modal').style.display = 'none';
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
      var isClickInside = searchBox.contains(e.target);
      var isClickButton = searchBtn.contains(e.target);
      if(!isClickInside && !isClickButton && searchBox.style.display === 'block') {
        document.getElementById('searchBox').style.display = 'none';
      }
    });
  }

  // Main header main menu
  if (idExists('mainNav')) {
    var navLinks = document.getElementsByClassName('link-main-nav');
    for (var i = 0; i < navLinks.length; i++) {
      navLinks[i].addEventListener('click', function(e) {
        e.preventDefault();
        if (document.getElementById('mainNav').style.display === 'block') {
          document.getElementById('mainNav').style.display = 'none';
        }
        else {
          document.getElementById('mainNav').style.display = 'block';
        }
      });
    }
  }

  // Main header click outside of main menu
  if (idExists('mainNav')) {
    var navLinks = document.getElementsByClassName('link-main-nav');
    for (var i = 0; i < navLinks.length; i++) {
      navLinks[i].addEventListener('click', function(e) {
        e.preventDefault();
        var mainNav = document.getElementById('mainNav');
        var hamburger = document.getElementById('hamburger');

        document.addEventListener('click', function(e){
          var isClickInside = mainNav.contains(e.target);
          var isClickButton = hamburger.contains(e.target);
          if(!isClickInside && !isClickButton && mainNav.style.display === 'block') {
            document.getElementById('mainNav').style.display = 'none';
          }
        });

      });
    }
  }

  // Main header user image
  if(idExists('linkUserImage')) {
    document.getElementById('linkUserImage').addEventListener('click', function(e){
      e.preventDefault();
      if (getComputedStyle(document.querySelector('#userMenu')).position === 'absolute') {
        if (document.getElementById('userMenu').style.display === 'block') {
          document.getElementById('userMenu').style.display = 'none';
        }
        else {
          document.getElementById('userMenu').style.display = 'block';
        }
      }
    });
  }

  // Main header click outside of user menu
  if(idExists('linkUserImage')) {
    var userBox = document.getElementById('userMenu');
    var userImage = document.getElementById('linkUserImage');
    document.addEventListener('click', function(e){
      var isClickInside = userBox.contains(event.target);
      var isClickButton = userImage.contains(event.target);
      if(!isClickInside && !isClickButton && userBox.style.display === 'block') {
        document.getElementById('userMenu').style.display = 'none';
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

  // Modal Open
  if(classExists('modal-open')) {
    var modalLinks = document.getElementsByClassName('modal-open');
    for (var i = 0; i < modalLinks.length; i++) {
      modalLinks[i].addEventListener('click', function(e) {
        e.preventDefault();

        // If the link has a modaltext data attribute, there are multiple uses of the modal, so handle that
        if(this.dataset.modaltext) {
          var modalTextDivs = document.getElementsByClassName('modal-text');
          for (var t = 0; t < modalTextDivs.length; t++) {
            modalTextDivs[t].style.display = 'none';
          }
          var textToDisplay = '.modal-text-' + this.dataset.modaltext;
          document.querySelector(textToDisplay).style.display = 'block';
        }
        document.getElementById('modal').style.display = 'block';
      });
    }
  }

  // Modal Exterior Click
  if(idExists('modal')) {
    var modal = document.getElementById('modal');
    var modalOuter = document.querySelector('#modal .modal-outer');
    var modalBtns = document.getElementsByClassName('modal-open');
    document.addEventListener('click', function(event){
      var isClickInside = modalOuter.contains(event.target);
      var isClickButton = false;
      for (var i = 0; i < modalBtns.length; i++) {
        if (modalBtns[i].contains(event.target)) {
          isClickButton = true;
        }
      }
      if(!isClickInside && !isClickButton) {
        document.getElementById('modal').style.display = 'none';
      }
    });
  }

  // Modal Close Button
  if(classExists('modal-close')) {
    var modalLinks = document.getElementsByClassName('modal-close');
    for (var i = 0; i < modalLinks.length; i++) {
      modalLinks[i].addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('modal').style.display = 'none';
      });
    }
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

  // Comments - Reply Link
  if(classExists('reply-link')) {
    var replyLinks = document.getElementsByClassName('reply-link');
    for (var i = 0; i < replyLinks.length; i++) {
      replyLinks[i].addEventListener('click', function(e) {
        e.preventDefault();
        var targetCommentID = this.dataset.commentid;
        var originalAuthor = this.dataset.author;
        // Get back to the comment box
        var commentBoxLocation = findPos(document.getElementById('commentBox'));
        window.scrollTo(0, commentBoxLocation[1] - 150);
        // Add the @ stuff:
        var atString = '[@' + originalAuthor + '](' + window.location.pathname + '#' + targetCommentID + '): ';
        document.getElementById('textAddComment').value = atString;
        // Give the comment box focus
        document.getElementById('textAddComment').focus();
      });
    }
  }

  // Comments - Delete Comment (user)
  if(classExists('link-delete-comment-user')) {
    var deleteLinks = document.getElementsByClassName('link-delete-comment-user');
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
          .url('/api/comments/' + targetCommentID + '/update')
          .data({ userID: userID, isUserDeleted: true })
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

  // Comments - Delete Comment (admin)
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

  // Explain links
  if(classExists('link-explain')) {
    var explainLinks = document.getElementsByClassName('link-explain');
    for (var i = 0; i < explainLinks.length; i++ ) {
      explainLinks[i].addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById(this.dataset.explain).style.display = 'block';
      });
    }
  }

  // Go-Pro Subscription Select
  if(idExists('subSelectPlatYearly')) {
    var subBoxes = document.getElementsByClassName('sub-select');
    for (var i = 0; i < subBoxes.length; i++) {
      subBoxes[i].addEventListener('click', function(e) {
        // clear all radio buttons
        var radioButtons = document.getElementsByName('proselect');
        for (var t = 0; t < radioButtons.length; t++) {
          radioButtons[t].checked = false;
        }
        // set correct radio button to checked
        radioButtons[this.dataset.check].checked = true;
        // clear all 'on' classes
        for (var n = 0; n < subBoxes.length; n++) {
          subBoxes[n].classList.remove('on');
        }
        // set this element's class to 'on'
        this.classList.add('on');
      });
    }
  }

  // Go-Pro Stripe Integration
  if(idExists('stripePage')) {
    // get the user ID & email from the form
    var userID = document.getElementById('userID').value;
    var userEmail = document.getElementById('userEmail').value;

    var stripeHandler = StripeCheckout.configure({
      key: 'pk_test_a8h2HENfpffkX4W1FlStNcYv',
      image: 'https://s3.amazonaws.com/stripe-uploads/acct_19SoCBK2sFMaOukMmerchant-icon-1482259458497-closebrace_logo_notext_green_300.png',
      locale: 'auto',
      email: userEmail,
      token: function(token) {
        // Get the plan name from the hidden input, since we're going to need it
        var proPlan = document.getElementById('proPlan').value;
        // Send the token.id to the backend to save it to the user account and turn them into a pro
        if (token) {
          aja()
          .method('post')
          .url('/api/pro/register')
          .body({ email: userEmail, userID: userID, token: token, proPlan: proPlan })
          .cache(false)
          .on('200', function(response){
            // Reload the window to show the comment has been removed
            window.location = '/go-pro-thanks';
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
      }
    });

    if(classExists('btn-checkout')) {
      var stripeLinks = document.getElementsByClassName('btn-checkout');
      for (var i = 0; i < stripeLinks.length; i++) {
        stripeLinks[i].addEventListener('click', function(e) {
          e.preventDefault();

          // Go through the radio buttons and find the one that's checked, then get its value
          var radioButtons = document.getElementsByName('proselect');
          var buttonValue = null;
          for (var t = 0; t < radioButtons.length; t++) {
            if (radioButtons[t].checked) {
                // do whatever you want with the checked radio
                buttonValue = radioButtons[t].value;
                break;
            }
          }

          // Set $ value and subscription type based on button value
          var cost = 0;
          var subPlan = null;
          var subDesc = null;
          switch(buttonValue) {
            case 'py':
              cost = 14999;
              subDesc = 'Platinum Yearly Subscription';
              subPlan = 'closebrace-pro-platinum-yearly';
              break;
            case 'pm':
              cost = 1499;
              subDesc = 'Platinum Monthly Subscription';
              subPlan = 'closebrace-pro-platinum-monthly';
              break;
            case 'gy':
              cost = 5999;
              subDesc = 'Gold Yearly Subscription';
              subPlan = 'closebrace-pro-gold-yearly';
              break;
            case 'gm':
              cost = 599;
              subDesc = 'Gold Monthly Subscription';
              subPlan = 'closebrace-pro-gold-monthly';
              break;
          }

          // fill in the "proPlan" hidden input (used elsewhere)
          document.getElementById('proPlan').value = subPlan;

          // close the modal that is probably open
          if(idExists('modal')) { document.getElementById('modal').style.display = 'none'; }

          // Open Checkout with further options:
          stripeHandler.open({
            name: 'CloseBrace Pro',
            description: subDesc,
            amount: cost,
            zipCode: true,
          });
          e.preventDefault();
        });
      }
    }

    // Close Checkout on page navigation:
    window.addEventListener('popstate', function() {
      stripeHandler.close();
    });
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

  function findPos(obj) {
    var curleft = curtop = 0;
    if (obj.offsetParent) {
      do {
        curleft += obj.offsetLeft;
        curtop += obj.offsetTop;
      }
      while (obj = obj.offsetParent);
    }
    return [curleft,curtop];
  }
});
