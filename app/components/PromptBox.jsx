import { assets } from "@/assets/assets";
import Image from "next/image";
import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import axios from "axios";

const PromptBox = ({ setIsLoading, isLoading }) => {
  const [prompt, setPrompt] = useState("");
  const {
    user,
    chats,
    setChats,
    selectedChat,
    setSelectedChat,
    createNewChat,
  } = useAppContext();

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendPrompt(e);
    }
  };

  const sendPrompt = async (e) => {
    const promptCopy = prompt;
    try {
      e.preventDefault();
      if (!user) return toast.error("Login to use SeeKing");
      if (isLoading) return toast.error("Please wait for previous response");
      if (!selectedChat || !selectedChat._id) {
        toast.loading("Creating new chat...");
        const newChat = await createNewChat();

        if (!newChat || !newChat._id) {
          toast.error("Failed to create a new chat.");
          return;
        }
        console.log("New chat ID:", newChat._id); // Should not be null
        console.log("🤖 Assistant reply:", data.data);
        setSelectedChat(newChat);
      }
      if (!selectedChat || !selectedChat._id || !selectedChat.messages) {
        toast.error("Please wait, chat is still initializing...");
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setPrompt("");

      const userPrompt = {
        role: "user",
        content: prompt,
        timestamp: Date.now(),
      };
      //saving prompts in array
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat._id === selectedChat._id
            ? {
                ...chat,
                messages: [...chat.messages, userPrompt],
              }
            : chat
        )
      );

      //save prompt in current chat
      setSelectedChat((prev) => ({
        ...prev,
        messages: [...prev.messages, userPrompt],
      }));
      // console.log("Sending prompt with chatId:", selectedChat?._id);
      console.log("Sending prompt:", {
        chatId: selectedChat._id,
        prompt,
      });
      const { data } = await axios.post("/api/chat/ai", {
        chatId: selectedChat._id,
        prompt,
      });
      if (data.success) {
        const chat = data.data;
        //get assistant message from the end of message array
        const assistantMessage = chat.messages[chat.messages.length - 1];
        if (!assistantMessage || !assistantMessage.content) {
          toast.error("Assistant message missing");
          return;
        }
        const messageTokens = assistantMessage.content.split("");

        let assistantMessageDisplay = {
          role: "assistnat",
          content: "",
          timestamp: assistantMessage.timestamp || Date.now(),
        };
        let displayContent = "";

        setSelectedChat((prev) => ({
          ...prev,
          messages: [...prev.messages, assistantMessageDisplay],
        }));

        for (let i = 0; i < messageTokens.length; i++) {
          setTimeout(() => {
            assistantMessageDisplay.content = messageTokens
              .slice(0, i + 1)
              .join("");
            setSelectedChat((prev) => {
              const updatedMessages = [
                ...prev.messages.slice(0, -1),
                assistantMessageDisplay,
              ];
              return { ...prev, messages: updatedMessages };
            });
          }, i * 20);
        }
      } else {
        toast.error(data.message);
        setPrompt(promptCopy);
      }
    } catch (error) {
      toast.error(error.message);
      setPrompt(promptCopy);
    } finally {
      setIsLoading(false);
    }
    console.log("Sending with chatId:", selectedChat._id);
  };
  return (
    <form
      onSubmit={sendPrompt}
      className={`w-full ${
        selectedChat?.messages.length > 0 ? "max-w-3xl" : "max-w-2xl"
      }
    bg-[#404045] p-4 rounded-3xl mt-4 transition-all`}
    >
      <textarea
        onKeyDown={handleKeyDown}
        className="outline-none w-full resize-none overflow-hidden break-words bg-transparent"
        rows={2}
        placeholder="Message SeeKing"
        required
        onChange={(e) => setPrompt(e.target.value)}
        value={prompt}
      />
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <p
            className="flex items-center gap-2 text-xs border
           border-gray-300/40 px-2 py-1 rounded-full cursor-pointer
            hover:bg-gray-500/20 transition"
          >
            <Image className="h-5" src={assets.deepthink_icon} alt="" />
            DeepThink (R1)
          </p>
          <p
            className="flex items-center gap-2 text-xs border
           border-gray-300/40 px-2 py-1 rounded-full cursor-pointer
            hover:bg-gray-500/20 transition"
          >
            <Image className="h-5" src={assets.search_icon} alt="" />
            Search
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Image className="w-4 cursor-pointer" src={assets.pin_icon} alt="" />
          <button
            className={`${prompt ? "bg-primary" : "bg-[#71717a]"} 
          rounded-full p-2 cursor-pointer`}
          >
            <Image
              className="w-3.5 aspect-square"
              src={prompt ? assets.arrow_icon : assets.arrow_icon_dull}
              alt=""
            />
          </button>
        </div>
      </div>
    </form>
  );
};

export default PromptBox;
