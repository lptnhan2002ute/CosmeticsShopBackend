import icons from "./icon"
const { AiFillStar, AiOutlineStar } = icons

export const createSlug = string => string.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").split(' ').join('-')
export const formatMoney = number => Number(number?.toFixed(1)).toLocaleString()

export const renderStarFromNumber = (number, size) => {
    if (!Number(number)) return
    const stars = []
    number = Math.round(number)
    for (let i = 0; i < +number; i++) stars.push(<AiFillStar color="orange" size={size || 16} />)
    for (let i = 5; i > +number; i--) stars.push(<AiOutlineStar color="orange" size={size || 16} />)
    return stars
}


export const validate = (payload, setInvalidFields) => {
    let invalids = 0
    const formatPayload = Object.entries(payload)
    console.log(formatPayload)
    for (let arr of formatPayload) {
        if (arr[1].trim() === '') {
            invalids++
            setInvalidFields(prev => [...prev, { name: arr[0], mess: 'Required this field' }])
        }
    }
    for (let arr of formatPayload) {
        switch (arr[0]) {
            case 'email':
                const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
                if (!regex.test(arr[1])) {
                    invalids++
                    setInvalidFields(prev => [...prev, { name: arr[0], mess: 'Email Invalid' }])
                }
                break;
            case 'password':

                if (arr[1].length < 6) {
                    invalids++
                    setInvalidFields(prev => [...prev, { name: arr[0], mess: 'Password min longer than 6 characters' }])
                }

                break;
            default:
                break;

        }
    }
    return invalids
}

export const fotmatPrice = number => Math.round(number / 1000) * 1000
