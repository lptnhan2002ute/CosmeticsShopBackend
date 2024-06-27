import { Badge, FloatButton, Input, Image } from 'antd';
import { MessageOutlined, FileImageTwoTone } from '@ant-design/icons';
import { useEffect, useState, useRef } from 'react';
import { IoMdClose, IoIosSend } from "react-icons/io";
import socket from '../../socket/socket';
import { apiGetMessagesInSession, apiSendMessageInSession, apiStartChatSession } from './../../apis/chat';
import { RiUserFollowFill } from "react-icons/ri";
import { useDispatch, useSelector } from 'react-redux';
import { setSessionId } from '../../store/chatSlice'

const title = "Chat với nhân viên tư vấn";

const ChatWithAdmin = () => {
    const { sessionId } = useSelector(state => state.chat);

    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [currentSessionId, setCurrentSessionId] = useState(sessionId);
    const [isClosedSession, setIsClosedSession] = useState(false);

    const handleOpenChatModal = () => {
        setOpen(true);
    }

    const handleGetMessages = async () => {
        const rs = await apiGetMessagesInSession(currentSessionId);
        setMessages(rs);
    }

    useEffect(() => {
        if (currentSessionId) {
            handleGetMessages();
        }
    }, [currentSessionId])

    useEffect(() => {
        const handleListenMessage = (data) => {
            setMessages(prevMessages => [...prevMessages, data]);
        };
        const handleClosedSession = () => {
            setIsClosedSession(true);
        }
        socket.on("message", handleListenMessage);
        socket.on("closeSession", handleClosedSession);

        return () => {
            socket.off("message", handleListenMessage);
        };
    }, [currentSessionId])

    return (
        <>
            <FloatButton
                shape="circle"
                type="primary"
                className={`${open ? 'invisible opacity-0' : 'visible opacity-100'} right-[60px] cursor-pointer transition-all duration-1000`}
                tooltip={title}
                onClick={handleOpenChatModal}
                icon={<MessageOutlined />}
            />
            <ModalChat props={{ open, setOpen, messages, setMessages, currentSessionId, setCurrentSessionId, isClosedSession, setIsClosedSession }} />
        </>
    )

}

const ModalChat = ({ props }) => {
    const { open, setOpen, messages, setMessages, currentSessionId, setCurrentSessionId, isClosedSession, setIsClosedSession } = props;

    const { current: currentUser } = useSelector(state => state.user);
    const dispatch = useDispatch();

    const [message, setMessage] = useState("");

    const fileInputRef = useRef(null);
    const [selectedFiles, setSelectedFiles] = useState([]);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setSelectedFiles(files);
    };

    const handleInputFileClick = () => {
        fileInputRef.current.click();
    };

    const handleSendMessage = async (message) => {
        if ((!message && selectedFiles.length < 1) || !currentSessionId)
            return;

        const formData = new FormData();
        formData.append('senderUserID', currentUser._id);
        formData.append('sessionID', currentSessionId);
        formData.append('messageText', message);
        selectedFiles.forEach(file => {
            formData.append('images', file);
        });

        const rs = await apiSendMessageInSession(formData);

        const messageFullInformation = { ...rs, senderUserID: { _id: rs.senderUserID, avatar: currentUser.avatar } }
        socket.emit("chatMessage", { sessionId: currentSessionId, message: messageFullInformation });
        setMessages([...messages, messageFullInformation]);
        setMessage("");
        setSelectedFiles([]);
    }

    const handleStartChat = async () => {
        const rs = await apiStartChatSession({
            adminUserID: '666067d4860a5a9ae9539a05',
            // adminUserID: '657310e2771a300e61cf043e', //TODO: remove adminUserId with another logic
            customerUserID: currentUser._id
        })

        dispatch(setSessionId({ sessionId: rs._id }));
        setCurrentSessionId(rs._id);
        setIsClosedSession(false);
        socket.emit('newSession', rs);
        socket.emit('joinRoom', { sessionId: rs._id });
    }

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
        <div className={`${open ? 'opacity-100 bottom-[40px]' : 'opacity-0 bottom-[-100%]'} fixed flex flex-col w-[320px] h-[450px] bg-red-100 text-black rounded-lg right-[30px] z-[101] shadow-lg transition-all duration-300`}>
            <div className='flex justify-between bg-[#ff007f] rounded-t-lg text-white font-medium text-md min-h-[60px] px-4 py-2'>
                {title}
                <IoMdClose onClick={() => setOpen(false)} size={22} className='hover:opacity-80 cursor-pointer' />
            </div>
            <div className='flex flex-col flex-1 px-4 pt-2 pb-4'>
                {messages?.length === 0 && !currentSessionId ?
                    <div onClick={handleStartChat} className='flex my-6 cursor-pointer hover:opacity-80 text-white text-xs font-semibold py-1 leading-7 w-[70%] mx-auto items-center justify-center gap-2 bg-[#ff007f] rounded-xl mt-auto'>
                        <IoIosSend size={20} /> BẮT ĐẦU TRÒ CHUYỆN
                    </div> :
                    <div ref={chatContainerRef} className='flex flex-col gap-4 overflow-y-auto max-h-[320px] chat__session__content'>
                        {
                            messages.map((e, i) => {
                                if (e.senderUserID._id !== currentUser._id) {
                                    return <div key={i} className='flex gap-2 items-center'>
                                        <RiUserFollowFill color='#ff007f' size={24} />
                                        <div className='flex flex-col gap-2 justify-center'>
                                            <div className='flex flex-wrap max-w-[180px] gap-1'>
                                                {e?.imageUrls?.length > 0 && e.imageUrls.map(img => <Image width={80} src={img} />)}
                                            </div>
                                            {e.messageText && <p className='text-sm font-medium break-words max-w-[180px] bg-red-200 py-2 px-4 rounded-lg'>{e.messageText}</p>}
                                        </div>
                                    </div>
                                }
                                return <div key={i} className='flex flex-col gap-2 items-end justify-center'>
                                    <div className='flex flex-wrap justify-end max-w-[180px] gap-1'>
                                        {e?.imageUrls?.length > 0 && e.imageUrls.map(img => <Image width={80} src={img} />)}
                                    </div>
                                    {e.messageText && <p className='text-sm font-medium break-words max-w-[180px] bg-red-300 py-2 px-4 rounded-lg'>{e.messageText}</p>}
                                </div>
                            })
                        }
                    </div>
                }
            </div>
            {
                currentSessionId && !isClosedSession ?
                    <div className='flex items-center gap-4 p-4 pt-2 bg-red-100 rounded-b-lg'>
                        <Badge count={selectedFiles.length}>
                            <Input
                                className='w-[20px] p-0 bg-transparent pr-1 cursor-pointer border-0'
                                prefix={<FileImageTwoTone onClick={handleInputFileClick} />}
                            />
                        </Badge>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className='hidden'
                            onChange={handleFileChange}
                            multiple
                            accept='image/*'
                        />
                        <Input onPressEnter={() => handleSendMessage(message)} value={message} onChange={(e) => setMessage(e.target.value)} className='bg-slate-100' placeholder='Nhập nội dung' />
                        <IoIosSend onClick={() => handleSendMessage(message)} color='#ff007f' className='cursor-pointer' size={26} />
                    </div> : currentSessionId && isClosedSession ?
                        <div onClick={handleStartChat} className='flex my-6 cursor-pointer hover:opacity-80 text-white text-xs font-semibold py-1 leading-7 w-[70%] mx-auto items-center justify-center gap-2 bg-[#ff007f] rounded-xl mt-auto'>
                            <IoIosSend size={20} /> BẮT ĐẦU TRÒ CHUYỆN MỚI
                        </div> : ''
            }
        </div>
    )
}

export default ChatWithAdmin;