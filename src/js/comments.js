// Get all comments for this article id
const getArticleComments = (postId, cbCommentInfo) => {
  aja()
    .method('get')
    .url('/api/comments/getByArticleId')
    .cache(false)
    .data({ postId: postId })
    .on('200', function(response) {
      if (Array.isArray(response) && response.length > 0) {

        // Render the comments to HTML
        displayComments(response, cbCommentInfo);
      }
      else {
        console.log(response);
        alert('no comments');
      }
    })
    .go();
}

// Display comments after retrieved via Ajax
function displayComments(allComments, cbCommentInfo) {
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

}

// Comment Object
class Comment {

  constructor(comment, cbCommentInfo) {
    this.comment = comment;
    this.cbCommentInfo = cbCommentInfo;
  }

  // Render Comment to HTML Element
  renderComment() {
    return this.createComment(this.comment)
  }

  // Create Comment Shell
  createComment(comment) {
    let content = '';
    content += `<a name="${comment._id}"></a>`;
    content += `<div class="comment">`;
    content += this.createAuthor(comment);
    // Check if comment is flagged by the user
    if(this.comment.isFlagged) {
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

  // Create Author Section
  createAuthor(comment) {
    let content = '';
    content += '<div class="author">';
    content += '<div class="user-avatar">';

    if (comment.author.userImage && comment.author.userImage.version) {
      content += `<img src="https://res.cloudinary.com/closebrace/image/upload/t_user_icon/v${comment.author.userImage.version}/${comment.author.userImage.public_id}.jpg" alt="User Icon" class="user-icon" />`;
    }
    else {
      content += '<img src="https://res.cloudinary.com/closebrace/image/upload/t_user_icon/v1491315007/usericon_id76rb.png" alt="Default User Icon" class="user-icon" />';
    }

    if (comment.author.isPro) {
      content += '<a href="/go-pro" class="pro-badge">pro</a>';
    }
    content += '</div>';
    content += '</div>';
    return content;
  }

  // Create Comment Text
  createText(comment) {
    let content = '';
    let replyToUsername = comment.replyToUsername === 'undefined' ? null : comment.replyToUsername;
    content += '<div class="text">';
    content += '<h5>';
    content += `by <a href="/u/${comment.author.userName}}">${comment.author.userName}</a>`;
    if (replyToUsername) {
      content += ` in reply to ${replyToUsername}`;
    }
    content += `<br />${comment.createdAtFormatted}`;
    content += '</h5>';
    content += '<div class="md">';
    content += comment.content.html;
    content += '</div>';
    content += this.createLinks(comment);
    content += '</div>';
    return content;
  }

  // Create Comment Links
  createLinks(comment) {
    let content = '';
    content += '<div class="links">';

    // Don't show any links if someone's logged out or not verified
    if (this.cbCommentInfo.user.length > 1) {
      if(this.cbCommentInfo.isVerified) {

        // If the user's an admin, render admin links
        if(this.cbCommentInfo.isAdmin) {
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

  createAdminLinks(comment) {
    let content = '';
    content += '<a href="#" class="link-delete-comment" data-commentid="' + comment._id + '">Admin Delete</a>';
    if (this.user === comment.author._id && !comment.isUserDeleted) {
      content += '| <a href="#" class="link-delete-comment-user" data-commentid="' + comment._id + '">Delete</a>';
    }
    if (!comment.isUserDeleted) {
      content += '| <a href="#" class="flag link-flag-comment" data-flagger="' + this.cbCommentInfo.user + '" data-commentid="' + comment._id + '">Flag</a> |';
      // reply links need a bunch of stuff
      content += '<a href="#" class="reply-link" data-commentid="';
      content += comment._id;
      content += '" data-author="';
      content += comment.author.userName;
      content += '" data-parentid="'
      content += comment.inReplyTo;
      content += '">Reply</a>';
    }
    return content;
  }

  createNormalLinks(comment) {
    let content = '';
    // User viewing own comment
    if (this.user === comment.author._id) {
      if (!comment.isUserDeleted) {
        content += '<a href="#" class="link-delete-comment-user" data-commentid="' + comment._id + '">Delete</a> |';
        // reply links need a bunch of stuff
        content += '<a href="#" class="reply-link" data-commentid="';
        content += comment._id;
        content += '" data-author="';
        content += comment.author.userName;
        content += '" data-parentid="'
        content += comment.inReplyTo;
        content += '">Reply</a>';
      }
    }
    // User is viewing someone else's comment
    else {
      content += '<a href="#" class="flag link-flag-comment" data-flagger="' + this.cbCommentInfo.user + '" data-commentid="' + comment._id + '">Flag</a>';
      if(!comment.isUserDeleted) {
        // reply links need a bunch of stuff
        content += '<a href="#" class="reply-link" data-commentid="';
        content += comment._id;
        content += '" data-author="';
        content += comment.author.userName;
        content += '" data-parentid="'
        content += comment.inReplyTo;
        content += '">Reply</a>';
      }
    }
    return content;
  }
}


function initClickEvents(cbCommentInfo) {

  // Flag Link Click
  const flagLinks = document.getElementsByClassName('link-flag-comment');
  for (let i = 0; i < flagLinks.length; i++) {
    flagLinks[i].addEventListener('click', function(e){
      e.preventDefault();
      let targetCommentId = this.dataset.commentid;
      let flagger = this.dataset.flagger;
      let flagConf = confirm('Are you sure you want to flag this comment as abuse / spam / in violation of the community guidelines?');
      if (flagConf) {
        aja()
        .method('post')
        .url('/api/comments/flag')
        .body({ flagger: flagger, id: targetCommentId })
        .cache(false)
        .on('200', function(response){
          // Reload the comments to show the comment has been removed
          getArticleComments(cbCommentInfo.postId, cbCommentInfo);
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

  // Reply Link Click
  let replyLinks = document.getElementsByClassName('reply-link');
  for (let i = 0; i < replyLinks.length; i++) {
    replyLinks[i].addEventListener('click', function(e) {
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
      while(replyBox.firstChild) {
        replyComment.appendChild(replyBox.firstChild);
        document.getElementById('reply-to-' + this.dataset.parentid).focus();
      }
      initCancelClicks();
      initAddReplyClicks(cbCommentInfo);
    });
  }
}

// Add Reply Button Click
function initAddReplyClicks(cbCommentInfo) {
  let addReplyButtons = document.getElementsByClassName('btn-add-reply');
  for (let i = 0; i < addReplyButtons.length; i++) {
    // have to use an es5 function declaration to gain access to this
    addReplyButtons[i].addEventListener('click', function(e) {
      e.preventDefault();
      const replyId = this.dataset.replyid;
      const fieldSet = document.getElementById('fieldset-' + replyId);
      // Get hidden fields
      const fieldsArray = [].slice.call(fieldSet.childNodes);
      const hiddenFields = fieldsArray.filter(node => node.type === 'hidden');
      const replyText = fieldsArray.find(node => node.type === 'textarea').value;
      // If there's no reply text, don't bother
      if (replyText === '') {
        return false;
      }
      else {

        // Create a data packet
        const data = {
          isReply: true,
          content: replyText,
          inReplyTo: hiddenFields.find(node => node.id === 'replyToId').value,
          replyToUsername: hiddenFields.find(node => node.id === 'replyToUserName').value,
          relatedPost: hiddenFields.find(node => node.id === 'hidPostID').value,
          relatedPostTitle: hiddenFields.find(node => node.id === 'hidPostTitle').value,
        };

        // Submit it
        aja()
        .method('post')
        .url('/api/comments/create')
        .body(data)
        .cache(false)
        .on('200', function(response){
          // Reload the comments to show the comment has been removed
          getArticleComments(cbCommentInfo.postId, cbCommentInfo);
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
    })
  }
}

// Cancel Button Click
function initCancelClicks() {
  let cancelButtons = document.getElementsByClassName('btn-reply-cancel');
  for (let i = 0; i < cancelButtons.length; i++) {
    cancelButtons[i].addEventListener('click', e => {
      e.preventDefault();
      nukeReplyBoxes();
    })
  }
}

// Create Comment Reply Box
function createReplyBox(commentId, author, replyToId, parentId, cbCommentInfo) {

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
  content += `<input type="hidden" id="hidPostID" value="${cbCommentInfo.postId}" />`;
  content += `<input type="hidden" id="hidPostTitle" value="${cbCommentInfo.postTitle}" />`;
  content += `<textarea name="comment" class="comment-text" id="reply-to-${parentId}"></textarea>`;
  content += '</fieldset>';
  content += '<div class="button-container">';
  content += '<div><p>You can use <a href="https://daringfireball.net/projects/markdown/syntax" target="_blank">Markdown</a> in comments.</p></div>';
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
function nukeReplyBoxes() {

  // Return value
  let boxesNuked = true;
  let nukeBoxes = true;

  // Check if any reply box textareas exist
  const textAreas = document.getElementsByClassName('comment-text');
  const replyBoxes = document.getElementsByClassName('reply-box');

  // If they do, check if they have content in them
  if (textAreas.length > 0) {
    let boxHasContent = false;
    for (let t = 0; t < textAreas.length; t++) {
      if (textAreas[t].value !== '') { boxHasContent = true }
    }
    // Ask for confirmation before nuking all reply boxes
    if (boxHasContent) {
      const nukeReply = confirm('You have an existing reply in progress. This will delete it. Are you sure?');
      if (!nukeReply) {
        nukeBoxes = false;
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
