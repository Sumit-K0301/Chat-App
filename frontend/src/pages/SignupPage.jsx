import React, { useState } from 'react'

import { useMutation } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import * as apiClient from "../apiClient"
import useAuthStore from "../store/useAuthStore"
import { Link } from "react-router-dom"

import { LuMessageCircle } from "react-icons/lu"
import BorderAnimatedContainer from "../components/BorderAnimatedContainer.jsx"
import toast from 'react-hot-toast';


function SignupPage() {
    
    const { authenticate } = useAuthStore();

    const {register, watch, handleSubmit, formState : {errors}} = useForm();

    const mutation = useMutation({
        mutationFn : apiClient.register,
        onSuccess : () => {
            authenticate();
            connectSocket();
            console.log("Signup successful");
        },

        onError : (error) => {
            console.error("Signup failed:", error.response.data.message);
        }
    });

    const onSubmit = handleSubmit ((data) => toast.promise(
        mutation.mutateAsync(data), // use mutateAsync, not mutate
        {
            loading: 'Creating your account...',
            success: 'Account created successfully!',
            error: (err) => err.response?.data?.message,
        }
    ));

    return (
     <>
        <div className="w-full min-h-screen flex items-center justify-center p-4 bg-slate-900">
            <div className="relative w-full max-w-6xl md:h-[800px] h-[650px]">
                <BorderAnimatedContainer>
                    <div className="w-full flex flex-col md:flex-row">

                        {/* FORM ILLUSTRATION - LEFT SIDE */}
                        <div className="hidden min-h-screen md:w-1/2 md:flex items-center justify-center p-6 bg-gradient-to-bl from-slate-800/20 to-transparent">
                            <div>
                                <img
                                src="/asset.png"
                                alt="People using mobile devices"
                                className="w-full h-auto object-contain"
                                />
                                <div className="mt-6 text-center">
                                    <h3 className="text-xl font-medium text-cyan-400">Start Your Journey Today</h3>

                                    <div className="mt-4 flex justify-center gap-4">
                                        <span className="auth-badge">Free</span>
                                        <span className="auth-badge">Easy Setup</span>
                                        <span className="auth-badge">Private</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* FORM CLOUMN - RIGHT SIDE */}
                        <div className="min-h-screen md:w-1/2 p-8 flex items-center justify-center md:border-r border-slate-600/30">
                            <div className="w-full max-w-md">

                                {/* HEADING TEXT */}
                                <div className="text-center mb-8">
                                    <LuMessageCircle className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                                    <h2 className="text-2xl font-bold text-slate-200 mb-2">Create Account</h2>
                                    <p className="text-slate-400">Sign up for a new account</p>
                                </div>

                                {/* FORM */}
                                <form onSubmit={onSubmit} className="px-12 space-y-6">

                                    {/* FULL NAME */}
                                    <div>
                                        <label className="auth-input-label">Full Name</label>
                                        <input
                                        type="text"
                                        className="input w-full"
                                        placeholder="John Doe"
                                        {...register("fullname", {
                                            required: "This field is required",
                                            pattern: {
                                                        // Regex: Start(^) -> Letters & Spaces only([]) -> End($)
                                                        value: /^[A-Za-z\s]+$/, 
                                                        message: "Name can only contain letters and spaces"
                                                    }
                                        })}
                                        />
                                        
                                        {errors.fullname && (<div className="text-red-400">{errors.fullname.message}</div>)}
                                    </div>

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
                                            minLength : {
                                                        value : 6,
                                                        message : "Password must be of atleast 6 characters"}})}
                                        />
                                        
                                        {errors.password && (<div className="text-red-400">{errors.password.message}</div>)}
                                    </div>

                                    <div>
                                        <label className="auth-input-label">Confirm Password</label>
                                        <input
                                        type="password"
                                        className="input w-full"
                                        placeholder="Confirm your password"
                                        {...register("confirmPassword", {
                                            required: "This field is required",
                                            validate : (val) => {
                                                if(watch("password") !== val) {
                                                    return "Passwords do not match";
                                                }
                                            }})}
                                        />
                                        
                                        {errors.confirmPassword && (<div className="text-red-400">{errors.confirmPassword.message}</div>)}
                                    </div>



                                    {/* SUBMIT BUTTON */}
                                    <button className = "btn bg-blue-600 w-full hover:bg-green-600" type="submit">
                                        Create Account 
                                    </button>
                                </form>

                                <div className="mt-6 text-center">
                                    Already have an account?&nbsp;
                                    <Link to="/login" className="font-semibold text-blue-400 hover:underline hover:text-blue-600">
                                         Log In
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

export default SignupPage