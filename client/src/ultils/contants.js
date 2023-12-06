import path from "./path"
import icons from "./icon"

export const navigation = [
    {
        id: 1,
        value: 'HOME',
        path: `/${path.HOME}`
    },
    {
        id: 2,
        value: 'PRODUCTS',
        path: `/${path.ALL_PRODUCTS}`
    },
    {
        id: 3,
        value: 'BLOGS',
        path: `/${path.BLOGS}`
    },
    {
        id: 4,
        value: 'OUR SERVICES',
        path: `/${path.OUR_SERVICES}`
    },
    {
        id: 5,
        value: 'FAQS',
        path: `/${path.FAQS}`
    }
]
const { RiTruckFill, BsShieldShaded, BsReplyFill, FaTty, AiFillGift } = icons
export const productInformation = [
    {
        id: '1',
        title: 'Bảo đảm',
        sub: 'Đã kiểm tra chất lượng',
        icon: <BsShieldShaded />

    },
    {
        id: '2',
        title: 'Miễn phí vận chuyển',
        sub: 'Miễn phí trên tất cả sản phẩm',
        icon: <RiTruckFill />

    },
    {
        id: '3',
        title: 'Quà tặng đặc biệt',
        sub: 'Thẻ quà tặng đặc biệt',
        icon: <AiFillGift />

    },
    {
        id: '4',
        title: 'Hoàn trả miễn phí',
        sub: 'Trong vòng 7 ngày',
        icon: <BsReplyFill />

    },
    {
        id: '5',
        title: 'Tư vấn',
        sub: 'Trọn đời 24/7/365',
        icon: <FaTty />

    }
]
