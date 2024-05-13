import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import React from 'react'
import { toast } from 'react-toastify';
import { apiUpdateOrder } from '../apis/user';
import CountdownTimer from './CountdownTimer';

function AdminOrderItem({ setKey, setReload, listOrder }) {

    const formatDate = (dataDate) => {

        const date = new Date(dataDate);

        const formattedDate = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        const formattedTime = date.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' });

        return formattedTime + ' ' + formattedDate;
    }

    const handleUpdateOrder = async (status, oid) => {

        let updateStatus = status === "Pending" ? "Confirmed"
            : status === "Confirmed" ? "Shipped"
                : ""
        const response = await apiUpdateOrder({ status: updateStatus }, oid)
        if (response.success) {

            setReload(prev => !prev)
            setKey(status)
            toast.success("Cập nhật thành công")
        } else {
            toast.success("Cập nhật thất bại")
        }
    }
    return (
        <>
            {
                listOrder?.length > 0 ?
                    listOrder.map(order => (
                        <div key={order._id} className=" bg-white sm:flex-row pb-[40px] border-b">
                            <div className='grid gap-[20px] grid-cols-3 py-[10px]'>

                                <div>
                                    <p className="text-[16px] text-[#333] font-[600] mb-[10px]">
                                        Người nhận
                                    </p>
                                    <p className="text-[14px] text-[#999] font-[500]">
                                        {order.recipient}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-[16px] text-[#333] font-[600] mb-[10px]">
                                        Địa chỉ
                                    </p>
                                    <p className="text-[14px] text-[#999] font-[500]">
                                        {order.address}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-[16px] text-[#333] font-[600] mb-[10px]">
                                        Số điện thoại
                                    </p>
                                    <p className="text-[14px] text-[#999] font-[500]">
                                        {order.phone}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-[16px] text-[#333] font-[600] mb-[10px]">
                                        Ngày đặt hàng
                                    </p>
                                    <p className="text-[14px] text-[#999] font-[500]">
                                        {formatDate(order.createdAt)}
                                    </p>
                                    {order.status === "Unpaid" && <CountdownTimer createdAt={order.createdAt} />}
                                </div>

                                <div>
                                    <p className="text-[16px] text-[#333] font-[600] mb-[10px]">
                                        Tổng tiền
                                    </p>
                                    <p className="text-[14px] text-[#999] font-[500]">
                                        {order?.total?.toLocaleString('vi-VN', {
                                            style: 'currency',
                                            currency: 'VND',
                                        })}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[16px] text-[#333] font-[600] mb-[10px]">
                                        Phương thức thanh toán
                                    </p>
                                    <p className="text-[14px] text-[#999] font-[500]">
                                        {order.paymentMethod}
                                    </p>
                                </div>

                            </div>
                            <div className='mt-[20px]'>
                                <Button
                                    disabled={order.status === "Shipped" || order.status === "Cancelled"}
                                    className={`cursor-pointer`}
                                    type='primary'
                                    ghost
                                    icon={
                                        order.status === "Shipped" ? <CheckCircleOutlined className="text-green-500" />
                                            : order.status === "Cancelled" ? <CloseCircleOutlined className="text-red-500" />
                                                : ""
                                    }
                                    onClick={() => handleUpdateOrder(order.status, order._id)}
                                >
                                    {
                                        order.status === "Pending" ? "Xác nhận đơn hàng"
                                            : order.status === "Unpaid" ? "Đang chờ thanh toán"
                                                : order.status === "Confirmed" ? "Hoàn thành đơn hàng"
                                                    : order.status === "Shipped" ? "Đã hoàn thành"
                                                        : order.status === "Cancelled" ? "Đã hủy"
                                                            : ""
                                    }
                                </Button>
                            </div>
                        </div>
                    ))
                    :
                    <div>
                        Danh sách đơn hàng trống
                    </div>
            }
        </>
    )
}

export default AdminOrderItem