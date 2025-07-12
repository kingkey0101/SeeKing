export const maxDuration = 60;
import connectDB from "@/app/config/db";
import Chat from "@/app/models/Chat";
import { getAuth } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import OpenAI from "openai";

//initialize OpenAI w/ deepseek api key and base url
const openai = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY,
});

export async function POST(req) {
  try {
    // console.log("Incoming AI request");

    const rawHeaders = await headers();

    const { userId } = getAuth(req);
    // console.log("User ID:", userId);
    //extracting prompt & chatId from req body
    const { chatId, prompt } = await req.json();
    // console.log("Body data:", { chatId, prompt });
    if (!userId) {
      return NextResponse.json({
        success: false,
        message: "User not authenticated",
      });
    }

    //fetch chat in mongodb from userId & chatId
    await connectDB();
    // console.log("Connected to MongoDB");

    const data = await Chat.findOne({ userId, _id: chatId });
    if (!data) {
      // console.log("Chat not found");
      return NextResponse.json({
        success: false,
        message: "Chat not found for this user",
      });
    }

    //user message object creation
    const userPrompt = {
      role: "user",
      content: prompt,
      timestamp: Date.now(),
    };

    data.messages.push(userPrompt);

    //calling deepseek api for answers/competion in chat

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "deepseek-chat",
      store: true,
    });

    // console.log("Completion received:", completion.choices[0].message);

    const message = completion.choices[0].message;
    message.timestamp = Date.now();
    data.messages.push(message);

    await data.save();
    console.log("Chat saved successfully");

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("AI API Route Error", error);
    return NextResponse.json({ success: false, error: error.message });
  }
}
