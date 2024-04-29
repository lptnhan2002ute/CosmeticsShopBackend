import { configureStore } from '@reduxjs/toolkit';
import appSlice from './appSlice';
import productSlice from './products/productSlice';
import userSlice from './users/userSlice';
import storage from 'redux-persist/lib/storage';
import {persistStore, persistReducer, FLUSH, PAUSE, PERSIST, PURGE, REGISTER, REHYDRATE} from 'redux-persist'
import chatSlice from './chatSlice';

const commonConfig = {
  key: 'shop/user',
  storage
}

const userConfig = {
  ...commonConfig,
  whitelist: ['isLoggedIn', 'token', 'current']
}


export const store = configureStore({
  reducer: {
    app: appSlice,
    chat: chatSlice,
    products: productSlice,
    user: persistReducer(userConfig, userSlice),
  
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoreActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});


export const persistor = persistStore(store)