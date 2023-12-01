import { createSlice } from "@reduxjs/toolkit";
import * as actions from './asyncActions'

export const appSlice = createSlice({
    name: 'app',
    initialState: {
        categories: null,
        isLoading: false,
        isShowModal: false,
        modalChildren: null
    },
    reducers: {
       showModal : (state, action) => {
         state.isShowModal = action.payload.isShowModal
         state.modalChildren = action.payload.modalChildren
       }
    },
     // Code logic xử lý async action
  extraReducers: (builder) => {
    // Bắt đầu thực hiện action login (Promise pending)
    builder.addCase(actions.apiGetCategories.pending, (state) => {
      // Bật trạng thái loading
      state.isLoading = true;
    });

    // Khi thực hiện action login thành công (Promise fulfilled)
    builder.addCase(actions.apiGetCategories.fulfilled, (state, action) => {
      // console.log(action)
      // Tắt trạng thái loading, lưu thông tin user vào store
      state.isLoading = false;
      state.categories = action.payload;
    });

    // Khi thực hiện action login thất bại (Promise rejected)
    builder.addCase(actions.apiGetCategories.rejected, (state, action) => {
      // Tắt trạng thái loading, lưu thông báo lỗi vào store
      state.isLoading = false;
      state.errorMessage = action.payload.message;
    });
}
})
// export const { increment, decrement, incrementByAmount } = appSlice.actions
export default appSlice.reducer
export const { showModal } = appSlice.actions
