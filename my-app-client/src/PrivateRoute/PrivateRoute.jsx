import React, { useContext } from 'react'
import { AuthContext } from '../contects/AuthProider'
import { Navigate, useLocation } from 'react-router-dom';
import { Button, Spinner } from "flowbite-react";

const PrivateRoute = ({children, role}) => {
  const {user, loading} = useContext(AuthContext);
  const location = useLocation();

  if(loading){
    return <div className='text-center justify-center items-center'>
       <Button>
        <Spinner aria-label="Spinner button example" size="sm" />
        <span className="pl-3">Loading...</span>
      </Button>
    </div>
  }
  if(user && (!role || user.role === role)){
    return children;
  }
  // If user is logged in but not authorized for this role
  if(user && role && user.role !== role){
    return <div className="text-center text-red-500 mt-10">You are not authorized to access this page.</div>;
  }
  return (
    <Navigate to="/login" state={{from: location}} replace></Navigate>
  )
}

export default PrivateRoute