import axios from "../axios";

export const apiStartChatSession = (data) => axios({
    url: '/chat/start',
    method: 'post',
    data,
    withCredentials: true
})

export const apiCloseChatSession = (sid) => axios({
    url: '/chat/close/' + sid,
    method: 'put',
    withCredentials: true
})

export const apiGetMessagesInSession = (sid) => axios({
    url: '/chat/messages/' + sid,
    method: 'get',
    withCredentials: true
})

export const apiSendMessageInSession = (data) => axios({
    url: '/chat/send',
    method: 'post',
    data,
    withCredentials: true
})

export const apiGetAllChatSessions = (uid) => axios({
    url: '/chat/' + uid,
    method: 'get',
    withCredentials: true
})