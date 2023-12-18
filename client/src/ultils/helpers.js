import icons from "./icon"
const { AiFillStar, AiOutlineStar, BsStarHalf } = icons

export const createSlug = string => string.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").split(' ').join('-')
export const formatMoney = number => Number(number?.toFixed(1)).toLocaleString()

export const renderStarFromNumber = (number, size = 16) => {
    const stars = [];
    const fullStars = Math.floor(number);
    const halfStar = (number - fullStars) >= 0.25 && (number - fullStars) < 0.75;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    for (let i = 0; i < fullStars; i++) {
        stars.push(<AiFillStar key={`full-${i}`} color="orange" size={size} />);
    }

    if (halfStar) {
        stars.push(<BsStarHalf key={`half-${fullStars}`} color="orange" size={size} />);
    }

    for (let i = 0; i < emptyStars; i++) {
        stars.push(<AiOutlineStar key={`empty-${fullStars + (halfStar ? 1 : 0) + i}`} color="orange" size={size} />);
    }

    return stars;
};


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
            case 'phone':
                const phoneRegex = /^\d{10}$/;
                if (!phoneRegex.test(arr[1])) {
                    invalids++;
                    setInvalidFields(prev => [...prev, { name: arr[0], mess: 'Phone number must be 10 digits' }]);
                }
                break;
            case 'name':
                const nameRegex = /^[a-zA-Z ]{2,}$/;
                if (!nameRegex.test(arr[1])) {
                    invalids++;
                    setInvalidFields(prev => [...prev, { name: arr[0], mess: 'Name must be at least 2 characters and only contain letters' }]);
                }
                break;
            default:
                break;

        }
    }
    return invalids
}

export const fotmatPrice = number => Math.round(number / 1000) * 1000
