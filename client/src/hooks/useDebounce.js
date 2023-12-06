import React, {useEffect, useState} from 'react'

const useDebounce = (value, ms) => {

  //gia tri debouncValue nay dung de call api
    const [debounceValue, setDebounceValue] = useState('')
  
    useEffect(() => {
      const setTimeOutId = setTimeout(() => {
        setDebounceValue(value)
      }, ms)


      return () => {
        clearTimeout(setTimeOutId)
      }
    }, [value, ms])
    return debounceValue
}

export default useDebounce