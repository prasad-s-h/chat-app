console.log('loaded');
const socket = io();

const form = document.querySelector('form');
let input = form.querySelector('input'); // text box to enter the message
let sendButton = form.querySelector('#sendMsg'); //a button to send message from text box
let shareButton = document.querySelector('#shareLocation'); //button to share user location

const messages = document.querySelector('#messages');
const sidebar = document.querySelector('#sidebar');
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

const {username, room} = Qs.parse(location.search, { ignoreQueryPrefix: true});

const autoscroll = () => {
    //new message element
    const newMsg = messages.lastElementChild
    //height of the new message
    const newMsgStyles = getComputedStyle(newMsg);
    const newMsgMargin = parseInt(newMsgStyles.marginBottom);
    const newMsgHeight = newMsg.offsetHeight + newMsgMargin;
    const visibleHeight = messages.offsetHeight;
    const containerHeight = messages.scrollHeight;
    const scrollOffset = messages.scrollTop + visibleHeight;

    if(containerHeight - newMsgHeight <= scrollOffset) {
        messages.scrollTop = messages.scrollHeight;
    }
};

socket.emit('join', {username, room}, (error) => {
    if(error) {
        alert(error);
        location.href = '/';
    } 
});

const boilerPlate = () => {
    sendButton.removeAttribute('disabled'); 
    input.value = ''; 
    input.focus();
};

socket.on('serverSentMsg', (userMessage) => {
    boilerPlate();
    const html = Mustache.render(messageTemplate, {
        username: userMessage.username,
        text: userMessage.text,
        createdAt: moment(userMessage.createdAt).format('h:mm A')
    });
    messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
});


form.addEventListener('submit', (e) => {
    e.preventDefault();

    const textMessage = input.value; //temporarily store in other variable
    
    sendButton.setAttribute('disabled', 'disabled'); //disable button to send message

    socket.emit('clientSentMsg', textMessage, (error) => {
        boilerPlate();
        if(error) {
            return;
        }    
    }); 
});


shareButton.addEventListener('click', () => {

    if(!navigator.geolocation) {
        return alert('geolocation is not supported by your browser');
    }
    
    shareButton.setAttribute('disabled', 'disabled');

    navigator.geolocation.getCurrentPosition( (position) => {
        socket.emit('shareUserLocation', {latitude: position.coords.latitude, longitude: position.coords.longitude}, (ack) => {
            shareButton.removeAttribute('disabled');
            console.log(ack);
        });
    });
});

socket.on('serverSentMsgLocation', (url) => {
    const locationHTML = Mustache.render(locationTemplate, {
        username: url.username,
        url: url.location,
        createdAt: moment(url.createdAt).format('h:mm A')
    });
    messages.insertAdjacentHTML('beforeend', locationHTML);
    autoscroll();
});

socket.on('roomData', ({room, users}) => {
    console.log({room, users});
    const sidebarHTML = Mustache.render(sidebarTemplate, {
        room: room,
        users
    });
    sidebar.innerHTML = sidebarHTML;
});
