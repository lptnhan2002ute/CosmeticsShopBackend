import React, { useEffect, useState } from 'react'
import { apiGetProducts } from '../../apis'
import moment from 'moment'
import Dialog from '@mui/material/Dialog'
import { InputForm } from '../../components'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import Search from 'antd/es/input/Search'
import { Pagination, DatePicker, Input, Badge, Row, Col } from 'antd'
import Swal from 'sweetalert2'
import { useNavigate } from 'react-router-dom'
import useDebounce from '../../hooks/useDebounce'
import { Carousel } from 'antd';
import { apiCreateFlashSale, apiDeleteFlashSale, apiGetAllFlashSale, apiUpdateFlashSale } from '../../apis/flashsale'

const { RangePicker } = DatePicker;

const Flashsale = () => {
    const { handleSubmit, reset, register, getValues, formState: { errors }, setValue, watch } = useForm({
        saleName: '',
    })

    const navigate = useNavigate();

    const [searchValue, setSearchValue] = useState("");
    const debounceSearch = useDebounce(searchValue, 300);

    const [startDateFilter, setStartDateFilter] = useState(undefined);
    const [endDateFilter, setEndDateFilter] = useState(undefined);

    const [page, setPage] = useState(1);

    const [flashSalePageMetadata, setFlashSalePageMetadata] = useState({});

    const [showDialog, setShowDialog] = useState(false)
    const [dialogLabel, setDialogLabel] = useState('Thêm')
    const [isEdit, setIsEdit] = useState(false);
    const [productFlashSaleEdit, setProductFlashSaleEdit] = useState([]);
    const [productPage, setProductPage] = useState(1);
    const [productSearchValue, setProductSearchValue] = useState("");
    const debounceProductSearch = useDebounce(productSearchValue, 300);

    const [products, setProducts] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);

    const [isShowProductsFS, setIsShowProductsFS] = useState(false);
    const [showProductsFS, setShowProductsFS] = useState([]);

    const handleCloseShowProductsFS = () => {
        setIsShowProductsFS(false);
        setShowProductsFS([]);
    }

    const handleShowProductsFS = async (el) => {
        setIsShowProductsFS(true);
        const rsp = await apiGetProducts();
        const viewProducts = rsp.productData.map(e => {
            const product = el.products.find(p => p.product._id === e._id);
            if (product) {
                return { ...e, discountRate: product.discountRate, quantity: product.quantity }
            }
            return null;
        }).filter(item => item !== null);
        console.log(viewProducts);
        setShowProductsFS(viewProducts);
    }

    const onSearch = async (value) => {
        if (value) {
            setSearchValue(value);
        } else {
            setSearchValue("");
            await fetchFlashSales(page, undefined, startDateFilter, endDateFilter);
        }
    }

    useEffect(() => {
        if (debounceSearch) {
            fetchFlashSales(page, debounceSearch, startDateFilter, endDateFilter);
        }
    }, [debounceSearch])

    const handleChangePage = (pagePaginate) => {
        setPage(pagePaginate)
    }

    const onChangeRangePicker = (_date, dateString) => {
        if (!dateString[0] || !dateString[1]) {
            setStartDateFilter(undefined);
            setEndDateFilter(undefined);
            fetchFlashSales(page, debounceSearch);
            return;
        }
        setStartDateFilter(dateString[0]);
        setEndDateFilter(dateString[1]);
        fetchFlashSales(page, debounceSearch, dateString[0], dateString[1]);
    }

    const handleClose = () => {
        reset()
        setShowDialog(false)
        setSelectedProducts([])
        setProductPage(1);
    }
    const handleCreate = async () => {
        const id = getValues('_id')
        if (id) {
            const response = await apiUpdateFlashSale({ ...watch(), products: selectedProducts.map(e => ({ ...e, product: e._id })) }, id)
            if (response.success) {
                setShowDialog(false)
                toast.success('Sửa thành công')
                fetchFlashSales()
                reset()
            } else toast.error('Sửa thất bại')
        } else {
            const response = await apiCreateFlashSale({ ...watch(), products: selectedProducts.map(e => ({ ...e, product: e._id })) })
            if (response.success) {
                setShowDialog(false)
                toast.success('Thêm thành công')
                fetchFlashSales()
                reset()
            } else toast.error('Thêm thất bại')
        }
    }

    const handleShowdialog = async (el) => {
        const rsp = await apiGetProducts();
        setProducts(rsp.productData);
        setSelectedProducts([]);
        setProductFlashSaleEdit([]);

        if (el) {
            setIsEdit(true);
            setProductFlashSaleEdit(el.products);
            const newSelectedProducts = rsp.productData.map(e => {
                const product = el.products.find(p => p.product._id === e._id);
                if (product) {
                    return { ...e, discountRate: product.discountRate, quantity: product.quantity }
                }
                return null;
            }).filter(item => item !== null);
            setSelectedProducts(newSelectedProducts);

            setDialogLabel('Sửa')
            Object.keys(el).forEach(key => {
                if (key === 'startTime' || 'endTime' === key) {
                    setValue(key, moment(el[key]).format('yyyy-MM-DD'))
                } else {
                    setValue(key, el[key])
                }
            })
        }
        else {
            setDialogLabel('Thêm');
            setIsEdit(false);
            reset()
        }
        setShowDialog(true)
    }

    const handleSelectProduct = (product) => {
        if (selectedProducts.find(p => p._id === product._id)) {
            const newSelectedProducts = selectedProducts.filter(p => p._id !== product._id);
            setSelectedProducts(newSelectedProducts);
        } else {
            setSelectedProducts(prev => [...prev, product]);
        }
    }

    const fetchFlashSales = async (page = 1, saleName = undefined, startTime = undefined, endTime = undefined) => {
        const response = await apiGetAllFlashSale(page, saleName, startTime, endTime);
        if (response.success) {
            setFlashSalePageMetadata(response);
        }
        else {
            setFlashSalePageMetadata([]);
        }
    }

    useEffect(() => {
        fetchFlashSales(page, debounceSearch, startDateFilter, endDateFilter);
    }, [page])

    const handleDeleteFlashSale = async (fid) => {
        Swal.fire({
            title: 'Bạn có chắc chắn muốn xóa???',
            text: 'Bạn đã sẵn sàng xóa Flash Sale chưa???',
            showCancelButton: true,
        }).then(async (result) => {
            if (result.isConfirmed) {
                const response = await apiDeleteFlashSale(fid);
                if (response.success) {
                    toast.success('Xóa thành công');
                    fetchFlashSales(); // Lấy danh sách voucher đã cập nhật
                } else {
                    toast.error('Xóa thất bại');
                }
            }
        });
    };
    return (
        <div className='w-full flex flex-col gap-3 relative overflow-x-scroll p-4'>
            <div className='flex justify-between items-center'>
                <Search
                    className="w-[40vw]"
                    placeholder="Nhập tên mã giảm giá..."
                    allowClear
                    enterButton="Search"
                    size="large"
                    value={searchValue}
                    onChange={(e) => onSearch(e.target.value)}
                />
                <RangePicker onChange={onChangeRangePicker} />
            </div>
            <table className='table-auto'>
                <thead className='border bg-main text-white border-white '>
                    <tr className='border border-main'>
                        <th className='text-center py-2'>STT</th>
                        <th className='text-center py-2'>Mã flash sale</th>
                        <th className='text-center py-2'>Tên</th>
                        <th className='text-center py-2'>Bắt đầu</th>
                        <th className='text-center py-2'>Kết thúc</th>
                        <th className='text-center py-2'>Trạng thái</th>
                        <th className='text-center py-2'>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {flashSalePageMetadata.data?.map((el, index) => (
                        <tr className='border border-main' key={el._id}>
                            <td className='text-center py-2'>{index + 1}</td>
                            <td className='text-center py-2'>{el?._id}</td>
                            <td className='text-center py-2'>{el?.saleName}</td>
                            <td className='text-center py-2'>{moment(el?.startTime).format('DD/MM/YYYY')}</td>
                            <td className='text-center py-2'>{moment(el?.endTime).format('DD/MM/YYYY')}</td>
                            <td className='text-center py-2'>{el?.status}</td>
                            <td className='text-center py-2'>
                                <span onClick={() => handleShowProductsFS(el)} className='text-main hover:underline cursor-pointer px-1'>Xem</span>
                                <span onClick={() => handleShowdialog(el)} className='text-main hover:underline cursor-pointer px-1'>Sửa</span>
                                <span onClick={() => handleDeleteFlashSale(el._id)} className='text-main hover:underline cursor-pointer px-1'>Xóa</span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className='flex items-center justify-center'>
                <Pagination onChange={handleChangePage} defaultCurrent={1} total={flashSalePageMetadata?.totalItems || 0} pageSize={5} showSizeChanger={false} />
            </div>

            <div className='w-[100px] h-[50px] bg-main text-white rounded text-center justify-center items-center flex cursor-pointer' onClick={() => handleShowdialog(null)}>Thêm mới</div>
            <Dialog maxWidth='xl' open={showDialog} onClose={handleClose}>
                <div className='p-[20px] w-[1200px]'>
                    <InputForm
                        label='Tên Flash Sale'
                        placeholder='Nhập tên flash sale'
                        fw
                        register={register}
                        errols={errors}
                        id={'saleName'}
                        validate={{ required: 'Yêu cầu nhập ' }}
                    />
                    <InputForm
                        type='date'
                        label='Bắt đầu'
                        placeholder='Nhập ngày bắt đầu'
                        fw
                        register={register}
                        errols={errors}
                        id={'startTime'}
                        validate={{ required: 'Yêu cầu nhập ' }}
                    />
                    <InputForm
                        type='date'
                        label='Kết thúc'
                        placeholder='Nhập ngày kết thúc'
                        fw
                        register={register}
                        errols={errors}
                        id={'endTime'}
                        validate={{ required: 'Yêu cầu nhập ' }}
                    />
                    {/* {isEdit &&
                        <>
                            <div className='mb-4'>Chọn trạng thái</div>
                            <select
                                className='form-input px-[20px] my-auto border border-main w-full'
                                {...register("status")}
                            >
                                <option value='Upcoming'>Upcoming</option>
                                <option value='Active'>Active</option>
                            </select>
                        </>
                    } */}

                    <div className='flex justify-between items-center mt-4'>
                        Chọn sản phẩm
                        <Search
                            className="w-[40vw]"
                            placeholder="Nhập tên sản phẩm..."
                            allowClear
                            enterButton="Search"
                            size="large"
                            value={productSearchValue}
                            onChange={(e) => setProductSearchValue(e.target.value)}
                        />
                    </div>
                    <div className='flex flex-col px-4 my-4'>
                        <Row>
                            {products?.filter(prod => prod.productName.includes(debounceProductSearch))?.slice((productPage - 1) * 8, productPage * 8)?.map((e, _i) => (
                                <Col span={6} key={e._id} className='w-full p-2'>
                                    <div className={`flex flex-col gap-2 w-full border-2 ${selectedProducts.find(p => p._id === e._id) ? 'border-green-400' : 'border-slate-200'}`}>
                                        <img onClick={() => handleSelectProduct(e)} className='w-full h-[180px] object-contain object-center cursor-pointer' src={e?.imageUrl?.[0]} />
                                        {selectedProducts.find(p => p._id === e._id) &&
                                            <div className='flex gap-2 px-2'>
                                                <Input defaultValue={
                                                    productFlashSaleEdit.find(pfs => pfs.product._id === e._id)?.discountRate ||
                                                    selectedProducts.find(pfs => pfs._id === e._id)?.discountRate
                                                } onChange={(event) => {
                                                    event.stopPropagation();
                                                    const percent = parseInt(event.target.value);
                                                    if (percent > 0 && percent < 100) {
                                                        const product = selectedProducts.find(p => p._id === e._id);
                                                        if (product) {
                                                            const newProducts = selectedProducts.filter(p => p._id !== e._id);
                                                            product['discountRate'] = percent;
                                                            setSelectedProducts([...newProducts, product]);
                                                        }
                                                    }
                                                }} placeholder='Giảm giá (%)' />
                                                <Input defaultValue={
                                                    productFlashSaleEdit.find(pfs => pfs.product._id === e._id)?.quantity ||
                                                    selectedProducts.find(pfs => pfs._id === e._id)?.quantity
                                                } onChange={(event) => {
                                                    event.stopPropagation();
                                                    const amount = parseInt(event.target.value);
                                                    if (amount > 0 && amount <= (e.stockQuantity - e.soldQuantity)) {
                                                        const product = selectedProducts.find(p => p._id === e._id);
                                                        if (product) {
                                                            const newProducts = selectedProducts.filter(p => p._id !== e._id);
                                                            product['quantity'] = amount;
                                                            setSelectedProducts([...newProducts, product]);
                                                        }
                                                    }
                                                }} placeholder='Số lượng' />
                                                <Badge count={e.stockQuantity - e.soldQuantity} />
                                            </div>
                                        }
                                        <span className='w-full h-[80px] break-words p-4'>{e.productName}</span>
                                    </div>
                                </Col>
                            ))}
                        </Row>
                        <div className='flex items-center justify-center'>
                            <Pagination onChange={(page) => { setProductPage(page) }} defaultCurrent={1} total={products?.filter(prod => prod.productName.includes(debounceProductSearch)).length || 0} pageSize={8} showSizeChanger={false} />
                        </div>
                    </div>
                    <div className='justify-end flex pt-2'>
                        <div className='w-[80px] h-[40px] bg-main text-white rounded text-center justify-center items-center flex cursor-pointer' onClick={handleCreate}>{dialogLabel}</div>
                    </div>
                </div>
            </Dialog>
            <Dialog maxWidth='xl' open={isShowProductsFS} onClose={handleCloseShowProductsFS}>
                <div className='w-full p-[40px]'>
                    <Carousel className='w-[800px]' arrows dots={false} infinite>
                        {showProductsFS.map((e, i) => (
                            <div key={i} className='p-10'>
                                <div className='flex flex-col w-full justify-center items-center'>
                                    <img className='w-[300px] object-cover object-center' src={e?.imageUrl?.[0]} />
                                    <Badge count={`${e.discountRate} %`}>
                                        <p className='font-medium max-w-[500px] truncate p-2'>{e.productName}</p>
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </Carousel>
                </div>
            </Dialog>
        </div>
    )
}

export default Flashsale