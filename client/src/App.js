import React, {useEffect} from 'react';
import {Route, Routes} from 'react-router-dom'
import {Login, Home, Public, FAQ, Services, DetailProduct, Products} from './pages/public'
import path from './ultils/path';
import { apiGetCategories } from './store/asyncActions'
import { useDispatch } from 'react-redux'

function App() {
  const dispatch = useDispatch()
  useEffect(() => {
     dispatch(apiGetCategories())
  },[])
  return (
    <div className="min-h-screen font-main">
      <Routes>
      <Route path={path.PUBLIC} element={<Public />} >
        <Route path={path.HOME} element={<Home />} /> 
        <Route path={path.FAQS} element={<FAQ />} />
        <Route path={path.DETAIL_PRODUCT__CATEGORY__PID__TITLE} element={<DetailProduct />} />
        <Route path={path.OUR_SERVICES} element={<Services/>} />
        <Route path={path.PRODUCTS} element={<Products/>} />


      </Route>
      <Route path={path.LOGIN} element={<Login />} />
      </Routes>
    </div>
  );
}

export default App;
