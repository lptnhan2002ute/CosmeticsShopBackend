import React, { useEffect } from 'react'
import { Tabs } from 'antd';
import { apiGetOrderUser } from '../../apis/user';
import HistoryOrderItem from '../../components/HistoryOrderItem';
const TabPane = Tabs.TabPane;

const History = () => {

    const [allListOrder, setAllListOrder] = React.useState([])
    const [filterListOrder, setFilterListOrder] = React.useState([])

    useEffect(() => {

        fetchOrder()
    }, [])

    const fetchOrder = async () => {
        const response = await apiGetOrderUser()
        if (response.success) {
            setAllListOrder(response.result)
        }
    }

    const callback = (key) => {

        if (key !== "All") {
            const newList = allListOrder.filter(order => order.status == key)
            setFilterListOrder(newList)
        }
    }

    return (
        <div className="pb-[20px] max-h-[100vh] overflow-y-scroll">
            <div class="sm:px-[10px] lg:px-[20px] xl:px-[20px]">
                <div class="px-4 pt-8">
                    <p class="text-xl pb-[10px] font-bold border-b border-solid border-[#555]">
                        Lịch sử đặt hàng
                    </p>
                    <div class="mt-8 space-y-3 rounded-lg border bg-white px-2 py-4 sm:px-6">

                        <Tabs className='text-[16px] text-[#333]' defaultActiveKey="1" onChange={callback}>
                            <TabPane tab="Tất cả" key="All">
                                <HistoryOrderItem listOrder={allListOrder} />
                            </TabPane>
                            <TabPane tab="Chờ xác nhận" key="Pending">
                                <HistoryOrderItem listOrder={filterListOrder} />
                            </TabPane>
                            <TabPane tab="Đang giao" key="Confirmed">
                                <HistoryOrderItem listOrder={filterListOrder} />
                            </TabPane>
                            <TabPane tab="Hoàn thành" key="Shipped">
                                <HistoryOrderItem listOrder={filterListOrder} />
                            </TabPane>
                            <TabPane tab="Đã hủy" key="Cancelled">
                                <HistoryOrderItem listOrder={filterListOrder} />
                            </TabPane>
                        </Tabs>

                    </div>
                </div>
            </div>
        </div>
    )
}

export default History