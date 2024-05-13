import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { updateCart } from '../store/users/userSlice';
import Swal from 'sweetalert2';
import { apiCreateVnpayUrl, apiOrder, apiDeleteOrder, apiGetUserCart } from "../apis";

const VnPayPaymentComponent = ({ total, payload, setIsSuccess }) => {
    const navigate = useNavigate();
    const dispatchRedux = useDispatch();
    const [loading, setLoading] = useState(false);
    const [redirectUrl, setRedirectUrl] = useState('');

    useEffect(() => {
    }, []);

    const createOrderAndFetchPaymentUrl = async () => {
        setLoading(true);
        try {
            // Create order first
            const orderResponse = await apiOrder({ ...payload })
            if (orderResponse.success) {
                // Fetch payment URL using the orderId
                const paymentResponse = await apiCreateVnpayUrl({ orderId: orderResponse.result._id })

                if (paymentResponse.success) {
                    const getCarts = await apiGetUserCart()

                    dispatchRedux(updateCart({ products: getCarts.userCart.cart.products }))
                    setRedirectUrl(paymentResponse.url);
                    setIsSuccess(true);
                } else {
                    await apiDeleteOrder({ orderId: orderResponse.result._id })
                    Swal.fire('Error', 'Failed to generate VNPay payment URL.', 'error');
                }
            } else {
                Swal.fire('Error', 'Order creation failed.', 'error');
            }
        } catch (error) {
            console.error('Error during the VNPay payment process:', error);
            Swal.fire('Error', 'Error processing your request.', 'error');
        }
        setLoading(false);
    };

    if (redirectUrl) {
        // Redirect user to VNPay payment page
        window.location.href = redirectUrl;
    }

    return (
        <div style={{ maxWidth: "750px", minHeight: "50px", margin: 'auto' }}>
        {loading ? (
            <div className="spinner">Processing your payment...</div>
        ) : (
            <button class="bg-blue-200 py-2 px-4 rounded-md text-center w-full h-14 text-xl flex items-center justify-center" onClick={createOrderAndFetchPaymentUrl}>
                <img className="w-auto h-8" src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-VNPAY-QR-1.png" alt="VNpay" />
            </button>
        )}
    </div>
    );
};

export default VnPayPaymentComponent;