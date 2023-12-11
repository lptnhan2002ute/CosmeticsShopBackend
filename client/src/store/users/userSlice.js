import { createSlice } from "@reduxjs/toolkit";
import * as actions from './asyncAction'


export const userSlice = createSlice({
    name: 'user',
    initialState: {
        isLoggedIn: false,
        current: null,
        cart: JSON.parse(localStorage.getItem("cart")) || [],
        token: null,
        isLoading: false,
        mess: ''
    },
    reducers: {
        login: (state, action) => {
            state.isLoggedIn = action.payload.isLoggedIn
            // state.current = action.payload.userData
            state.token = action.payload.token
        },
        logout: (state, action) => {
            state.isLoggedIn = false
            state.current = null
            state.token = null
            state.isLoading = false
        },
        updateCart: (state, action) => {

            localStorage.setItem("cart", JSON.stringify(action.payload.products))
            state.cart = action.payload.products
        },
        clearMessage: (state) => {
            state.mess = ''
        }
    },
    //Code logic xử lý async action
    extraReducers: (builder) => {
        // Bắt đầu thực hiện action login (Promise pending)
        builder.addCase(actions.getCurrent.pending, (state) => {
            // Bật trạng thái loading
            state.isLoading = true;
        });

        // Khi thực hiện action login thành công (Promise fulfilled)
        builder.addCase(actions.getCurrent.fulfilled, (state, action) => {
            state.isLoading = false;
            state.current = action.payload;
            state.isLoggedIn = true;
        });

        // Khi thực hiện action login thất bại (Promise rejected)
        builder.addCase(actions.getCurrent.rejected, (state, action) => {
            state.isLoading = false;
            state.current = null;
            state.cart = null;
            state.isLoggedIn = false;
            state.token = null;
            state.mess = 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!'
        });


    }
})
export const { login, logout, clearMessage, updateCart } = userSlice.actions
export default userSlice.reducer

