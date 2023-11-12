import { createSlice } from "@reduxjs/toolkit";
import {getNewProducts} from './asyncActions'

export const productSlice = createSlice({
    name: 'product',
    initialState: {
        newProducts: null,
        errorMessage: ''
    },
    reducers: {
        // logout: (state) => { 
        //      state.isLoading = false
        //  }
    },
     // Code logic xử lý async action
  extraReducers: (builder) => {
    // Bắt đầu thực hiện action login (Promise pending)
    builder.addCase(getNewProducts.pending, (state) => {
      // Bật trạng thái loading
      state.isLoading = true;
    });

    // Khi thực hiện action login thành công (Promise fulfilled)
    builder.addCase(getNewProducts.fulfilled, (state, action) => {
      // console.log(action)
      // Tắt trạng thái loading, lưu thông tin user vào store
      state.isLoading = false;
      state.newProducts = action.payload;
    });

    // Khi thực hiện action login thất bại (Promise rejected)
    builder.addCase(getNewProducts.rejected, (state, action) => {
      // Tắt trạng thái loading, lưu thông báo lỗi vào store
      state.isLoading = false;
      state.errorMessage = action.payload.message;
    });
}
})
// export const { increment, decrement, incrementByAmount } = appSlice.actions
export default productSlice.reducer

