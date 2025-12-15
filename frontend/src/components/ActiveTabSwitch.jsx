import React, { useState } from 'react'
import useChatStore from '../store/useChatStore'

function ActiveTabSwitch() {

    const {activeTab, setActiveTab} = useChatStore()
    return (
    <div className="tabs tabs-boxed bg-transparent border-b border-slate-700/50">
      <button
        onClick={() => setActiveTab("chats")}
        className={`w-1/2 btn btn-xs sm:btn-sm md:btn-md lg:btn-lg xl:btn-xl font-medium rounded-xl ${
          activeTab === "chats" ? "bg-cyan-500/20 text-cyan-400" : "text-slate-400"
        }`}
      >
        Chats
      </button>

      <button
        onClick={() => setActiveTab("contacts")}
        className={`w-1/2 btn btn-xs sm:btn-sm md:btn-md lg:btn-lg xl:btn-xl font-medium rounded-xl ${
          activeTab === "contacts" ? "bg-cyan-500/20 text-cyan-400" : "text-slate-400"
        }`}
      >
        Contacts
      </button>
    </div>
  )
}

export default ActiveTabSwitch