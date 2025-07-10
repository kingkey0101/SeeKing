"use client";
import { useAuth, useUser } from "@clerk/nextjs";
import axios from "axios";
import React, { createContext, useContext, useState } from "react";

export const AppContext = createContext();

export const useAppContext = () => {
  return useContext(AppContext);
};

export const AppContextProvider = ({ children }) => {
  const { user } = useUser();
  const { getToken } = useAuth();

  const [chats, setChats] = useState([]);
  const [selectedChat, setSelcetedChat] = useState(null);

  const createNewChat = async () => {
    try {
      if (!user) return null;

      const token = await getToken();

      await axios.post(
        "/api/chat/create",
        {},
        {
          headers: {
            Authorization: `Bearer $[token]`,
          },
        }
      );
    } catch (error) {
      toast
    }
  };

  const fetchUsersChats = async ()=>{
    try {
      
    } catch (error) {
      
    }
  }

  const value = { user };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
