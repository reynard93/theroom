const socket = io();

//elements
const $messageForm = document.querySelector("#message-form");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("#send");
const $locationButton = document.querySelector("#send-location");
const $messages = document.querySelector("#messages");

//templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-template").innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML

//options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

const autoscroll = () => {
  //new message element
  const $newMessage  = $messages.lastElementChild
  //height of the new message
  const newMessageStyles = getComputedStyle($newMessage)
  const newMessageMargin = parseInt(newMessageStyles.marginBottom)
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

  //visible height //also the scrollbar height/the visible height of the container
  const visibleHeight = $messages.offsetHeight

  //Height of messages container
  const containerHeight = $messages.scrollHeight

  //How far have i scrolled? scrolltop is the distance btwn the top of the content and the top of the scrollbar
  const scrollOffset = $messages.scrollTop + visibleHeight

  //figure up if we are scrolled to the bot before the message was added in
  if (containerHeight - newMessageHeight <= scrollOffset) {
    //setting a value for how far down we're scrolled
    $messages.scrollTop = $messages.scrollHeight
  }
}

socket.on("message", msg => {
  const html = Mustache.render(messageTemplate, {
    username: msg.username,
    message: msg.text,
    createdAt: moment(msg.createdAt).format("h:mm a")
  });
  // var c = document.createElement('audio')
  // c.src = 'http://assets1.theroomsoundboard.com/TearingMeApartLisa.mp3'
  // c.play();
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll()
});

socket.on("locationMessage", locmsg => {
  console.log(locmsg);
  const html = Mustache.render(locationTemplate, {
    username: locmsg.username,
    locmsg: locmsg.url,
    createdAt: moment(locmsg.createdAt).format("h:mm a")
  });
  console.log(html);
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll()
});

socket.on('roomData', ({room, users}) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users
  })
  document.querySelector('#sidebar').innerHTML = html;
})

document.querySelector("#message-form").addEventListener("submit", e => {
  e.preventDefault();

  $messageFormButton.setAttribute("disabled", "disabled");
  //disable
  const message = e.target.elements.fmessage.value;

  socket.emit("sendMessage", message, error => {
    $messageFormButton.removeAttribute("disabled");
    $messageFormInput.value = "";
    $messageFormInput.focus();
    //enable
    if (error) {
      return console.error(error);
    }

    console.log("delivery succeeded");
  });
});

$locationButton.addEventListener("click", () => {
  $locationButton.setAttribute("disabled", "disabled");
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser");
  }
  navigator.geolocation.getCurrentPosition(position => {
    socket.emit(
      "sendLocation",
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      },
      () => {
        $locationButton.removeAttribute("disabled");
        console.log("Location shared!");
      }
    );
  });
});

socket.emit("join", { username, room }, error => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
