import { createSlice } from "@reduxjs/toolkit";
import * as actions from './asyncAction'


export const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        isLoggedIn: false,
        cart: null,
        token: null,
        isLoading: false,
        mess: ''
    },
    reducers: {
        logoutcart: (state, action) => {
            state.isLoggedIn = false
            state.cart = null
            state.token = null
            state.isLoading = false
        },
    },
    //Code logic xử lý async action
    extraReducers: (builder) => {
        // Bắt đầu thực hiện action login (Promise pending)
        builder.addCase(actions.getUserCart.pending, (state) => {
            // Bật trạng thái loading
            state.isLoading = true;
        });

        // Khi thực hiện action login thành công (Promise fulfilled)
        builder.addCase(actions.getUserCart.fulfilled, (state, action) => {
            state.isLoading = false;
            state.cart = action.payload;
            state.isLoggedIn = true;
        });

        // Khi thực hiện action login thất bại (Promise rejected)
        builder.addCase(actions.getUserCart.rejected, (state, action) => {
            state.isLoading = false;
            state.cart = null;
            state.isLoggedIn = false;
            state.token = null;
            state.mess = 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!'
        });


    }
})
export const { logoutcart } = cartSlice.actions
export default cartSlice.reducer
