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
        value: 'FREE SHIPPING',
        path: `/${path.OUR_SERVICES}`
    },
    {
        id: 5,
        value: 'QUESTIONS',
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
const { AiOutlineDashboard, MdGroups, TbBrandProducthunt, RiBillLine, MdOutlineCategory, ImProfile, FaFacebookMessenger , TbShoppingBagDiscount, IoIosFlash} = icons
export const adminSidebar = [
    {
        id: 1,
        type: 'single',
        text: 'Dashboard',
        path: `/${path.ADMIN}/${path.DASHBOARD}`,
        icon: <AiOutlineDashboard />
    },
    {
        id: 2,
        type: 'single',
        text: 'Quản lý người dùng',
        path: `/${path.ADMIN}/${path.MANAGE_USER}`,
        icon: <MdGroups />
    },
    {
        id: 3,
        type: 'parent',
        text: 'Quản lý sản phẩm',
        icon: <TbBrandProducthunt />,
        submenu: [
            {
                text: 'Tạo sản phẩm',
                path: `/${path.ADMIN}/${path.CREATE_PRODUCT}`
            },
            {
                text: 'Quản lý sản phẩm',
                path: `/${path.ADMIN}/${path.MANAGE_PRODUCT}`
            }
        ]
    },
    {
        id: 4,
        type: 'single',
        text: 'Quản lý đơn hàng',
        path: `/${path.ADMIN}/${path.MANAGE_ORDER}`,
        icon: <RiBillLine />
    },
    {
        id: 5,
        type: 'single',
        text: 'Quản lý danh mục',
        path: `/${path.ADMIN}/${path.MANAGE_CATEGORY}`,
        icon: <MdOutlineCategory />
    },
    {
        id: 6,
        type: 'single',
        text: 'Thông tin quản lý',
        path: `/${path.ADMIN}/${path.ADMINPERSONAL}`,
        icon: <ImProfile />
    },
    {
        id: 7,
        type: 'single',
        text: 'Tin nhắn khách hàng',
        path: `/${path.ADMIN}/${path.MESSENGER}`,
        icon: <FaFacebookMessenger />
    },
    {
        id: 8,
        type: 'single',
        text: 'Quản lý Voucher',
        path: `/${path.ADMIN}/${path.MANAGE_VOUCHER}`,
        icon: <TbShoppingBagDiscount />
    },
    {
        id: 9,
        type: 'single',
        text: 'Flashsale',
        path: `/${path.ADMIN}/${path.FLASHSALE}`,
        icon: <IoIosFlash />
    }
]

export const memberSidebar = [
    {
        id: 1,
        type: 'single',
        text: 'Thông tin cá nhân',
        path: `/${path.MEMBER}/${path.PERSONAL}`,
        icon: <AiOutlineDashboard />
    },
    {
        id: 2,
        type: 'single',
        text: 'Giỏ hàng của tôi',
        path: `/${path.MEMBER}/${path.MY_CART}`,
        icon: <MdGroups />
    },
    {
        id: 3,
        type: 'single',
        text: 'Lịch sử mua hàng',
        path: `/${path.MEMBER}/${path.HISTORY}`,
        icon: <RiBillLine />
    },
    {
        id: 4,
        type: 'single',
        text: 'Danh sách yêu thích',
        path: `/${path.MEMBER}/${path.WISHLIST}`,
        icon: <RiBillLine />
    }
]
export const voteOptions = [
    {
        id: 1,
        text: 'Terrible'
    },
    {
        id: 2,
        text: 'Bad'
    },
    {
        id: 3,
        text: 'Neutral'
    },
    {
        id: 4,
        text: 'Good'
    },
    {
        id: 5,
        text: 'Perfect'
    },

]
export const cash = "Cash"
export const paypal = "Paypal"
