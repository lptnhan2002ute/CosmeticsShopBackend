import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiVnpayIpn } from '../../apis';
import Swal from 'sweetalert2';

const VnPayReturnHandler = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [paymentStatus, setPaymentStatus] = useState('loading');

    // Function to handle redirection with delay and Swal
    useEffect(() => {
        const processPaymentStatus = async () => {
            const queryParams = new URLSearchParams(location.search);
            try {
                const response = await apiVnpayIpn(Object.fromEntries(queryParams));
                console.log(response)
                if (response.RspCode === '00') {
                    Swal.fire({
                        title: 'Success',
                        text: `Payment for order ${queryParams.get('vnp_TxnRef')} was successful!`,
                        icon: 'success',
                    }).then(async () => {
                        if (window.opener) {
                            window.opener.location.reload(); // Làm mới cửa sổ gọi popup
                            window.close(); // Đóng cửa sổ popup
                        } else {
                            navigate("/member/buy-history");
                        }
                    });
                } else {
                    Swal.fire({
                        title: 'Payment Failed',
                        text: response.Message || 'Transaction failed.',
                        icon: 'error',
                    }).then(() => navigate("/products"));
                }
            } catch (error) {
                console.error('Error verifying VNPay payment:', error);
                Swal.fire({
                    title: 'Error',
                    text: 'An error occurred while verifying the payment.',
                    icon: 'error',
                }).then(() => navigate("/member/buy-history"));
            }
        };

        processPaymentStatus();
    }, [location.search, navigate]);

    return (
        <div>Loading your payment status...</div>
    );
};

export default VnPayReturnHandler;
