import connectDB from "@/app/config/db";
import Chat from "@/app/models/Chat";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return NextResponse.json({
        success: false,
        message: "User not authenticated",
      });
    }
    await connectDB();

    //gathering chat data to store in mongodb
    const chatData = {
      userId,
      messages: [],
      name: "New Chat",
    };

    const newChat = await Chat.create(chatData);

    //connecting to db to create new chat

    return NextResponse.json({ success: true, data: newChat });
  } catch (error) {
    console.error("API chat create error:", error);
    return NextResponse.json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
}
