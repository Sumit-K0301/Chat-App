import React, { useEffect, useState } from 'react'
import * as apiClient from "../apiClient"
import useChatStore from '../store/useChatStore'
import useAuthStore from '../store/useAuthStore';
import toast from 'react-hot-toast';
import UsersLoadingSkeleton from './UsersLoadingSkeleton';

function ContactList() {

  const { isUserLoading, setIsUserLoading, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [ allContacts, setAllContacts] = useState([])

  useEffect(() => {
    const contactList = async() => {
      setIsUserLoading(true);
      try {
        const response = await apiClient.getContacts();
        setAllContacts(response)
      } catch (error) {
        toast.error(error.response?.data?.message)
        console.error(error)
      } finally {
        setIsUserLoading(false)
      } 
    }
    
    contactList();
    
  }, [])

  if (isUserLoading) return <UsersLoadingSkeleton />;

  return (
    <>
      {allContacts.map((contact) => (
        <div
          key={contact._id}
          className="bg-cyan-500/10 p-4 rounded-lg cursor-pointer hover:bg-cyan-500/20 transition-colors"
          onClick={() => setSelectedUser(contact)}
        >
          <div className="flex items-center gap-3">
            <div className={`avatar ${onlineUsers.includes(contact._id) ? "online" : "offline"}`}>
              <div className="size-12 rounded-full">
                <img src={contact.profilePic || "/avatar.png"} />
              </div>
            </div>
            <h4 className="text-slate-200 font-medium">{contact.fullname}</h4>
          </div>
        </div>
      ))}
    </>
  )
}

export default ContactList