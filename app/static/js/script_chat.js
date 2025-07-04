let socket;
let imageToSend = null;
const myName = JSON.parse(document.getElementById('myNameData').textContent);

$(document).ready(function () {
  if (sessionStorage.getItem('reloadAfterWarning') === 'true') {
    sessionStorage.removeItem('reloadAfterWarning');
    window.location.href = '/';
    return;
  }

const baseURL = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '');
socket = io(baseURL + "/chat", {
  transports: ["websocket"]
});


  window.addEventListener('beforeunload', function (e) {
    const texto = $('#text').val().trim();
    const temImagem = imageToSend !== null;

    if (texto !== '' || temImagem) {
      e.preventDefault();
      e.returnValue = 'You will lose the unsent message or image.';
      sessionStorage.setItem('reloadAfterWarning', 'true');
    }
  });

  document.addEventListener('paste', function (event) {
    const items = event.clipboardData.items;
    for (const item of items) {
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        const reader = new FileReader();
        reader.onload = function (e) {
          imageToSend = e.target.result;
          $('#imagePreview').attr('src', imageToSend);
          $('#imagePreviewContainer').show();
        };
        reader.readAsDataURL(file);
        event.preventDefault();
        break;
      }
    }
  });

  $('#cancelPreviewBtn').on('click', function () {
    imageToSend = null;
    $('#imagePreviewContainer').hide();
    $('#imagePreview').attr('src', '');
  });

  $('#sendImageBtn').on('click', function (event) {
    event.preventDefault();
    $('#imageInput').click();
  });

  $('#imageInput').on('change', function () {
    const file = this.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      imageToSend = e.target.result;
      $('#imagePreview').attr('src', imageToSend);
      $('#imagePreviewContainer').show();
    };
    reader.readAsDataURL(file);

    $(this).val('');
  });

  function sendMessage() {
    const text = $('#text').val().trim();

    if (imageToSend && text.length > 0) {
      socket.emit('message', {
        type: 'both',
        msg: text,
        image: imageToSend
      });
      imageToSend = null;
      $('#imagePreviewContainer').hide();
      $('#imagePreview').attr('src', '');
      $('#text').val('');
    } else if (imageToSend) {
      socket.emit('message', {
        type: 'image',
        msg: imageToSend
      });
      imageToSend = null;
      $('#imagePreviewContainer').hide();
      $('#imagePreview').attr('src', '');
    } else if (text.length > 0) {
      socket.emit('message', {
        type: 'text',
        msg: text
      });
      $('#text').val('');
    }
  }

  $('#sendTextBtn').on('click', sendMessage);

  $('#text').on('keydown', function (e) {
    if (e.key === 'Enter' || e.keyCode === 13) {
      e.preventDefault();
      sendMessage();
    }
  });

  socket.on('connect', function () {
    socket.emit('joined', {});
  });

  socket.on('join_error', function (data) {
    alert(data.msg);
    window.location.href = '/';
  });

  socket.on('status', function (data) {
    const d = new Date();
    $('#chat').append(`
      <div class="status-msg">[${d.toLocaleTimeString()}] <em>${data.msg}</em></div>
    `);
    $('#chat').scrollTop($('#chat')[0].scrollHeight);
  });

  socket.on('message', function (data) {
    const d = new Date();

    const username = data.from || 'Unknown';
    const type = data.type || 'text';
    const messageText = data.msg || '';
    const imageData = data.image || null;

    const isMine = username === myName;

    if (type === 'image') {
      $('#chat').append(`
        <div class="message ${isMine ? 'mine' : 'theirs'} image-message">
          <div class="username">~ ${username}</div>
          <div class="time">${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
          <img src="${messageText}" class="chat-image" />
        </div>
      `);
    } else if (type === 'both' && imageData) {
      $('#chat').append(`
        <div class="message ${isMine ? 'mine' : 'theirs'} both">
          <div class="username">~ ${username}</div>
          <div class="time">${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
          <div class="bubble">
            <img src="${imageData}" class="chat-image" />
            <div class="text">${messageText}</div>
          </div>
        </div>
      `);
    } else {
      $('#chat').append(`
        <div class="message ${isMine ? 'mine' : 'theirs'}">
          <div class="bubble">
            <div class="username">~ ${username}</div>
            <div class="message-line">
              <span class="text">${messageText}</span>
              <span class="time">${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        </div>
      `);
    }

    $('#chat').scrollTop($('#chat')[0].scrollHeight);
  });

  $(document).on('contextmenu', '.bubble', function (e) {
    e.preventDefault();
  });

  $('form').on('submit', function (e) {
    e.preventDefault();
  });
});

function leave_room() {
  socket.emit('left', {}, function () {
    socket.disconnect();
    window.location.href = window.location.origin;
  });
}
