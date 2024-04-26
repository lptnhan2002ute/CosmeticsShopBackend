import { FloatButton, Modal } from 'antd';
import { MessageOutlined } from '@ant-design/icons';
import { useState } from 'react';

const ChatWithAdmin = () => {
    const [open, setOpen] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);

    const handleOpenChat = () => {
        setOpen(true);
    }

    const handleOk = () => {
        setConfirmLoading(true);
        setTimeout(() => {
            setOpen(false);
            setConfirmLoading(false);
        }, 2000);
    };

    const handleCancel = () => {
        setOpen(false);
    };

    return (
        <>
            <FloatButton
                shape="circle"
                type="primary"
                className='right-[60px]'
                tooltip={'Chat với nhân viên tư vấn'}
                onClick={handleOpenChat}
                icon={<MessageOutlined />}
            />
            <Modal
                title="Chat"
                width={360}
                open={open}
                onOk={handleOk}
                confirmLoading={confirmLoading}
                onCancel={handleCancel}
                mask={false}
                maskClosable={false}
                style={{ top: '100%', left: '100%' }}
            >
                <p>Chat!</p>
            </Modal>
        </>
    )

}

export default ChatWithAdmin;