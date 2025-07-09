import { Webhook } from "svix";
import connectDB from "@/app/config/db";
import User from "@/app/models/User";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
// setting up clerk webhooks for user creation, updates, etc
export async function POST(req) {
  const wh = new Webhook(process.env.SIGNING_SECRET);
  const headerPayload = await headers();
  const svixHeaders = {
    "svix-id": headerPayload.get("svix-id"),
    "svix-signiture": headerPayload.get("svix-signiture"),
  };
  //getting and verifying payload

  const payload = await req.json();
  const body = JSON.stringify(payload);
  const { data, type } = wh.verify(body, svixHeaders);

  //storage of user data in db prep
  const userData = {
    _id: data.id,
    email: data.email_addresses[0].email_addresses,
    name: `${data.first_name} ${data.last_name}`,
    image: data.image_url,
  };

  //storing in mongodb
  await connectDB();

  switch (type) {
    case "user.created":
      await User.create(userData);
      break;

    case "user.updated":
      await User.findByIdAndUpdate(data.id, userData);
      break;

    case "user.deleted":
      await User.findByIdAndDelete(data.id);
      break;

    default:
      break;
  }
  return NextResponse.json({ message: "Event received" });
}
