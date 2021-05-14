/**
 * Instantiate a new Peer
 * @type {Peer}
 */
const peer = new Peer(''+(Math.random().toString(36) + "0000000000000000000").substr(2, 16), /* Change Peer ID if needed */
{
    host: location.hostname,
    debug: 1,
    path: "/" /* Change path if needed */
});

window.peer = peer;

const recordButton = document.querySelector('.record-btn');
const stopButton = document.querySelector('.stop-btn');
const audioContainer = document.querySelector('.call-container');

let conn;
let code;

/**
 * Gets connection code/peer id from caller
 * @returns {string} - the code retrieved
 */
function getStreamCode() {
    code = window.prompt('Please share your peer id: ');
    return code;
}

/**
 * Gets the local audio stream of the current caller
 * @param callbacks - an object to set the success/error behaviour
 * @returns {void}
 */
function getLocalStream() {
    const constraints = {audio: true, video: false}
    navigator.mediaDevices.getUserMedia(constraints).then( stream => {
        setLocalStream(stream);
    }).catch( err => {
        console.log(err)
    });
}

/**
 * Sets the src of the HTML element on the page to the local stream
 * @param stream
 * @returns {void}
 */

function setLocalStream(stream) {
    window.localAudio.srcObject = stream;
    window.localAudio.autoplay = true;
    window.localStream = stream;
}

/**
 * Sets the src of the HTML element on the page to the remote stream
 * @param stream
 * @returns {void}
 */
function setRemoteStream(stream) {
    window.remoteAudio.srcObject = stream;
    window.remoteAudio.autoplay = true;
    window.peerStream = stream;
}

/**
 * Displays the audio controls and correct copy
 * @returns{void}
 */
function showConnectedContent() {
    window.caststatus.textContent = `You're connected`;
    recordButton.hidden = true;
    audioContainer.hidden = false;
}

/**
 * Displays the call button and peer ID
 * @returns{void}
 */
function showCallContent() {
    window.caststatus.textContent = `Your device ID is: ${peer.id}`;
    recordButton.hidden = false;
    audioContainer.hidden = true;
}

/**
 * Connect the peers
 * @returns {void}
 */

function connectPeers() {
    conn = peer.connect(code)
}

/**
 * Get the connection code, connect peers and create a call
 */
recordButton.addEventListener('click', function(){
    getStreamCode();
    connectPeers();
    const call = peer.call(code, window.localStream);
    /**
     * when the call is streaming, set the remote stream for the caller
     */
    call.on('stream', function(stream) {
        setRemoteStream(stream);
        showConnectedContent();
    });
})

/**
 * Close the connection between peers
 */
stopButton.addEventListener('click', function () {
    conn.close();
    showCallContent();
})

/**
 * Display the peer id when server is running
 */
peer.on('open', function () {
    window.caststatus.textContent = `Your device ID is: ${peer.id}`;
});

/**
 * Retrieve id of the peer
 */
peer.on('connection', function(connection){
    conn = connection;
    peer_id = connection.peer;
});

/**
 * When a call has been created, answer it and set the remote stream for the person being called
 */
peer.on('call', function(call) {
    call.answer(window.localStream)
    showConnectedContent();
    call.on('stream', function(stream) {
        setRemoteStream(stream);
    });
    conn.on('close', function (){
        showCallContent();
    })
});

/**
 * Log errors to the console when they occur
 */
peer.on('error', err => console.error(err));

getLocalStream();