import React, { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom'
import { Login, Home, Public, FAQ, Services, DetailProduct, Products, FinalRegister, ResetPassword } from './pages/public'
import { AdminLayout, ManageOrder, ManageProduct, ManageUser, CreateProduct, Dashboard } from './pages/admin';
import { MemberLayout, Personal, History, Wishlist, MyCart } from './pages/member';
import path from './ultils/path';
import { apiGetCategories } from './store/asyncActions'
import { useDispatch, useSelector } from 'react-redux'
import { ToastContainer } from 'react-toastify';
import { Modal } from './components';

function App() {
  const dispatch = useDispatch()
  const { isShowModal, modalChildren } = useSelector(state => state.app)
  useEffect(() => {
    dispatch(apiGetCategories())
  }, [])
  return (
    <div className="font-main relative">
      {isShowModal && <Modal>{modalChildren}</Modal>}
      <Routes>
        <Route path={path.PUBLIC} element={<Public />} >
          <Route path={path.HOME} element={<Home />} />
          <Route path={path.FAQS} element={<FAQ />} />
          <Route path={path.DETAIL_PRODUCT__CATEGORY__PID__TITLE} element={<DetailProduct />} />
          <Route path={path.OUR_SERVICES} element={<Services />} />
          <Route path={path.PRODUCTS} element={<Products />} />
          <Route path={path.RESET_PASSWORD} element={<ResetPassword />} />
          <Route path={path.ALL} element={<Home />} />
        </Route>
        <Route path={path.ADMIN} element={<AdminLayout />}>
           <Route path={path.DASHBOARD} element={<Dashboard />}/>
           <Route path={path.MANAGE_ORDER} element={<ManageOrder />}/>
           <Route path={path.MANAGE_PRODUCT} element={<ManageProduct />}/>
           <Route path={path.MANAGE_USER} element={<ManageUser />}/>
           <Route path={path.CREATE_PRODUCT} element={<CreateProduct />}/>
        </Route>
        <Route path={path.MEMBER} element={<MemberLayout />}>
           <Route path={path.PERSONAL} element={<Personal />}/>
           <Route path={path.MY_CART} element={<MyCart />}/>
           <Route path={path.HISTORY} element={<History />}/>
           <Route path={path.WISHLIST} element={<Wishlist />}/>
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
