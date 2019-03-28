console.log('loaded');
const socket = io();

const form = document.querySelector('form');
let input = form.querySelector('input'); // text box to enter the message
let para1 = form.querySelector('#receivedMessage'); //first paragraph to display the message entered by user OR Location Details
let para2 = form.querySelector('#notification'); //second paragraph to display notification about new user join and user leaving
let sendButton = form.querySelector('#sendMsg'); //a button to send message from text box
let shareButton = document.querySelector('#shareLocation'); //button to share user location

const boilerPlate = () => {
    sendButton.removeAttribute('disabled'); 
    input.value = ''; 
    input.focus();
};

sendButton.addEventListener('click', () => {
    
    const textMessage = input.value; //temporarily store in other variable
    console.log('textMessage = ', textMessage); 
    
    sendButton.setAttribute('disabled', 'disabled'); //disable button to send message

    socket.emit('clientSentMsg', textMessage, (error) => {
        boilerPlate();
        if(error) {
            return para1.textContent = error;
        }    
    }); 
});

socket.on('serverSentMsg', (userMessage) => {
    boilerPlate();
    para1.textContent = `${userMessage}`;
});

socket.on('notification', (notification) => {
    para2.textContent = notification;        
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