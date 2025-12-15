import axiosInstance from "./utilities/axios";
import useAuthStore from "./store/useAuthStore";

// ----------------- SIGNUP -----------------

export const register = async (formData) => {
    try {
        const response = await axiosInstance.post(`/api/user/register`, formData);
        
        return response.data;
        
    } catch (error) {
        console.error("Error during signup:", error);
        throw error;
    }
};


// ----------------- LOGIN & LOGOUT -----------------

export const login = async (formData) => {
    try {
        const response = await axiosInstance.post(`/api/auth/login`, formData);

        return response.data;
        
    } catch (error) {
        console.error("Error during login:", error);
        throw error;
    }   
};

export const logout = async () => {
    try {
        const response = await axiosInstance.post(`/api/auth/logout`);

        return response.data;
        
    } catch (error) {
        console.error("Error during logout:", error);
        throw error;
    }
};

// ----------------- PROFILE & UPDATE PROFILE -----------------

export const profile = async () => {
    try {
        const response = await axiosInstance.get(`/api/user/profile`);

       return response.data;

    } catch (error) {
        console.error("Error fetching profile:", error);
        throw error;
    }   
};

export const updateProfile = async (profileContent) => {
    try {

         // 1. Create FormData container
        const formData = new FormData();
        
        if (profileContent.fullname) formData.append("fullname", profileContent.fullname);
        if (profileContent.email) formData.append("email",profileContent.email);
        if (profileContent.password) formData.append("password",profileContent.password);
        
        // 3. Append the image file (if it exists)
        // 'image' must match the field name in your backend upload.single('image')
        if (profileContent.profilePic) {
            formData.append("profilePic", profileContent.profilePic);
        }

        // 4. Send FormData instead of JSON
        // Axios will automatically set 'Content-Type: multipart/form-data'
        const response = await axiosInstance.put(`/api/user/update-profile`, formData);

        return response.data;

    } catch (error) {
        console.error("Error updating profile:", error);
        throw error;
    }   
};


// ----------------- MESSAGE ROUTES -----------------

export const getContacts = async () => {
    try {
        const response = await axiosInstance.get(`/api/messages/contacts`);
        
        return response.data;

    } catch (error) {
        console.error("Error fetching messages:", error);
        throw error;
    }
};

export const getChatPartners = async() => {
    try {
        const response = await axiosInstance.get("/api/messages/chat-partners");
        
        return response.data;

    } catch (error) {
        console.error("Error fetching chat partners:", error);
        throw error;
    }
};

export const getMessages = async(partnerID) => {
    try{
        const response = await axiosInstance.get(`/api/messages/${partnerID}`);
        
        return response.data;

    } catch (error) {
        console.error("Error fetching messages:", error);
        throw error;
    }
};

export const sendMessage = async(partnerID, messageContent) => {
    try {
        // 1. Create FormData container
        const formData = new FormData();
        
        // 2. Append the text message (if it exists)
        if (messageContent.text) {
            formData.append("text", messageContent.text);
        }

        // 3. Append the image file (if it exists)
        // 'image' must match the field name in your backend upload.single('image')
        if (messageContent.image) {
            formData.append("image", messageContent.image);
        }

        // 4. Send FormData instead of JSON
        // Axios will automatically set 'Content-Type: multipart/form-data'
        const response = await axiosInstance.post(`/api/messages/${partnerID}`,formData);
        
        return response.data;

    } catch (error) {
        console.error("Error sending message:", error);
        throw error;
    }
};

// ----------------- END -----------------
