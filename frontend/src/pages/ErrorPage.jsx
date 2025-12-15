import React from 'react'
import { Link } from 'react-router-dom';

function ErrorPage() {
  return (
    <div className= "flex flex-col items-center">
        <div className=" flex text-white font-bold text-4xl p-4">
            Sorry, this page isn't available.
        </div>
        <div className=" text-gray-400 text-lg mt-2">
            The link you followed may be broken, or the page may have been removed.
            <span className="mx-1"></span> 
            <Link to="/" className='text-blue-400 hover:underline'>
                Go back to Home Page.
            </Link>
        </div>
    </div>
  )
}

export default ErrorPage