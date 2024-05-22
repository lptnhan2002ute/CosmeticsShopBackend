import React, { useEffect, useState, useRef } from 'react';
import { apiGetAllChatSessions, apiGetMessagesInSession, apiSendMessageInSession, apiCloseChatSession } from '../../apis/chat';
import { useSelector } from 'react-redux'
import { Badge, Button, Input } from 'antd';
import { IoIosSend } from "react-icons/io";
import socket from '../../socket/socket';

const Messenger = () => {
    const [sessions, setSessions] = useState([]);
    const [messages, setMessages] = useState([]);
    const [activeSession, setActiveSession] = useState(null);

    const [textMessage, setTextMessage] = useState("");

    const { current } = useSelector(state => state.user);

    const handleSendMessage = async (message) => {
        if (!message || !activeSession)
            return;

        const rs = await apiSendMessageInSession({
            senderUserID: current._id,
            sessionID: activeSession,
            messageText: textMessage
        });
        const messageFullInformation = { ...rs, senderUserID: { _id: rs.senderUserID, avatar: current.avatar } }
        socket.emit("chatMessage", { sessionId: activeSession, message: messageFullInformation });
        setMessages([...messages, messageFullInformation]);
        setTextMessage("");
    }

    const handleCloseSession = async () => {
        if (!activeSession)
            return;

        const rs = await apiCloseChatSession(activeSession);
        socket.emit("closeSession", { sessionId: activeSession });
        const newSessions = sessions.map((e) => {
            if (e._id === activeSession) {
                return ({
                    ...e,
                    status: "Closed"
                })
            }
            return e;
        })
        setSessions(newSessions);
    }

    useEffect(() => {
        if (!activeSession)
            return;

        const getMessages = async () => {
            const rs = await apiGetMessagesInSession(activeSession);
            setMessages(rs);
        }
        const handleListenMessage = (data) => {
            setMessages(prevMessages => [...prevMessages, data]);
        };

        getMessages();

        socket.on("message", handleListenMessage);

        return () => {
            socket.off("message", handleListenMessage);
        };
    }, [activeSession])

    useEffect(() => {
        const getSessions = async () => {
            const rs = await apiGetAllChatSessions(current._id);
            setSessions(rs);
        }

        getSessions();
    }, [])

    const chatContainerRef = useRef(null);
    const scrollToBottom = () => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    };
    useEffect(() => {
        scrollToBottom();
    }, [messages])

    return (
        <div className='flex-1 h-[600px] overflow-hidden'>
            <div className='flex gap-4 '>
                <div className='flex flex-col h-screen min-w-[300px] bg-pink-400'>
                    <div className='py-4 text-center font-semibold mb-4'>
                        Khách hàng
                    </div>
                    <div className='admin-messenger-scroll-custom flex flex-col gap-4 overflow-y-auto'>
                        {
                            sessions.map((e, i) => <SessionItem key={i} props={e} isClosed={e.status === "Closed"} isActive={activeSession === e._id} currentSession={activeSession} setActive={setActiveSession} />)
                        }
                    </div>
                </div>
                <div className='flex-1 flex flex-col pl-4 py-12 mx-auto max-h-screen relative'>
                    {activeSession && sessions.filter(e => e._id === activeSession)?.at(0)?.status !== "Closed" &&
                        <Button onClick={handleCloseSession} className='self-center mr-8 absolute top-4 z-10' type='primary' danger>Close Session</Button>
                    }
                    <div ref={chatContainerRef} className='flex flex-col gap-6 break-words p-4 pr-6 h-[500px] overflow-y-auto'>
                        {messages.map((e, i) => <MessageItem key={i} content={e.messageText} avatar={e.senderUserID?.avatar} isMe={e.senderUserID._id === current._id} />)}
                    </div>
                    {activeSession && sessions.filter(e => e._id === activeSession)?.at(0)?.status !== "Closed" &&
                        <div className='flex items-center gap-4 p-4 pt-2 mr-6 bg-red-100 rounded-lg'>
                            <Input onPressEnter={() => handleSendMessage(textMessage)} value={textMessage} onChange={(e) => setTextMessage(e.target.value)} className='bg-slate-100' placeholder='Nhập nội dung' />
                            <IoIosSend onClick={() => handleSendMessage(textMessage)} color='#ff007f' className='cursor-pointer' size={26} />
                        </div>
                    }
                </div>
            </div>
        </div>
    )
}

const SessionItem = ({ props, currentSession, isClosed, isActive, setActive }) => {
    const handleActiveSession = (id) => {
        socket.emit('leaveRoom', { sessionId: currentSession });
        socket.emit('joinRoom', { sessionId: id });
        setActive(id);
    }

    return (
        <div onClick={() => handleActiveSession(props._id)} className={`${isClosed ? 'bg-gray-300' : ''} ${isActive ? 'bg-red-300' : ''} cursor-pointer p-4 rounded-lg flex items-center gap-4 text-sm hover:bg-red-200`}>
            <div className='w-[40px] h-[40px] overflow-hidden rounded-full'>
                <img src={props?.customerUserID?.avatar} />
            </div>
            <div className='flex flex-col'>
                <div className=''>
                    {props?.customerUserID?.name}
                </div>
                <div className=''>
                    {props?.customerUserID?.email}
                </div>
            </div>
            {isClosed && <Badge count="Closed" />}
        </div>
    )
}

const MessageItem = ({ content, avatar, isMe }) => {
    return (
        <div className={`${isMe ? 'self-end' : ''} flex gap-2 items-center`}>
            {!isMe &&
                <div className='w-[30px] h-[30px] rounded-full overflow-hidden'>
                    <img src={avatar} />
                </div>
            }
            <div className={`${isMe ? 'bg-red-300' : 'bg-red-200'} max-w-[340px] break-words text-sm py-2 px-4 rounded-lg`}>
                {content}
            </div>
        </div>
    )
}

export default Messenger