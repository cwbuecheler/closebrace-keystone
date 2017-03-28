document.addEventListener("DOMContentLoaded", function() {

  /* Perform on Load ================================================ */
  /* Check for ad blockers */
  if(getById('sauWs0UJTcvwx')) {
    isAdsBlocked = false;
  }
  else {
    isAdsBlocked = true;
  }
  if(isAdsBlocked === true) { displayAdNotice('adblock-notice'); }

  /* Site Globals =================================================== */
  var isAdsBlocked = false;

  /* Event Catchers ================================================= */

  // Clear values if window is resized
  window.onresize = function() {
    if(idExists('userMenu')) {
      getById('userMenu').style.display = '';
    }
    if(idExists('mainNav')) {
      getById('mainNav').style.display = '';
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
        getById('searchBox').style.display = 'none';
      }

      // Close the user menu if it's open
      if(idExists('userMenu') && getComputedStyle(document.querySelector('#mainNav')).position === 'absolute') {
        getById('userMenu').style.display = 'none';
      }

      // Close the modal if it's open
      if(idExists('modal')) {
        getById('modal').style.display = 'none';
      }

      // Close User Avatar Upload modal
      if(idExists('linkCloseImageUpload')) {
        getById('avatarUpload').style.display = 'none';
      }

      // Close front page login box
      if(idExists('headerLoginBox')) {
        getById('headerLoginBox').style.display = 'none';
        // also clear the inputs
        getById('formLogin').reset();
      }
    }
  };

  // Main header search button
  if(idExists('btnSearch')) {
    getById('btnSearch').addEventListener('click', function(e){
      e.preventDefault();
      getById('searchBox').style.display === 'block' ?
        getById('searchBox').style.display = 'none' :
        getById('searchBox').style.display = 'block';
      getById("formMainSearch").focus();
    });
  }

  // Main header search close link
  if(idExists('lnkSearchClose')) {
    getById('lnkSearchClose').addEventListener('click', function(e){
      e.preventDefault();
      getById('searchBox').style.display = 'none';
    });
  }

  // Main header click outside of search box
  if(idExists('searchBox')) {
    var searchBox = getById('searchBox');
    var searchBtn = getById('btnSearch');
    document.addEventListener('click', function(e){
      var isClickInside = searchBox.contains(e.target);
      var isClickButton = searchBtn.contains(e.target);
      if(!isClickInside && !isClickButton && searchBox.style.display === 'block') {
        getById('searchBox').style.display = 'none';
      }
    });
  }

  // Main header main menu
  if (idExists('mainNav')) {
    var navLinks = document.getElementsByClassName('link-main-nav');
    for (var i = 0; i < navLinks.length; i++) {
      navLinks[i].addEventListener('click', function(e) {
        e.preventDefault();
        if (getById('mainNav').style.display === 'block') {
          getById('mainNav').style.display = 'none';
        }
        else {
          getById('mainNav').style.display = 'block';
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
        var mainNav = getById('mainNav');
        var hamburger = getById('hamburger');

        document.addEventListener('click', function(e){
          var isClickInside = mainNav.contains(e.target);
          var isClickButton = hamburger.contains(e.target);
          if(!isClickInside && !isClickButton && mainNav.style.display === 'block') {
            getById('mainNav').style.display = 'none';
          }
        });

      });
    }
  }

  // Main header user image
  if(idExists('linkUserImage')) {
    getById('linkUserImage').addEventListener('click', function(e) {
      e.preventDefault();
      if (getComputedStyle(document.querySelector('#userMenu')).position === 'absolute') {
        if (getById('userMenu').style.display === 'block') {
          getById('userMenu').style.display = 'none';
        }
        else {
          getById('userMenu').style.display = 'block';
        }
      }
    });
  }

  // Main header click outside of user menu
  if(idExists('linkUserImage')) {
    var userBox = getById('userMenu');
    var userImage = getById('linkUserImage');
    document.addEventListener('click', function(e){
      var isClickInside = userBox.contains(event.target);
      var isClickButton = userImage.contains(event.target);
      if(!isClickInside && !isClickButton && userBox.style.display === 'block') {
        getById('userMenu').style.display = 'none';
      }
    });
  }

  // Main header log-in form set destination
  if(idExists('inputDestination')) {
    getById('inputDestination').value = window.location.href;
  }

  // Main header log in link
  if(idExists('linkHeaderLogIn')) {
    getById('linkHeaderLogIn').addEventListener('click', function(e) {
      e.preventDefault();
      if (getComputedStyle(document.querySelector('#userMenu')).position === 'absolute') {
        if (getById('userMenu').style.display === 'block') {
          getById('userMenu').style.display = 'none';
        }
      }
      getById('headerLoginBox').style.display = 'block';
      getById('userEmail').focus();
    });
  }

  // Main header log in box cancel button
  if(idExists('btnLogInCancel')) {
    getById('btnLogInCancel').addEventListener('click', function(e) {
      var headerLoginBox = getById('headerLoginBox');
      headerLoginBox.style.display = 'none';
      // also clear the inputs
      getById('formLogin').reset();
    });
  }

  // Main header click outside of login box
  if(idExists('linkUserImage')) {
    var headerLoginBox = getById('headerLoginBox');
    var loginLink = getById('linkHeaderLogIn');
    document.addEventListener('click', function(e){
      var isClickInside = headerLoginBox.contains(event.target);
      var isClickLink = loginLink.contains(event.target);
      if(!isClickInside && !isClickLink && headerLoginBox.style.display === 'block') {
        getById('headerLoginBox').style.display = 'none';
        // also clear the inputs
        getById('formLogin').reset();
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
        getById(expand).style.display = 'block';
      });
    }
  }

  // Change Profile Image Link
  if(idExists('linkChangeImage')) {
    getById('linkChangeImage').addEventListener('click', function(e){
      e.preventDefault();
      // show form
      getById('avatarUpload').style.display = 'block';
    });
  }

  // Profile Image Upload Close Link
  if(idExists('linkCloseImageUpload')) {
    getById('linkCloseImageUpload').addEventListener('click', function(e) {
      e.preventDefault();
      getById('avatarUpload').style.display = 'none';
    });
  }

  // Profile Image Upload Exterior Click
  if(idExists('avatarUpload')) {
    var upload = getById('avatarUpload');
    var uploadOuter = document.querySelector('#avatarUpload .dropzone');
    var uploadLink = getById('linkChangeImage');
    upload.addEventListener('click', function(event){
      var isClickInside = uploadOuter.contains(event.target);
      var isClickLink = uploadLink.contains(event.target);

      if(!isClickInside && !isClickLink) {
        getById('avatarUpload').style.display = 'none';
      }
    });
  }

  // Edit Profile Button
  if(idExists('btnEditProfile')) {
    getById('btnEditProfile').addEventListener('click', function(e){
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
      getById('btnSubmitProfileEdits').style.display = 'inline';
      getById('btnCancelProfileEdits').style.display = 'inline';
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
        getById('modal').style.display = 'block';
      });
    }
  }

  // Modal Exterior Click
  if(idExists('modal')) {
    var modal = getById('modal');
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
        getById('modal').style.display = 'none';
      }
    });
  }

  // Modal Close Button
  if(classExists('modal-close')) {
    var modalLinks = document.getElementsByClassName('modal-close');
    for (var i = 0; i < modalLinks.length; i++) {
      modalLinks[i].addEventListener('click', function(e) {
        e.preventDefault();
        getById('modal').style.display = 'none';
      });
    }
  }


  // Delete Account Step 1 Click
  if(idExists('btnDeleteAccountStep1')) {
    getById('btnDeleteAccountStep1').addEventListener('click', function(e){
      e.preventDefault();
      getById('deleteAccountText').style.display = 'none';
      getById('deleteAccountBox').style.display = 'block';
    });
  }

  // Cancel Delete Account
  if(idExists('btnCancelDeleteAccount')) {
    getById('btnCancelDeleteAccount').addEventListener('click', function(e){
      e.preventDefault();
      getById('formDeleteAccount').reset();
      getById('deleteAccountText').style.display = 'block';
      getById('deleteAccountBox').style.display = 'none';
    });
  }

  // Cancel Edit Profile Button
  if(idExists('btnCancelProfileEdits')) {
    getById('btnCancelProfileEdits').addEventListener('click', function(e){
      e.preventDefault();
      // hide self & submit buttons
      getById('btnSubmitProfileEdits').style.display = 'none';
      this.style.display = 'none';
      // hide edit spans
      var editSpans = document.getElementsByClassName('edit');
      for (var t = 0; t < editSpans.length; t++) {
        editSpans[t].style.display = 'none';
      }
      // clear edit spans
      getById("formEditProfile").reset();
      // show info spans
      var infoSpans = document.getElementsByClassName('display');
      for (var i = 0; i < infoSpans.length; i++) {
        infoSpans[i].style.display = 'inline';
      }
      // show edit button
      getById('btnEditProfile').style.display = 'inline';
    });
  }

  // Comments - Add Comment
  if(idExists('btnAddComment')) {
    getById('btnAddComment').addEventListener('click', function(e){

    // put together our submission
    var commentPacket = {
      content: getById('textAddComment').value,
      inReplyTo: null,
      relatedPost: getById('hidPostID').value,
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
        var commentBoxLocation = findPos(getById('commentBox'));
        window.scrollTo(0, commentBoxLocation[1] - 150);
        // Add the @ stuff:
        var atString = '[@' + originalAuthor + '](' + window.location.pathname + '#' + targetCommentID + '): ';
        getById('textAddComment').value = atString;
        // Give the comment box focus
        getById('textAddComment').focus();
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
        getById(this.dataset.explain).style.display = 'block';
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
    var userID = getById('userID').value;
    var userEmail = getById('userEmail').value;

    var stripeHandler = StripeCheckout.configure({
      key: 'pk_test_a8h2HENfpffkX4W1FlStNcYv',
      image: 'https://s3.amazonaws.com/stripe-uploads/acct_19SoCBK2sFMaOukMmerchant-icon-1482259458497-closebrace_logo_notext_green_300.png',
      locale: 'auto',
      email: userEmail,
      token: function(token) {
        // Get the plan name from the hidden input, since we're going to need it
        var proPlan = getById('proPlan').value;
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
          getById('proPlan').value = subPlan;

          // close the modal that is probably open
          if(idExists('modal')) { getById('modal').style.display = 'none'; }

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
    if (getById(el)) {
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

  function getById(id) {
    return document.getElementById(id);
  }
});
