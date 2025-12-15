import React, { useEffect, useRef, useState } from 'react'
import * as apiClient from "../apiClient"
import useAuthStore from "../store/useAuthStore"
import useChatStore from '../store/useChatStore';
import { useNavigate } from "react-router-dom"

import toast from 'react-hot-toast';
import { FiLogOut, FiVolume2, FiVolumeX } from 'react-icons/fi';

function ProfileHeader() {

    const { authenticate, disconnectSocket } = useAuthStore();
    const { isSoundEnabled, toggleSound, setSelectedUser } = useChatStore();

    const navigate = useNavigate();
    const fileInputRef = useRef();
    const [user, setUser] = useState("");
    const [selectedImg, setSelectedImg] = useState(null)

    const mouseClickSound = new Audio ("/sounds/mouse-click.mp3")

    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        if(!file) return;
     
        setSelectedImg(URL.createObjectURL(file))
        toast.promise(
        apiClient.updateProfile({profilePic : file}),
        {
            loading: 'Updating Profile Picture',
            success: 'Profile Picture Updated',
            error: (err) => err.response?.data?.message,
        }
    )   
    } 


    useEffect( () => {
        const user = async() => {
            try {
                const response = await apiClient.profile();
                setUser(response)
            } catch(error) {
                console.error(error)
            } 
        }

        user();
    },[])
    
    const logout = async () => {
        try {
            await apiClient.logout();
            setSelectedUser(null)
            disconnectSocket();
            toast.success("Logged Out ");

            authenticate();
            navigate("/");
        }

        catch(error) {
            console.error("Logout Unsuccessful")
        }    
    }

  return (
    <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">

                {/* AVATAR */}
                <div className="avatar avatar-online">

                    <button
                    className="size-14 rounded-full overflow-hidden relative group"
                    onClick={() => fileInputRef.current.click()}
                    >
                        <img
                        src={selectedImg || user.profilePic || "/avatar.png"}
                        alt="User image"
                        className="size-full object-cover"
                        />

                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <span className="text-white text-xs">Change</span>
                        </div>
                    </button>

                    <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    className="hidden"
                    />

                </div>

                {/* USERNAME & ONLINE TEXT */}
                <div>
                    <h3 className="text-slate-200 font-medium text-base max-w-[180px] truncate">
                    {user.fullname}
                    </h3>

                    <p className="text-slate-400 text-xs">Online</p>
                </div>
            </div>

            {/* BUTTONS */}
            <div className="flex gap-4 items-center">

                {/* LOGOUT BTN */}
                <button
                    className="text-slate-400 hover:text-slate-200 transition-colors"
                    onClick={logout}
                >
                    <FiLogOut className="size-5" />
                </button>

                {/* SOUND TOGGLE BTN */}
                <button
                    className="text-slate-400 hover:text-slate-200 transition-colors"
                    onClick={() => {
                    // play click sound before toggling
                    mouseClickSound.currentTime = 0; // reset to start
                    mouseClickSound.play().catch((error) => console.log("Audio play failed:", error));

                    toggleSound();
                    }}
                >
                    {isSoundEnabled ? (
                    <FiVolume2 className="size-5" />
                    ) : (
                    <FiVolumeX className="size-5" />
                    )}
                </button>
            </div>
        </div>
    </div>
  );
}

export default ProfileHeader