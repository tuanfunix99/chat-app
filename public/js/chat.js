
//elements
const socket = io();
const btnMessage = document.getElementById("send-message");
const btnLocation = document.getElementById("send-location");
const messageInput = document.getElementById("message");
const messages = document.getElementById('messages');

//templates
const messageTemplate = document.getElementById('message-template').innerHTML;
const locationTemplate = document.getElementById('location-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML


// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });


const autoScroll = () => {
   // New message element
   const $newMessage = messages.lastElementChild

   // Height of the new message
   const newMessageStyles = getComputedStyle($newMessage)
   const newMessageMargin = parseInt(newMessageStyles.marginBottom)
   const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

   // Visible height
   const visibleHeight = messages.offsetHeight

   // Height of messages container
   const containerHeight = messages.scrollHeight

   // How far have I scrolled?
   const scrollOffset = messages.scrollTop + visibleHeight

   if (containerHeight - newMessageHeight <= scrollOffset) {
       messages.scrollTop = messages.scrollHeight
   }
}

//socket
socket.on("message", (mess) => {
  const html = Mustache.render(messageTemplate, {
    mess: mess.text,
    username: mess.username,
    createdAt: moment(mess.createdAt).format('h:mm a')
  });
  messages.insertAdjacentHTML('beforeend', html);
  autoScroll();
});

socket.on("locationMessage", (mess) => {
  const html = Mustache.render(locationTemplate, {
    url: mess.url,
    username: mess.username,
    createdAt: moment(mess.createdAt).format('h:mm a')
  });
  messages.insertAdjacentHTML('beforeend', html);
  autoScroll();
})

socket.on('roomData', ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
      room,
      users
  })
  document.querySelector('#sidebar').innerHTML = html
})


btnMessage.addEventListener("click", (e) => {

  btnMessage.setAttribute('disabled', 'disabled');

  socket.emit("sendMessage", messageInput.value, (err) => {
    btnMessage.removeAttribute('disabled');
    messageInput.value = '';
    messageInput.focus();

    if(err){
      alert(err);
    }
  });
});

btnLocation.addEventListener("click", (e) => {

  btnLocation.setAttribute('disabled', 'disabled');

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {

      btnLocation.removeAttribute('disabled');
      socket.emit("sendLocation", {
        lat: position.coords.latitude,
        long: position.coords.longitude,
      }, () => {
        console.log('Shared!');
      });
    });
  } else {
    console.log("error");
  }
});

messageInput.addEventListener('keypress', (e) => {
  if(e.key === 'Enter'){
    socket.emit("sendMessage", messageInput.value, (err) => {
      messageInput.value = '';
      messageInput.focus();
      if(err){
        alert(err);
      }
    });
    e.preventDefault();
  }
})

socket.emit('join', { username, room }, (err) => {
  if(err){
    alert(err);
    location.href = '/';
  }
});
