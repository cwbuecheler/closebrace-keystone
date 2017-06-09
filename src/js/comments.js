const initCommentClick = (cbCommentInfo) => {
  if (document.getElementById('btnAddComment')) {
    document.getElementById('btnAddComment').addEventListener('click', function (e) {
      e.preventDefault();
      // If there's no reply text, don't bother
      if (document.getElementById('textAddComment').value === '') {
        return false;
      }
      else {

        const mailReplies = getById('emailReplies').checked;

        // Create a data packet
        const data = {
          isReply: false,
          content: document.getElementById('textAddComment').value,
          mailReplies,
          inReplyTo: null,
          replyToUsername: null,
          relatedPost: document.getElementById('hidPostID').value,
          relatedPostTitle: document.getElementById('hidPostTitle').value,
          relatedPostUrl: window.location.href,
        };

        // Submit it
        aja()
        .method('post')
        .url('/api/comments/create')
        .body(data)
        .cache(false)
        .on('200', function (response) {
          // Empty the text field
          getById('textAddComment').value = '';
          // Reload the comments to show the comment has been removed
          getArticleComments(cbCommentInfo.postId, cbCommentInfo);
        })
        .on('40x', function (response) {
          // something is definitely wrong
          // 'x' means any number (404, 400, etc. will match)
          console.log(response);
        })
        .on('500', function (response) {
          // oh crap
          console.log(response);
        })
        .go();
      }
    });
  }
};

// Get all comments for this article id
const getArticleComments = (postId, cbCommentInfo) => {
  showSpinner('loader-comments');
  aja()
    .method('get')
    .url('/api/comments/getByArticleId')
    .cache(false)
    .data({ postId: postId })
    .on('200', function (response) {
      if (Array.isArray(response) && response.length > 0) {

        // Render the comments to HTML
        hideSpinner('loader-comments');
        displayComments(response, cbCommentInfo);
      }
      else {
        hideSpinner('loader-comments');
        const content = '<p>No Comments yet. Have something to contribute to the discussion? Get started above!</p>';
        document.getElementById('newComments').innerHTML = content;
      }
    })
    .go();
};

// Display comments after retrieved via Ajax
function displayComments (allComments, cbCommentInfo) {
  const onlyComments = allComments.filter(comment => comment.type === 'comment');
  const onlyReplies = allComments.filter(comment => comment.type === 'reply').reverse();

  let content = '';

  // Loop through the comments and display them with their replies
  for (let i = 0; i < onlyComments.length; i++) {
    const thisComment = new Comment(onlyComments[i], cbCommentInfo);
    const thisCommentsReplies = onlyReplies.filter(comment => comment.inReplyTo === thisComment.comment._id);

    // Generate comment HTML
    content += `<div id="${thisComment.comment._id}">`;
    content += thisComment.renderComment();
    // Add the replies
    for (let t = 0; t < thisCommentsReplies.length; t++) {
      let thisReply = new Comment(thisCommentsReplies[t], cbCommentInfo);
      content += `<div style="margin-left: 20px;" id="${thisReply.comment._id}">`;
      content += thisReply.renderComment();
      content += '</div>';
    }
    content += '</div>';
  }

  document.getElementById('newComments').innerHTML = content;
  initClickEvents(cbCommentInfo);

  // check for anchors and scroll to the comment if necessary
  if (window.location.hash.length > 0) {
    window.location.href = window.location.hash;
    const currPos = window.pageYOffset;
    window.scrollTo(0, currPos - 90);
  }
}

// Comment Object
class Comment {

  constructor(comment, cbCommentInfo) {
    this.comment = comment;
    this.cbCommentInfo = cbCommentInfo;
  }

  // Render Comment to HTML Element
  renderComment() {
    return this.createComment(this.comment);
  }

  // Create Comment Shell
  createComment(comment) {
    let content = '';
    content += `<a name="${comment._id}" id="${comment._id}"></a>`;
    content += `<div class="comment">`;
    content += this.createTopBar(comment);
    content += this.createAuthor(comment);
    // Check if comment is flagged by the user
    if (this.comment.isFlagged) {
      var userMatch = this.comment.flaggers.find(flagger => flagger === this.cbCommentInfo.user) || [];
      if (userMatch.length > 0) {
        content += '<div class="text text-flagged">';
        content += '<p>You flagged this comment. It will be reviewed by admins and will either be removed or allowed to remain, but you won\'t see it again.</p>';
        content += '</div>';
      }
      else {
        content += this.createText(comment);
      }
    }
    else {
      content += this.createText(comment);
    }
    content += '</div>';
    content += `<div class="reply-box-container" id="reply-box-${comment._id}"></div>`;
    return content;
  }

  // Create Top Bar
  createTopBar(comment) {
    let content = '';
    content += '<div class="comment-top">';
    content += `<span class="score">Score: ${comment.votes}</span> `;
    const alreadyVoted = comment.voters.find(voter => voter === this.cbCommentInfo.user);
    if (alreadyVoted) {
      content += '<span class="plus-one on">+1</span>';
    }
    else {
      content += `<a href="#" class="plus-one" data-commentid="${comment._id}">+1</a>`;
    }
    content += '</div>';
    return content;
  }

  // Create Author Section
  createAuthor(comment) {
    let content = '';
    content += '<div class="author">';
    content += '<div class="user-avatar">';
    content += `<a href="/u/${comment.author.userName}">`;
    if (comment.author.userImage && comment.author.userImage.version) {
      content += `<img src="https://res.cloudinary.com/closebrace/image/upload/t_user_icon/v${comment.author.userImage.version}/${comment.author.userImage.public_id}.jpg" alt="User Icon" class="user-icon" />`;
    }
    else {
      content += '<img src="https://res.cloudinary.com/closebrace/image/upload/t_user_icon/v1491315007/usericon_id76rb.png" alt="Default User Icon" class="user-icon" />';
    }
    content += '</a>';
    if (comment.author.isPro) {
      content += '<a href="/go-pro" class="pro-badge">pro</a>';
    }
    content += '</div>';
    // content += `<div class="score">${comment.author.score}</div>`;
    content += '</div>';
    return content;
  }

  // Create Comment Text
  createText (comment) {

    let content = '';
    let replyToUsername = comment.replyToUsername === 'undefined' ? null : comment.replyToUsername;
    if (comment.isUserDeleted) {
      content += '<div class="text text-flagged">';
    }
    else {
      content += '<div class="text">';
    }
    content += '<h5>';
    content += `by <a href="/u/${comment.author.userName}}">${comment.author.userName}</a>`;
    if (replyToUsername) {
      content += ` in reply to <a href="#${comment.inReplyTo}" class="in-page">${replyToUsername}</a>`;
    }
    content += `<br />${comment.createdAtFormatted}`;
    content += '</h5>';
    content += '<div class="md">';
    if (comment.isUserDeleted) {
      content += '<p>The user has deleted this comment</p>';
    }
    else {
      content += comment.content.html;
    }
    content += '</div>';
    content += this.createLinks(comment);
    content += '</div>';
    return content;
  }

  // Create Comment Links
  createLinks (comment) {
    let content = '';
    content += '<div class="links">';

    // Don't show any links if someone's logged out or not verified
    if (this.cbCommentInfo.user.length > 1) {
      if (this.cbCommentInfo.isVerified) {

        // If the user's an admin, render admin links
        if (this.cbCommentInfo.isAdmin) {
          content += this.createAdminLinks(comment);
        }
        // otherwise render regular links
        else {
          content += this.createNormalLinks(comment);
        }
      }
    }

    content += '</div>';
    return content;
  }

  createAdminLinks (comment) {
    let content = '';
    content += '<a href="#" class="link-delete-comment" data-commentid="' + comment._id + '">Admin Delete</a>';
    if (this.cbCommentInfo.user === comment.author._id && !comment.isUserDeleted) {
      content += '| <a href="#" class="link-delete-comment-user" data-commentid="' + comment._id + '">Delete</a>';
    }
    if (!comment.isUserDeleted) {
      content += '| <a href="#" class="flag link-flag-comment" data-flagger="' + this.cbCommentInfo.user + '" data-commentid="' + comment._id + '">Flag</a> |';
      // reply links need a bunch of stuff
      content += '<a href="#" class="reply-link" data-commentid="';
      content += comment._id;
      content += '" data-author="';
      content += comment.author.userName;
      content += '" data-parentid="';
      content += comment.inReplyTo || 'null';
      content += '">Reply</a>';
    }
    return content;
  }

  createNormalLinks (comment) {
    let content = '';
    // User viewing own comment
    if (this.cbCommentInfo.user === comment.author._id) {
      if (!comment.isUserDeleted) {
        content += '<a href="#" class="link-delete-comment-user" data-commentid="' + comment._id + '">Delete</a> |';
        // reply links need a bunch of stuff
        content += '<a href="#" class="reply-link" data-commentid="';
        content += comment._id;
        content += '" data-author="';
        content += comment.author.userName;
        content += '" data-parentid="';
        content += comment.inReplyTo || 'null';
        content += '">Reply</a>';
      }
    }
    // User is viewing someone else's comment
    else {
      content += '<a href="#" class="flag link-flag-comment" data-flagger="' + this.cbCommentInfo.user + '" data-commentid="' + comment._id + '">Flag</a>';
      if(!comment.isUserDeleted) {
        // reply links need a bunch of stuff
        content += ' | <a href="#" class="reply-link" data-commentid="';
        content += comment._id;
        content += '" data-author="';
        content += comment.author.userName;
        content += '" data-parentid="';
        content += comment.inReplyTo || 'null';
        content += '">Reply</a>';
      }
    }
    return content;
  }
}


function initClickEvents (cbCommentInfo) {

  // Plus One Click
  const plusOneLinks = getByClass('plus-one');
  for (let i = 0; i < plusOneLinks.length; i++) {
    plusOneLinks[i].addEventListener('click', function (e) {
      e.preventDefault();
      const targetCommentId = this.dataset.commentid;
      if (targetCommentId) {
        aja()
        .method('post')
        .url('/api/comments/plusone')
        .body({ id: targetCommentId })
        .cache(false)
        .on('200', function (response) {
          // Reload the comments to show the comment has been removed
          getArticleComments(cbCommentInfo.postId, cbCommentInfo);
        })
        .on('40x', function (response) {
          // something is definitely wrong
          // 'x' means any number (404, 400, etc. will match)
          console.log(response);
        })
        .on('500', function (response) {
          // oh crap
          console.log(response);
        })
        .go();
      }
    });
  }

  // Flag Link Click
  const flagLinks = document.getElementsByClassName('link-flag-comment');
  for (let i = 0; i < flagLinks.length; i++) {
    flagLinks[i].addEventListener('click', function (e) {
      e.preventDefault();
      const targetCommentId = this.dataset.commentid;
      const flagger = this.dataset.flagger;
      const flagConf = confirm('Are you sure you want to flag this comment as abuse / spam / in violation of the community guidelines?');
      if (flagConf) {
        aja()
        .method('post')
        .url('/api/comments/flag')
        .body({ flagger: flagger, id: targetCommentId })
        .cache(false)
        .on('200', function (response) {
          // Reload the comments to show the comment has been removed
          getArticleComments(cbCommentInfo.postId, cbCommentInfo);
        })
        .on('40x', function (response) {
          // something is definitely wrong
          // 'x' means any number (404, 400, etc. will match)
          console.log(response);
        })
        .on('500', function (response) {
          // oh crap
          console.log(response);
        })
        .go();
      }
    });
  }

  // Reply Link Click
  const replyLinks = document.getElementsByClassName('reply-link');
  for (let i = 0; i < replyLinks.length; i++) {
    replyLinks[i].addEventListener('click', function (e) {
      e.preventDefault();

      // Set some variables from the link's data attributes
      const commentId = this.dataset.commentid;
      const parentId = this.dataset.parentid;
      const author = this.dataset.author;
      const replyToId = parentId === 'null' ? commentId : parentId;

      // nuke existing reply boxes (with check);
      if (nukeReplyBoxes() !== true) {
        return;
      }

      // Generate a reply box
      const replyBox = createReplyBox(commentId, author, replyToId, parentId, cbCommentInfo);

      // Insert it below the comment being replied to.
      const replyCommentId = this.dataset.commentid;
      const replyComment = document.getElementById('reply-box-' + replyCommentId);
      while (replyBox.firstChild) {
        replyComment.appendChild(replyBox.firstChild);
        document.getElementById('reply-to-' + this.dataset.parentid).focus();
      }
      initCancelClicks();
      initAddReplyClicks(cbCommentInfo);
    });
  }

  // Delete Comment (admin)
  const adminDeleteLinks = getByClass('link-delete-comment');
  for (let i = 0; i < adminDeleteLinks.length; i++) {
    adminDeleteLinks[i].addEventListener('click', function (e) {
      e.preventDefault();
      const targetCommentID = this.dataset.commentid;
      const deleteConf = confirm('Are you sure you want to delete this comment?');
      // Ajax delete the comment
      if (deleteConf) {
        aja()
        .method('post')
        .url('/api/comments/' + targetCommentID + '/remove')
        .cache(false)
        .on('200', function (response) {
          // Reload the comments to show the comment has been removed
          getArticleComments(cbCommentInfo.postId, cbCommentInfo);
        })
        .on('40x', function (response) {
          // something is definitely wrong
          // 'x' means any number (404, 400, etc. will match)
          console.log(response);
        })
        .on('500', function (response) {
          // oh crap
          console.log(response);
        })
        .go();
      }
    });
  }

  // Delete Comment (user)
  const userDeleteLinks = getByClass('link-delete-comment-user');
  for (let i = 0; i < userDeleteLinks.length; i++) {
    userDeleteLinks[i].addEventListener('click', function(e) {
      e.preventDefault();
      const targetCommentID = this.dataset.commentid;
      const deleteConf = confirm('Are you sure you want to delete this comment?');
      // Ajax delete the comment
      if (deleteConf) {
        aja()
        .method('post')
        .url('/api/comments/' + targetCommentID + '/update')
        .data({ isUserDeleted: true })
        .cache(false)
        .on('200', function (response) {
          // Reload the comments to show the comment has been removed
          getArticleComments(cbCommentInfo.postId, cbCommentInfo);
        })
        .on('40x', function (response) {
          // something is definitely wrong
          // 'x' means any number (404, 400, etc. will match)
          console.log(response);
        })
        .on('500', function (response) {
          // oh crap
          console.log(response);
        })
        .go();
      }
    });
  }
}

// Add Reply Button Click
function initAddReplyClicks (cbCommentInfo) {
  let addReplyButtons = document.getElementsByClassName('btn-add-reply');
  for (let i = 0; i < addReplyButtons.length; i++) {
    // have to use an es5 function declaration to gain access to this
    addReplyButtons[i].addEventListener('click', function (e) {
      e.preventDefault();
      const replyId = this.dataset.replyid;
      const fieldSet = getById('fieldset-' + replyId);

      // Get hidden fields
      const fieldsArray = [].slice.call(fieldSet.childNodes);
      const hiddenFields = fieldsArray.filter(node => node.type === 'hidden');
      const replyText = fieldsArray.find(node => node.type === 'textarea').value;

      // Determine if we want to email replies or not
      const emailDiv = fieldsArray.find(node => node.localName === 'div');
      const divFields = [].slice.call(emailDiv.childNodes);
      const mailReplies = divFields.find(node => node.type === 'checkbox').checked;

      // If there's no reply text, don't bother
      if (replyText === '') {
        return false;
      }
      else {

        // Create a data packet
        const data = {
          isReply: true,
          content: replyText,
          mailReplies,
          emailCommentId: hiddenFields.find(node => node.id === 'emailCommentId').value,
          inReplyTo: hiddenFields.find(node => node.id === 'replyToId').value,
          replyToUsername: hiddenFields.find(node => node.id === 'replyToUserName').value,
          relatedPost: hiddenFields.find(node => node.id === 'hidPostID').value,
          relatedPostTitle: hiddenFields.find(node => node.id === 'hidPostTitle').value,
          relatedPostUrl: window.location.href,
        };

        // Submit it
        aja()
        .method('post')
        .url('/api/comments/create')
        .body(data)
        .cache(false)
        .on('200', function (response) {
          // Reload the comments to show the comment has been removed
          getArticleComments(cbCommentInfo.postId, cbCommentInfo);
        })
        .on('40x', function (response) {
          // something is definitely wrong
          // 'x' means any number (404, 400, etc. will match)
          console.log(response);
        })
        .on('500', function (response) {
          // oh crap
          console.log(response);
        })
        .go();
      }
    });
  }
}

// Cancel Button Click
function initCancelClicks () {
  let cancelButtons = document.getElementsByClassName('btn-reply-cancel');
  for (let i = 0; i < cancelButtons.length; i++) {
    cancelButtons[i].addEventListener('click', e => {
      e.preventDefault();
      nukeReplyBoxes();
    });
  }
}

// Create Comment Reply Box
function createReplyBox (commentId, author, replyToId, parentId, cbCommentInfo) {

  let commentBox = document.createElement('div');
  commentBox.classList.add('reply-box-parent');
  let content = '<div class="reply-box">';
  content += '<div class="add-comment form-in-content">';
  content += '<div class="author">';
  content += '<div class="user-avatar">';
  if (cbCommentInfo.userImage) {
    content += `<img src="https://res.cloudinary.com/closebrace/image/upload/t_user_icon/v${cbCommentInfo.userImage.version}/${cbCommentInfo.userImage.id}.jpg" alt="User Icon" class="user-icon" />`;
  }
  else {
    content += '<img src="https://res.cloudinary.com/closebrace/image/upload/t_user_icon/v1491315007/usericon_id76rb.png" alt="Default User Icon" class="user-icon hide-phone" />';
  }
  if (cbCommentInfo.isPro) {
    content += '<a href="/go-pro" class="pro-badge">pro</a>';
  }
  content += '</div>';
  content += '</div>';
  content += '<div class="text">';
  content += `<fieldset class="reply-fieldset" id="fieldset-${commentId}">`;
  content += `<input type="hidden" id="replyToUserName" value="${author}" />`;
  content += `<input type="hidden" id="replyToId" value="${replyToId}" />`;
  content += `<input type="hidden" id="emailCommentId" value="${commentId}" />`;
  content += `<input type="hidden" id="hidPostID" value="${cbCommentInfo.postId}" />`;
  content += `<input type="hidden" id="hidPostTitle" value="${cbCommentInfo.postTitle}" />`;
  content += `<textarea name="comment" class="comment-text" id="reply-to-${parentId}"></textarea>`;
  content += '<div class="email-confirm">';
  content += `<input type="checkbox" id="emailReplies-${commentId}" checked />`;
  content += `<label for="emailReplies-${commentId}">Email Me When Someone Replies</label>`;
  content += '</div>';
  content += '</fieldset>';
  content += '<div class="button-container">';
  content += '<div><button type="button" class="btn btn-grey btn-reply-cancel">Cancel</button> &nbsp;';
  content += `<button type="button" class="btn btn-primary btn-add-reply" data-replyid="${commentId}">Add Reply</button></div>`;
  content += '</div>';
  content += '</div>';
  content += '</div>';
  content += '</div>';
  commentBox.innerHTML = content;
  return commentBox;
}

// Delete all reply boxes (for reasons)
function nukeReplyBoxes () {

  // Return value
  let boxesNuked = true;

  // Check if any reply box textareas exist
  const textAreas = document.getElementsByClassName('comment-text');
  const replyBoxes = document.getElementsByClassName('reply-box');

  // If they do, check if they have content in them
  if (textAreas.length > 0) {
    let boxHasContent = false;
    for (let t = 0; t < textAreas.length; t++) {
      if (textAreas[t].value !== '') { boxHasContent = true; }
    }
    // Ask for confirmation before nuking all reply boxes
    if (boxHasContent) {
      const nukeReply = confirm('You have an existing reply in progress. This will delete it. Are you sure?');
      if (!nukeReply) {
        boxesNuked = false;
      }
    }
  }

  // Check if boxes should be Nuked and then do stuff
  if (boxesNuked === true) {
    for (let t = 0; t < replyBoxes.length; t++) {
      replyBoxes[t].parentNode.removeChild(replyBoxes[t]);
      boxesNuked = true;
    }
  }

  return boxesNuked;
}

// Show Spinner
const showSpinner = (el) => {
  document.getElementById(el).style.display = 'block';
};

// Hide Spinner
const hideSpinner = (el) => {
  document.getElementById(el).style.display = 'none';
};
