import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Please enter your name." },
        { status: 400 }
      );
    }

    const { data: guest, error } = await supabaseAdmin
      .from("guests")
      .select(
        `
          id,
          full_name,
          household_id,
          households (
            invitation_name
          )
        `
      )
      .ilike("full_name", name.trim())
      .single();

    if (error || !guest) {
      return NextResponse.json(
        { error: "Invitation not found." },
        { status: 404 }
      );
    }

    const { data: guests } = await supabaseAdmin
      .from("guests")
      .select("*")
      .eq("household_id", guest.household_id);

    return NextResponse.json({
      household: guest.households,
      guests,
    });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}