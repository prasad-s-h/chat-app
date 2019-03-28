console.log('loaded');
const socket = io();

const form = document.querySelector('form');
let input = form.querySelector('input');
let para1 = form.querySelector('#receivedMessage');
let para2 = form.querySelector('#notification');
let sendButton = form.querySelector('#sendMsg');
let shareButton = document.querySelector('#shareLocation');

form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    sendButton.setAttribute('disabled', 'disabled');

    const textMessage = input.value;
    console.log('textMessage = ', textMessage);

    socket.emit('clientSentMsg', textMessage, (error) => {
        sendButton.removeAttribute('disabled');
        input.value = '';
        input.focus();

        if(error) {
            return para1.textContent = error;
        }    
    }); 
});

socket.on('serverSentMsg', (userMessage) => {
    para1.textContent = `${userMessage}`;
});

socket.on('notification', (notification) => {
    para2.textContent = notification;        
});

shareButton.addEventListener('click', () => {
    if(!navigator.geolocation) {
        return alert('geolocation is not supported by your browser');
    }

    navigator.geolocation.getCurrentPosition( (position) => {
        socket.emit('shareUserLocation', {latitude: position.coords.latitude, longitude: position.coords.longitude}, (ack) => {
            console.log(ack);
        });
    });
});