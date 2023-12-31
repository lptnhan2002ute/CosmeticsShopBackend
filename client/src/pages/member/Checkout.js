import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import logo from "../../assets/logo.svg.png"
import { cash } from '../../ultils/contants'
import { useLocation, useNavigate } from "react-router-dom"
import { Button, Form, Input, message, Modal } from 'antd';
import { apiGetUserCart, apiOrder } from '../../apis'
import { toast } from 'react-toastify'
import { useDispatch } from 'react-redux'
import { Spin } from 'antd'
import { updateCart } from '../../store/users/userSlice'
import PayPal from '../../components/PayPal'
import { useDebounce } from 'use-debounce';

const Checkout = () => {

    const dispatch = useDispatch()
    const navigate = useNavigate()
    const location = useLocation()
    const [form] = Form.useForm();
    const [paymentMethod, setPaymentMethod] = useState(cash)
    const [total, setTotal] = useState(0)
    const { listCheckout } = location.state || []
    const [loading, setLoading] = useState(false)
    const [list, setList] = useState([])
    const [isSuccess, setIsSuccess] = useState(false)
    const [payPalPayload, setPayPalPayload] = useState({
        products: [],
        paymentMethod: "PayPal",
        total: 0,
        recipient: '',
        phone: '',
        address: '',
        note: '',
        // Khởi tạo các trường khác nếu cần
    });
    const [formData, setFormData] = useState({
        recipient: '',
        phone: '',
        address: '',
        note: '',
    });
    // const [debouncedFormData] = useDebounce(formData, 5000); // 3000ms là thời gian trì hoãn


    React.useEffect(() => {

        setList(listCheckout)
    }, [])

    React.useEffect(() => {

        const result = list.reduce((acc, curr) => acc + curr.quantity * curr.product.price, 0)
        setTotal(result)
    }, [list])

    // React.useEffect(() => {
    //     if(isSuccess) dispatch
    // }, [isSuccess])
    const onFinish = async (values) => {

        const products = list.map(item => ({
            product: item.product._id,
            count: item.quantity,
        }))

        const dataOrder = {
            products,
            paymentMethod,
            total,
            ...values
        }
        try {
            setLoading(true)
            const response = await apiOrder(dataOrder)
            if (response.success) {

                const getCarts = await apiGetUserCart()
                dispatch(updateCart({ products: getCarts.userCart.cart.products }))
                Modal.success({
                    title: 'Thành công!',
                    content: (
                        <div className='flex flex-col items-center justify-center'>
                            <p className='text-[16px] text-[#333] font-[500]'>Chúc mừng bạn đã đặt hàng thành công</p>
                            <p className="text-[14px] text-[#333]">Tiếp tục mua hàng ngay...</p>
                        </div>
                    ),
                    onOk() { navigate("/products") },
                });
            } else {
                if (response.status === "soldout") {

                    if (response.product.length === listCheckout.length) {

                        Modal.warning({
                            title: 'Lưu ý',
                            content: (
                                <div className='flex flex-col items-center justify-center'>
                                    {
                                        response.product.map(productItem => (
                                            <p key={productItem._id} className='text-[16px] text-[#333] font-[500]'>
                                                {productItem.productName}
                                            </p>
                                        ))
                                    }
                                    <p>Hiện tại đã hết hàng. Vui lòng chọn sản phẩm khác để đặt hàng</p>
                                </div>
                            ),
                            onOk() { navigate("/products") },
                        });
                    } else {

                        Modal.confirm({
                            title: 'Lưu ý',
                            content: (
                                <div className='flex flex-col'>
                                    {
                                        response.product.map(productItem => (
                                            <p key={productItem._id} className='text-[16px] text-[#333] font-[500]'>
                                                {productItem.productName}
                                            </p>
                                        ))
                                    }
                                    <p>Hiện tại đã hết hàng. Vui lòng</p>
                                    <p>Nhấn <span className='font-[600]'>[Tiếp tục]</span> để đặt các sản phẩm còn lại</p>
                                    <p>Nhấn <span className='font-[600]'>[Hủy]</span> để hủy đặt hàng</p>
                                </div>
                            ),
                            onOk() {
                                const newList = list.filter(listItem => !response.product.some(pItem => pItem._id === listItem.product._id))
                                console.log(newList)
                                setList(newList)
                                message.info("Tiếp tục mua hàng")
                            },
                            onCancel() {
                                navigate("/")
                                message.info("Đã hủy đặt hàng")
                            },
                            okText: "Tiếp tục",
                            cancelText: "Hủy"
                        });
                    }
                } else {

                    toast.error(response.mess)
                }
            }
            setLoading(false)
        } catch (err) {
            setLoading(false)
        }

    }

    const handleFormChange = (_, allValues) => {
        setFormData(allValues);
    };
    const createPayPalPayload = () => {
        const data = {
            products: list.map(item => ({
                product: item.product._id,
                count: item.quantity,
            })),
            paymentMethod: "PayPal",
            total,
            // Add additional form data here
            ...formData
            // ...debouncedFormData
        };
        console.log(data);
        return data;
    };

    React.useEffect(() => {
        const newPayload = createPayPalPayload();
        const timeoutId = setTimeout(() => {
            setPayPalPayload(newPayload);
        }, 3500);

        return () => clearTimeout(timeoutId);
    }, [formData, list]);

    return (
        <Spin spinning={loading} size={"large"}>

            <div className="pb-[50px]">
                <div class="flex flex-col items-center border-b bg-white sm:flex-row sm:px-10 lg:px-20 xl:px-32">
                    <Link to="/">
                        <img src={logo} alt="Logo" style={{
                            width: "200px",
                            height: "100px",
                            objectFit: "contain"
                        }} />
                    </Link>
                </div>
                <div class="grid sm:px-10 lg:grid-cols-2 lg:px-20 xl:px-32">
                    <div class="px-4 pt-8">
                        <p class="text-xl pb-[10px] font-bold border-b border-solid border-[#555]">Thanh toán đơn hàng</p>
                        <p class="mt-8 text-lg">Danh sách sản phẩm</p>
                        <div class="mt-8 space-y-3 rounded-lg border bg-white px-2 py-4 sm:px-6">

                            {
                                list.map(item => (
                                    <div key={item.product._id} class="flex flex-col rounded-lg bg-white sm:flex-row">
                                        <img class="m-2 h-24 w-28 rounded-md border object-contain" src={item.product.image[0]} alt="" />
                                        <div class="flex w-[350px] flex-col px-4 py-4">
                                            <span class="font-semibold">{item.product.productName}</span>
                                            <p class="text-lg font-bold">
                                                {item.product.price.toLocaleString('vi-VN', {
                                                    style: 'currency',
                                                    currency: 'VND',
                                                })}
                                            </p>
                                            <span class="float-right text-gray-400">x {item.quantity}</span>
                                        </div>
                                    </div>
                                ))
                            }

                        </div>

                        <p class="mt-8 text-lg">Phương thức thanh toán</p>
                        <form class="mt-5 grid gap-6">
                            <div class="relative">
                                <input class="peer hidden" id="radio_1" type="radio" name="radio" checked={paymentMethod === cash} />
                                <span class="peer-checked:border-gray-700 absolute right-4 top-1/2 box-content block h-3 w-3 -translate-y-1/2 rounded-full border-8 border-gray-300 bg-white"></span>
                                <label class="peer-checked:border-2 peer-checked:border-gray-700 peer-checked:bg-gray-50 flex cursor-pointer select-none rounded-lg border border-gray-300 p-4" for="radio_1">
                                    <img class="w-14 object-contain" src="/images/naorrAeygcJzX0SyNI4Y0.png" alt="" />
                                    <div class="ml-5">
                                        <span class="mt-2 font-semibold">Thanh toán bằng tiền mặt</span>
                                        <p class="text-slate-500 text-sm leading-6">Giao trong vòng: 2-4 ngày</p>
                                    </div>
                                </label>
                            </div>
                            <div className='w-full mx-auto'>
                                <PayPal
                                    payload={payPalPayload}
                                    setIsSuccess={setIsSuccess}
                                    amount={(total / 24250).toFixed(2)} />
                            </div>
                        </form>
                        <p class="mt-8 text-lg">Voucher</p>
                        <div className="flex items-center mt-[20px]">
                            <Input className="mr-[10px]" placeholder="Nhập mã voucher" />
                            <Button>Áp dụng</Button>
                        </div>
                    </div>
                    <div class="mt-10 bg-gray-50 px-4 pt-8 lg:mt-0">
                        <p class="text-xl mb-[40px]">Thông tin đơn hàng</p>

                        <div class="">
                            {/* Thông tin người đặt */}
                            <Form
                                form={form}
                                style={{
                                    width: '100%'
                                }}
                                layout="vertical"
                                onFinish={onFinish}
                                onValuesChange={handleFormChange}
                                autoComplete="off"
                            >
                                <Form.Item
                                    label="Người nhận"
                                    name="recipient"
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Thông tin này không được để trống!',
                                        },
                                    ]}
                                >
                                    <Input placeholder='Nhập tên người nhận' />
                                </Form.Item>

                                <Form.Item
                                    label="Số điện thoại"
                                    name="phone"
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Thông tin này không được để trống!',
                                        },
                                    ]}
                                >
                                    <Input placeholder="Nhập số điện thoại" />
                                </Form.Item>

                                <Form.Item
                                    label="Địa chỉ giao hàng"
                                    name="address"
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Thông tin này không được để trống!',
                                        },
                                    ]}
                                >
                                    <Input placeholder="Nhập địa chỉ giao hàng" />
                                </Form.Item>

                                <Form.Item
                                    label="Ghi chú"
                                    name="note"
                                    initialValue=""
                                >
                                    <Input placeholder="Lưu ý..." />
                                </Form.Item>

                                {/* Tổng cộng */}
                                <div class="mt-6 border-b py-2"></div>
                                <div class="mt-6 flex items-center justify-between">
                                    <p class="text-sm text-gray-900">Tổng tiền</p>
                                    <p class="text-2xl font-semibold text-gray-900">
                                        {
                                            total.toLocaleString('vi-VN', {
                                                style: 'currency',
                                                currency: 'VND',
                                            })
                                        }
                                    </p>
                                </div>

                                <Form.Item
                                    className='w-full mt-[40px]'
                                >
                                    <button htmlType="submit" class="mt-4 mb-8 w-full rounded-md bg-gray-900 px-6 py-3 text-white">
                                        Thanh toán
                                    </button>
                                </Form.Item>
                            </Form>

                        </div>

                    </div>
                </div>

            </div>
        </Spin>
    )
}

export default Checkout