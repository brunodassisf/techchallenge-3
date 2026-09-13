import { deleteSession } from "@/lib/session";
import { NextResponse } from "next/server";

export async function POST() {
  await deleteSession();
  return NextResponse.json({ message: "Logout realizado com sucesso!" });
}
