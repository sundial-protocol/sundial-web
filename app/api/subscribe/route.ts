import { NextRequest, NextResponse } from "next/server";

const LISTS = {
  1: "General Sundial Announcements",
  3: "Alchemy Updates",
  4: "Solstice Updates",
  5: "Testnet Updates",
};

export async function POST(req: NextRequest) {
  const { email, name, lists } = await req.json();

  if (!email || !Array.isArray(lists) || lists.length === 0) {
    return NextResponse.json(
      { error: "Missing email or lists" },
      { status: 400 },
    );
  }

  const validLists = lists.filter((id: number) => id in LISTS);
  if (validLists.length === 0) {
    return NextResponse.json(
      { error: "No valid list IDs provided" },
      { status: 400 },
    );
  }

  const username = process.env.LISTMONK_ADMIN_USER;
  const password = process.env.LISTMONK_ADMIN_PASSWORD;
  if (!username || !password) {
    console.error("LISTMONK_ADMIN_USER or LISTMONK_ADMIN_PASSWORD is not set");
    return NextResponse.json(
      { error: "Server misconfiguration" },
      { status: 500 },
    );
  }

  const credentials = Buffer.from(`${username}:${password}`).toString(
    "base64",
  );

  const response = await fetch(
    "https://lists.sundialprotocol.com/api/subscribers",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${credentials}`,
      },
      body: JSON.stringify({
        email,
        name: name || email,
        status: "enabled",
        lists: validLists,
        preconfirm_subscriptions: true,
      }),
    },
  );

  if (!response.ok) {
    const text = await response.text();
    console.error("Listmonk error:", response.status, text);
    // 409 means already subscribed — treat as success
    if (response.status === 409) {
      return NextResponse.json({ success: true, alreadySubscribed: true });
    }
    return NextResponse.json({ error: "Subscription failed" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
