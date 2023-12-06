import React, { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom'
import { Login, Home, Public, FAQ, Services, DetailProduct, Products, FinalRegister, ResetPassword } from './pages/public'
import path from './ultils/path';
import { apiGetCategories } from './store/asyncActions'
import { useDispatch } from 'react-redux'
import { ToastContainer } from 'react-toastify';

function App() {
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(apiGetCategories())
  }, [])
  return (
    <div className="min-h-screen font-main">
      <Routes>
        <Route path={path.PUBLIC} element={<Public />} >
          <Route path={path.HOME} element={<Home />} />
          <Route path={path.FAQS} element={<FAQ />} />
          <Route path={path.DETAIL_PRODUCT__CATEGORY__PID__TITLE} element={<DetailProduct />} />
          <Route path={path.OUR_SERVICES} element={<Services />} />
          <Route path={path.PRODUCTS} element={<Products />} />
          <Route path={path.ALL_PRODUCTS} element={<Products />} />
          <Route path={path.RESET_PASSWORD} element={<ResetPassword />} />
        </Route>
        <Route path={path.FINAL_REGISTER} element={<FinalRegister />} />
        <Route path={path.LOGIN} element={<Login />} />
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover

      />
      {/* Same as */}
      <ToastContainer />
    </div>
  );
}

export default App;
