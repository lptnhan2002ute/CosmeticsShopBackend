import { createSlice } from "@reduxjs/toolkit";


export const userSlice = createSlice({
    name: 'user',
    initialState: {
        isLoggedIn: false,
        current: null,
        token: null
    },
    reducers: {
        register: (state, action) => {
            console.log(action)
            state.isLoggedIn = action.payload.isLoggedIn
            state.current = action.payload.userData
            state.token = action.payload.token
        }
    },
    // Code logic xử lý async action
    // extraReducers: (builder) => {
    //     // Bắt đầu thực hiện action login (Promise pending)
    //     builder.addCase(getNewProducts.pending, (state) => {
    //         // Bật trạng thái loading
    //         state.isLoading = true;
    //     });

    //     // Khi thực hiện action login thành công (Promise fulfilled)
    //     builder.addCase(getNewProducts.fulfilled, (state, action) => {
    //         // console.log(action)
    //         // Tắt trạng thái loading, lưu thông tin user vào store
    //         state.isLoading = false;
    //         state.newProducts = action.payload;
    //     });

    //     // Khi thực hiện action login thất bại (Promise rejected)
    //     builder.addCase(getNewProducts.rejected, (state, action) => {
    //         // Tắt trạng thái loading, lưu thông báo lỗi vào store
    //         state.isLoading = false;
    //         state.errorMessage = action.payload.message;
    //     });
    // }
})
// export const { increment, decrement, incrementByAmount } = appSlice.actions
export const { register } = userSlice.actions
export default userSlice.reducer

