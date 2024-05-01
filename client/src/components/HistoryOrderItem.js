import { Button } from 'antd'
import React, { useState } from 'react'
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { apiUpdateOrder, apiCreateVnpayUrl } from '../apis';
import CountdownTimer from './CountdownTimer';
import PaymentButton from './PaymentButton';
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

function HistoryOrderItem({ setFetch, listOrder }) {
    const navigate = useNavigate()
    const [isSuccess, setIsSuccess] = useState(false)

    const formatDate = (dataDate) => {

        const date = new Date(dataDate);

        const formattedDate = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        const formattedTime = date.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' });

        return formattedTime + ' ' + formattedDate;
    }

    const handleCancel = async (oid) => {

        const response = await apiUpdateOrder({ status: 'Cancelled' }, oid)

        if (response.success) {

            setFetch(prev => !prev)
            toast.success("Hủy thành công")
        } else {

            toast.success(response.mess)
        }
    }

    const openPaymentWindow = (orderId) => {
        const width = 600;
        const height = 600;
        const left = (window.screen.width / 2) - (width / 2);
        const top = (window.screen.height / 2) - (height / 2);
        // Cấu hình cho cửa sổ mới
        const windowFeatures = `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes,status=yes`;

        // Mở cửa sổ mới với URL tới trang thanh toán
        window.open(`/member/payment/${orderId}`, '_blank', windowFeatures);
    }


    return (
        <>
            {
                listOrder && listOrder?.length > 0 ?
                    listOrder?.map(order => (

                        <div key={order._id} className=" bg-white sm:flex-row pb-[40px] border-b">
                            <div className='grid gap-5 grid-cols-1 sm:grid-cols-4 py-2.5 border-b'>
                                <div>
                                    <p className="text-lg text-gray-800 font-semibold mb-2.5">
                                        Mã đơn hàng
                                    </p>
                                    <p className="text-base uppercase text-gray-600 font-medium">
                                        {order._id}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-lg text-gray-800 font-semibold mb-2.5">
                                        Ngày đặt hàng
                                    </p>
                                    <p className="text-base uppercase text-gray-600 font-medium">
                                        {formatDate(order.createdAt)}
                                    </p>
                                    {order.status === "Unpaid" && <CountdownTimer createdAt={order.createdAt} />}
                                </div>

                                <div>
                                    <p className="text-lg text-gray-800 font-semibold mb-2.5">
                                        Tổng tiền
                                    </p>
                                    <p className="text-base uppercase text-gray-600 font-medium">
                                        {order.total ? order.total.toLocaleString('vi-VN', {
                                            style: 'currency',
                                            currency: 'VND',
                                        }) : "0"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-lg text-gray-800 font-semibold mb-2.5">
                                        Phương thức thanh toán
                                    </p>
                                    <p className="text-base uppercase text-gray-600 font-medium">
                                        {order.paymentMethod}
                                    </p>
                                </div>
                            </div>

                            {
                                order.products.map(product => (
                                    <div key={product.product._id} className="flex pt-[10px]">
                                        <img className="m-2 h-24 w-28 rounded-md border object-contain" src={product.product?.imageUrl[0]} alt="" />
                                        <div className="flex w-[350px] flex-col px-4 py-4">
                                            <span className="font-semibold text-[18px] text-[#333]">{product.product?.productName}</span>
                                            <p className="text-[16px] font-bold">
                                                {(product.product?.price).toLocaleString('vi-VN', {
                                                    style: 'currency',
                                                    currency: 'VND',
                                                })}
                                            </p>
                                            <span className="float-right text-gray-400">x {product.count}</span>
                                        </div>
                                    </div>
                                ))
                            }

                            <div className='mt-[20px] flex items-center gap-[40px]'>
                                <Button className='cursor-default '>
                                    {order.status === "Pending" ? "Đang chờ xác nhận"
                                        : order.status === "Unpaid" ? "Đang chờ thanh toán"
                                            : order.status === "Confirmed" ? "Đang giao"
                                                : order.status === "Shipped" ? "Hoàn thành"
                                                    : order.status === "Cancelled" ? "Đã hủy"
                                                        : ""}
                                </Button>
                                {(order.status === "Unpaid") && (
                                    <Button onClick={() => openPaymentWindow(order._id)}>
                                        Thanh toán
                                    </Button>
                                )}
                                {(order.status === "Pending" || order.status === "Unpaid") && (
                                    <Button onClick={() => handleCancel(order._id)} danger type='primary'>
                                        Hủy đơn hàng
                                    </Button>
                                )}

                            </div>
                        </div>
                    ))
                    : <div>
                        Danh sách đơn hàng trống
                    </div>
            }
        </>
    )
}

export default HistoryOrderItem