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
<div className="flex items-center justify-center h-screen">
  <div className="absolute inset-0">
    <img className="w-full h-full object-cover" src="https://png.pngtree.com/thumb_back/fw800/background/20240102/pngtree-vibrant-watercolor-cosmetics-pattern-hand-painted-seamless-texture-featuring-makeup-artist-image_13929452.png" alt="Background" />
  </div>
  <div className="relative text-center">
    <svg className="animate-spin h-10 w-10 text-gray-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <p className="text-gray-600">Loading your payment status...</p>
  </div>
</div>
    );
};

export default VnPayReturnHandler;
