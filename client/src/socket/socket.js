import io from 'socket.io-client';
let socket;


const getToken = () => {
    let localStorageData = window.localStorage.getItem('persist:shop/user');
    if (localStorageData) {
        localStorageData = JSON.parse(localStorageData);
        const accessToken = JSON.parse(localStorageData?.token);
        return accessToken;
    }
    return null;
};

export const initiateSocketConnection = () => {
    const token = getToken();
    socket = io(process.env.REACT_APP_API_URI, {
        auth: {
            token: `Bearer ${token}`
        },
    });
    console.log('Connecting socket...');
    return socket;
};


export const disconnectSocket = () => {
    console.log('Disconnecting socket...');
    if (socket) socket.disconnect();
};

export const joinRoom = (sessionId) => {
    if (socket) socket.emit('joinRoom', { sessionId });
};

export const subscribeToChat = (cb) => {
    if (!socket) return true;

    socket.on('message', (msg) => {
        console.log('New message received!');
        cb(msg);
    });
};

export const sendMessage = (sessionId, message) => {
    if (socket) socket.emit('chatMessage', { sessionId, message });
};