import React from 'react'
import { FiLoader } from 'react-icons/fi';

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-screen">
      <FiLoader className="size-10 animate-spin" />
    </div>
  )
}

export default PageLoader