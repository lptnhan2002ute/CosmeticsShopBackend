import React from 'react'
import { Link } from 'react-router-dom'
import logo from "../../assets/logo.svg.png"
import { cash } from '../../ultils/contants'
import { useLocation } from "react-router-dom"
import { Form, Input } from 'antd';

const Checkout = () => {

    const [paymentMethod, setPaymentMethod] = React.useState(cash)
    const [total, setTotal] = React.useState(0)
    const location = useLocation()
    const { listCheckout } = location.state || []

    React.useEffect(() => {

        const result = listCheckout.reduce((acc, curr) => acc + curr.quantity * curr.product.price, 0)
        setTotal(result)
    }, [])

    const onFinish = (values) => {
        console.log('Success:', values);
    }

    return (
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
                            listCheckout.map(item => (
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
                    </form>
                </div>
                <div class="mt-10 bg-gray-50 px-4 pt-8 lg:mt-0">
                    <p class="text-xl mb-[40px]">Thông tin đơn hàng</p>

                    <div class="">
                        {/* Thông tin người đặt */}
                        <Form
                            style={{
                                width: '100%'
                            }}
                            layout="vertical"
                            onFinish={onFinish}
                            autoComplete="off"
                        >
                            <Form.Item
                                label="Người nhận"
                                name="username"
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
                                name="phoneNumber"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Thông tin này không được để trống!',
                                    },
                                ]}
                            >
                                <Input type="number" placeholder="Nhập số điện thoại" />
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
    )
}

export default Checkout