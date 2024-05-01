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
    console.log(oid)

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
                setOrder(orderData); // Cập nhật state khi có dữ liệu
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
            <div>
                {(order.result.status === "Unpaid" && order.result.paymentMethod === 'VnPay') && (
                    <button onClick={() => handleVnPayPayment(order.result._id)} type='primary'>
                        Pay with VNPay
                    </button>
                )}
                {(order.result.status === "Unpaid" && order.result.paymentMethod === 'PayPal') && (
                    <PayPalScriptProvider options={{ clientId: "test", components: "buttons", currency: "USD" }}>
                        <PaymentButton order={order.result} />
                    </PayPalScriptProvider>
                )}
            </div>
        ) : (
            <div>Loading order details...</div>
        )
    );
}

export default Payment;