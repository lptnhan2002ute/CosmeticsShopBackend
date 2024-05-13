import axios from "../axios";

export const apiStartChatSession = (data) => axios({
    url: '/chat/start',
    method: 'post',
    data
})

export const apiCloseChatSession = (sid) => axios({
    url: '/chat/close/' + sid,
    method: 'put'
})

export const apiGetMessagesInSession = (sid) => axios({
    url: '/chat/messages/' + sid,
    method: 'get'
})

export const apiSendMessageInSession = (data) => axios({
    url: '/chat/send',
    method: 'post',
    data
})

export const apiGetAllChatSessions = (uid) => axios({
    url: '/chat/' + uid,
    method: 'get'
})