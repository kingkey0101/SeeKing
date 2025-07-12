"use client";
import { useAuth, useUser } from "@clerk/nextjs";
import axios from "axios";
import React, { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

export const AppContext = createContext();

export const useAppContext = () => {
  return useContext(AppContext);
};

export const AppContextProvider = ({ children }) => {
  const { user } = useUser();
  const { getToken } = useAuth();

  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState({
    _id: null,
    messages: [],
  });

  const createNewChat = async () => {
    try {
      if (!user) return null;

      const token = await getToken();

      const response = await axios.post(
        "/api/chat/create",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Full response from create:", response);
      if (response.data && response.data.success) {
        const newChat = response.data.data;
        console.log("Full newChat object:", newChat);

        if (!newChat || !newChat._id) {
          toast.error("Received invalid chat from server");
          return null;
        }
        setChats((prev) => [newChat, ...prev]);
        setSelectedChat(newChat);
        return newChat;
      } else {
        toast.error(response.data?.message || "Failed to create new chat");
        return null;
      }
    } catch (error) {
      console.error("Chat creation error:", error);
      toast.error(
        error?.response?.data?.message ||
          error.message ||
          "Something went wrong"
      );
      return null;
    }
  };

  const fetchUsersChats = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get("/api/chat/get", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (data.success) {
        if (data.data.length === 0) {
          const newChat = await createNewChat(); //  get chat
          if (newChat) {
            setChats([newChat]);
            setSelectedChat(newChat); //  set it directly
          }
          return;
        }

        data.data.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        setChats(data.data);
        setSelectedChat(data.data[0]);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUsersChats();
    }
  }, [user]);
  const value = {
    user,
    chats,
    setChats,
    selectedChat,
    setSelectedChat,
    fetchUsersChats,
    createNewChat,
  };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
