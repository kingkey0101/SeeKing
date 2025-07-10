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
    //finding chatId & name w/ this req
    const { chatId, name } = await req.json();
    //updating chat name in mongodb
    await connectDB();
    await Chat.findOneAndUpdate({ _id: chatId, userId }, { name });

    return NextResponse.json({ success: true, message: "Chat Renamed" });
  } catch (error) {
    return NextResponse.json({ success: false, erro: error.message });
  }
}
