import { createSlice } from "@reduxjs/toolkit";

export const chatSlice = createSlice({
    name: 'chat',
    initialState: {
      sessionId: null,
    },
    reducers: {
       setSessionId : (state, action) => {
         state.sessionId = action.payload.sessionId
       }
    }
})

export const { setSessionId } = chatSlice.actions

export default chatSlice.reducer