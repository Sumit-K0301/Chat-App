import React, { useEffect, useRef, useState } from 'react'
import { useForm } from "react-hook-form"
import * as apiClient from "../apiClient"

import useKeyboardSound from "../hooks/useKeyboardSound"

import { FiSend, FiImage, FiX } from 'react-icons/fi'
import useChatStore from '../store/useChatStore'
import toast from 'react-hot-toast'


function MessageInput() {

    const { isSoundEnabled, selectedUser, addMessage} = useChatStore();
    const {playRandomKeyStrokeSound} = useKeyboardSound();

    const [imagePreview, setImagePreview ] = useState(null);
    const fileInputRef = useRef();

    const { register, watch, reset, handleSubmit, setValue } = useForm();
    const { ref: registerRef, ...rest } = register("image");

    const text = watch("text");
    const imageFileList = watch("image");

    

    useEffect(() => {
        if (imageFileList && imageFileList.length > 0) {
            // Create a temporary URL for the selected file
            const file = imageFileList[0];
            const url = URL.createObjectURL(file);
            setImagePreview(url);

            // Cleanup: free memory when the component unmounts or file changes
            return () => URL.revokeObjectURL(url);
        } else {
            setImagePreview(null);
        }
    }, [imageFileList]);

    const removeImage = () => {
        setImagePreview(null);
        setValue("image", null);                                    //Clear the file from React Hook Form
        if (fileInputRef.current) fileInputRef.current.value = "";  // Clear the HTML input
    };

    const onSubmit = handleSubmit(async(data) => {
        const toSend = {
            text : data.text,
            image : data.image?.[0],
        }

        try {
            const response = await apiClient.sendMessage(selectedUser._id, toSend)

            if(response)
            addMessage(response)
            
            reset()
            setImagePreview("")

        } catch (error) {
            console.error(error)
            toast.error("Error")
        }
    })

    return (
    <div className="p-4 border-t border-slate-700/50">

        {imagePreview && (
        <div className="max-w-3xl mx-auto mb-3 flex items-center">
            <div className="relative">
                <img
                src={imagePreview}
                alt="Preview"
                className="w-20 h-20 object-cover rounded-lg border border-slate-700"
                />

                <button
                onClick={removeImage}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-200 hover:bg-slate-700"
                type="button"
                >
                <FiX className="w-4 h-4" />
                </button>
            </div>
        </div>
        )}

        <form onSubmit={onSubmit} className="max-w-3xl mx-auto flex space-x-4">

            <input
            type="text"
            className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-lg py-2 px-4"
            placeholder="Type your message..."
            {...register("text",{
                onChange : () => {
                    if(isSoundEnabled) playRandomKeyStrokeSound() 
                }
            })}
            />

            <input
            type="file"
            accept="image/*"
            className="hidden"
            {...rest}
            ref={(e) => {
                registerRef(e);           // Pass the element to React Hook Form
                fileInputRef.current = e; // Pass the element to your custom ref
            }}
            />

            <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`bg-slate-800/50 text-slate-400 hover:text-slate-200 rounded-lg px-4 transition-colors ${
                imagePreview ? "text-cyan-500" : ""
            }`}
            >
            <FiImage className="w-5 h-5" />
            </button>

            <button
            type="submit"
            disabled={!text?.trim() && !imagePreview}
            className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-lg px-4 py-2 font-medium hover:from-cyan-600 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
            <FiSend className="w-5 h-5" />
            </button>

        </form>
    </div>
  )
}

export default MessageInput