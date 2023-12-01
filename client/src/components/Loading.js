import React, { memo } from 'react'
import {HashLoader} from 'react-spinners'

const Loading = () => {
  return (
        <HashLoader color='#ff007f' />
  )
}

export default memo(Loading)
