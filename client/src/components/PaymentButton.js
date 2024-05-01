import React from 'react';
import { PayPalScriptProvider, PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useDispatch } from 'react-redux';
import { apiUpdateOrder, apiGetUserCart } from '../apis';
import { updateCart } from '../store/users/userSlice';

const PaymentButton = ({ order }) => {
    const navigate = useNavigate();
    const dispatchRedux = useDispatch();
    const [{ isPending }, dispatch] = usePayPalScriptReducer();

    // Cập nhật đơn hàng và giỏ hàng sau khi thanh toán thành công
    const handlePaymentSuccess = async () => {
        const updateResponse = await apiUpdateOrder({ status: 'Confirmed' }, order._id);
        if (updateResponse.success) {
            const cartsResponse = await apiGetUserCart();
            dispatchRedux(updateCart({ products: cartsResponse.userCart.cart.products }));
            Swal.fire("Success", "Payment successful and order confirmed!", "success")
                .then(() => {
                    if (window.opener) { // Kiểm tra xem cửa sổ hiện tại có được mở từ một cửa sổ khác không
                        window.opener.location.reload(); // Reload trang gốc
                    }
                    window.close(); // Đóng cửa sổ hiện tại
                });
        } else {
            Swal.fire("Error", "Failed to update order status.", "error");
        }
    };

    return (
        <PayPalScriptProvider options={{ clientId: "test", components: "buttons", currency: "USD" }}>
            <div>
                {order.status === "Unpaid" && (
                    <div>
                        {isPending && <div className="spinner">Loading...</div>}
                        <PayPalButtons
                            style={{ layout: 'vertical' }}
                            createOrder={(data, actions) => actions.order.create({
                                purchase_units: [{
                                    amount: { value: ((order.total / 25345).toFixed(2)), currency_code: order.currency }
                                }]
                            })}
                            onApprove={(data, actions) => actions.order.capture().then(() => {
                                handlePaymentSuccess();
                            })}
                        />
                    </div>
                )}
            </div>
        </PayPalScriptProvider>
    );
};

export default PaymentButton;
