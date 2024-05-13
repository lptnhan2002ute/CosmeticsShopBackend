import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import PaymentButton from '../../components/PaymentButton';
import { apiGetOrderById, apiCreateVnpayUrl } from '../../apis';
import Swal from "sweetalert2";
import { Spin } from 'antd';

const Payment = () => {
    const { oid } = useParams(); // Lấy orderId từ URL
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true); // State để lưu trữ thông tin đơn hàng

    const handleVnPayPayment = async (oid) => {
        try {
            const paymentResponse = await apiCreateVnpayUrl({ orderId: oid });
            if (paymentResponse.success) {
                window.location.href = paymentResponse.url;
            } else {
                throw new Error('Failed to generate VNPay payment URL.');
            }
        } catch (error) {
            Swal.fire("Error", error.message || "Error processing VNPay payment.", "error");
        }
    };

    // Dùng useEffect để gọi API và lấy dữ liệu đơn hàng
    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const orderData = await apiGetOrderById(oid);
                setOrder(orderData);
                setLoading(false);  // Đặt loading thành false sau khi lấy dữ liệu thành công
            } catch (error) {
                console.error('Failed to fetch order:', error);
                setLoading(false);  // Đặt loading thành false nếu có lỗi
            }
        };

        fetchOrder();
    }, [oid]); // Phụ thuộc vào orderId để tái gọi khi orderId thay đổi

    if (loading) {
        return <Spin size="large" />;
    }
    // Chỉ render PaymentButton khi có dữ liệu đơn hàng
    return (
        
        order ? (
            <div className='p-[20px]'>
                <div class="mt-8 space-y-3 ">

{
    order?.result?.products?.map(product => (
    <div key={product?._id} class="flex flex-col rounded-lg bg-white sm:flex-row mb-[20px] border px-2 py-4 sm:px-6">
        {product?.product?.imageUrl && <img class="m-2 h-24 w-28 rounded-md border object-contain" src={product?.product?.imageUrl[0]} alt="" />}
         <div class="flex w-[350px] flex-col px-4 py-4">
            <span class="font-semibold">{product?.product?.productName}</span>
            <p class="text-lg font-bold">
                {product?.product?.price.toLocaleString('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                })}
            </p>
            <span class="float-right text-gray-400">x {product?.count}</span>
        </div>
    </div>
        
    ))
}              <div className='flex items-center gap-2'>
                    <span className='font-medium'>Tên khách hàng:</span>
                    <span className='text-main'>{order?.result?.recipient}</span>
                </div>
               <div className='flex items-center gap-2'>
                    <span className='font-medium'>Địa chỉ khách hàng:</span>
                    <span className='text-main'>{order?.result?.address}</span>
                </div>
                <div className='flex items-center gap-2'>
                    <span className='font-medium'>Số điện thoại:</span>
                    <span className='text-main'>{order?.result?.phone}</span>
                </div>
                <div className='flex items-center gap-2'>
                    <span className='font-medium'>Phương thức thanh toán:</span>
                    <span className='text-main'>{order?.result?.paymentMethod}</span>
                </div>
                <div className='flex items-center gap-2'>
                    <span className='font-medium'>Tổng số tiền:</span>
                    <span className='text-main'>{order?.result?.total}</span>
                    <span className='font-medium'>VNĐ</span>
                </div>
      </div>
                <div className='justify-center flex mt-10'>
                {(order.result.status === "Unpaid" && order.result.paymentMethod === 'VnPay') && (
                    <button onClick={() => handleVnPayPayment(order.result._id)} class="bg-blue-200 py-2 px-4 rounded-md text-center w-full h-14 text-xl flex items-center justify-center" type='primary'>
                        <img className="w-auto h-8" src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-VNPAY-QR-1.png" alt="VNpay" />
                    </button>
                )}
                {(order.result.status === "Unpaid" && order.result.paymentMethod === 'PayPal') && (
                    <PayPalScriptProvider options={{ clientId: "test", components: "buttons", currency: "USD" }}>
                        <PaymentButton order={order.result} />
                    </PayPalScriptProvider>
                )}
                </div>
            </div>
        ) : (
            <div>Loading order details...</div>
        )
    );
}

export default Payment;