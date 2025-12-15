import React from 'react'

import { useMutation } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import * as apiClient from "../apiClient"
import useAuthStore from "../store/useAuthStore"
import { Link } from "react-router-dom"

import BorderAnimatedContainer from "../components/BorderAnimatedContainer.jsx"
import { LuMessageCircle } from "react-icons/lu"
import toast from 'react-hot-toast';


function LoginPage() {
  const { authenticate, connectSocket } = useAuthStore();

  const { register, handleSubmit, formState: { errors } } = useForm();

  const mutation = useMutation({
    mutationFn: apiClient.login,
    onSuccess: () => {
      authenticate();
      connectSocket(); 
      console.log("Login successful");
    },

    onError: (error) => {
      console.error("Login failed:", error.response.data.message);
    }
  });

  const onSubmit = handleSubmit((data) => toast.promise(
        mutation.mutateAsync(data), // use mutateAsync, not mutate
        {
            loading: 'Logging In...',
            success: 'Logged In!',
            error: (err) => err.response?.data?.message || "Login Failed"
        }
    ));


  return (
    <>
      <div className="w-full flex items-center justify-center p-4 bg-slate-900">
        <div className="relative w-full max-w-6xl md:h-[800px] h-[650px]">
          <BorderAnimatedContainer>
            <div className="w-full flex flex-col md:flex-row">

              {/* FORM ILLUSTRATION - LEFT SIDE */}
              <div className="hidden md:w-1/2 md:flex items-center justify-center p-6 bg-gradient-to-bl from-slate-800/20 to-transparent">
                <div>
                  <img
                    src="/asset.png"
                    alt="People using mobile devices"
                    className="w-full h-auto object-contain"
                  />
                    <div className="mt-6 text-center">
                    <h3 className="text-xl font-medium text-cyan-400">Connect anytime, anywhere</h3>

                    <div className="mt-4 flex justify-center gap-4">
                      <span className="auth-badge">Free</span>
                      <span className="auth-badge">Easy Setup</span>
                      <span className="auth-badge">Private</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* FORM CLOUMN - RIGHT SIDE */}
              <div className="md:w-1/2 p-8 flex items-center justify-center md:border-r border-slate-600/30">
                <div className="w-full max-w-md">

                  {/* HEADING TEXT */}
                  <div className="text-center mb-8">
                    <LuMessageCircle className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                    <h2 className="text-2xl font-bold text-slate-200 mb-2">Welcome Back</h2>
                    <p className="text-slate-400">Login to access to your account</p>
                  </div>

                  {/* FORM */}
                  <form className="px-12 space-y-6" onSubmit={onSubmit} >

                    {/* EMAIL INPUT */}
                    <div>
                      <label className="auth-input-label">Email</label>
                      <input
                        type="email"
                        className="input w-full"
                        placeholder="johndoe@gmail.com"
                        {...register("email", {
                          required: "This field is required",
                          pattern: {
                                      // This regex checks for characters@characters.domain
                                      value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                                      message: "Please enter a valid email address",
                                    }
                        })}
                      />

                      {errors.email && (<div className="text-red-400">{errors.email.message}</div>)}
                    </div>

                    {/* PASSWORD INPUT */}
                    <div>
                      <label className="auth-input-label">Password</label>

                      <input
                        type="password"
                        className="input w-full"
                        placeholder="Enter your password"
                        {...register("password", {
                          required: "This field is required",
                          minLength: {
                            value: 6,
                            message: "Password must be of atleast 6 characters"
                          }
                        })}
                      />

                      {errors.password && (<div className="text-red-400">{errors.password.message}</div>)}
                    </div>

                    {/* SUBMIT BUTTON */}
                    <button className="btn bg-blue-600 w-full hover:bg-green-600" type='submit'>
                      Log In
                    </button>
                  </form>

                  <div className="mt-6 text-center">
                    Don't have an account?&nbsp;
                    <Link to="/signup" className="font-semibold text-blue-400 hover:underline hover:text-blue-600">
                      Sign Up
                    </Link>
                  </div>
                </div>
              </div>


            </div>
          </BorderAnimatedContainer>
        </div>
      </div>

    </>
  )
}

export default LoginPage