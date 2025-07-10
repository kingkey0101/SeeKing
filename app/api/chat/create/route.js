import connectDB from "@/app/config/db";
import Chat from "@/app/models/Chat";
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
    //gathering chat data to store in mongodb
    const chatData = {
      userId,
      messages: [],
      name: "New Chat",
    };
    //connecting to db to create new chat
    await connectDB();
    await Chat.create(chat);
    return NextResponse.json({ success: true, message: "Chat created" });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
