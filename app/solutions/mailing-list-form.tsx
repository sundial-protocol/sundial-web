"use client";

import { useEffect, useState } from "react";
import { Section } from "@/components/ui/section";
import { Mail } from "lucide-react";

const LISTS = [
  { id: 1, label: "General Sundial Announcements" },
  { id: 3, label: "Alchemy Updates" },
  { id: 4, label: "Solstice Updates" },
  { id: 5, label: "Testnet Updates" },
];

export default function MailingListForm() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [selectedLists, setSelectedLists] = useState<number[]>([]);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  const allSelected = selectedLists.length === LISTS.length;

  useEffect(() => {
    const handler = (e: Event) => {
      const listId = (e as CustomEvent<{ listId: number }>).detail.listId;
      setSelectedLists((prev) =>
        prev.includes(listId) ? prev : [...prev, listId],
      );
    };
    window.addEventListener("preselectMailingList", handler);
    return () => window.removeEventListener("preselectMailingList", handler);
  }, []);

  function toggleAll() {
    setSelectedLists(allSelected ? [] : LISTS.map((l) => l.id));
  }

  function toggleList(id: number) {
    setSelectedLists((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id],
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || selectedLists.length === 0) return;

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, lists: selectedLists }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus("success");
        setMessage(
          data.alreadySubscribed
            ? "You're already subscribed to the selected lists."
            : "You're subscribed! We'll keep you posted.",
        );
        setEmail("");
        setName("");
        setSelectedLists([]);
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  }

  return (
    <Section className="w-full max-w-6xl mx-auto py-16 lg:pl-24">
      <div
        id="mailing-list-form"
        className="relative overflow-hidden rounded-[18px] border border-white/10 bg-white/5 px-6 py-8 md:rounded-[28px] md:px-10 md:py-10"
      >
        <div className="absolute inset-0 pointer-events-none" />

        <div className="relative max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/20 bg-primary/10">
              <Mail className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                Stay Updated
              </h2>
              <p className="text-sm text-foreground/60">
                Subscribe to Sundial mailing lists
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label
                  className="text-sm font-medium text-foreground/80"
                  htmlFor="ml-name"
                >
                  Name
                </label>
                <input
                  id="ml-name"
                  type="text"
                  placeholder="Satoshi Nakamoto"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-background/60 px-3 py-2 text-sm placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              <div className="space-y-1.5">
                <label
                  className="text-sm font-medium text-foreground/80"
                  htmlFor="ml-email"
                >
                  Email <span className="text-primary">*</span>
                </label>
                <input
                  id="ml-email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-background/60 px-3 py-2 text-sm placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground/80">
                  Lists <span className="text-primary">*</span>
                </p>
                <button
                  type="button"
                  onClick={toggleAll}
                  className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  {allSelected ? "Deselect all" : "Subscribe to all"}
                </button>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {LISTS.map((list) => {
                  const checked = selectedLists.includes(list.id);
                  return (
                    <button
                      key={list.id}
                      type="button"
                      onClick={() => toggleList(list.id)}
                      className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                        checked
                          ? "border-primary/50 bg-primary/10 text-foreground"
                          : "border-white/10 bg-secondary/60 text-foreground/70 hover:border-white/20 hover:bg-secondary/80"
                      }`}
                    >
                      <span
                        className={`h-4 w-4 shrink-0 rounded border flex items-center justify-center transition-colors ${
                          checked
                            ? "border-primary bg-primary"
                            : "border-white/30"
                        }`}
                      >
                        {checked && (
                          <svg
                            className="h-2.5 w-2.5 text-background"
                            viewBox="0 0 10 10"
                            fill="none"
                          >
                            <path
                              d="M1.5 5l2.5 2.5 4.5-5"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </span>
                      {list.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {message && (
              <p
                className={`text-sm ${
                  status === "success" ? "text-green-400" : "text-red-400"
                }`}
              >
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={
                status === "loading" || !email || selectedLists.length === 0
              }
              className="inline-flex h-11 items-center justify-center rounded-full bg-foreground px-8 text-sm font-medium text-background transition-colors hover:bg-foreground/80 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === "loading" ? "Subscribing…" : "Subscribe"}
            </button>
          </form>
        </div>
      </div>
    </Section>
  );
}
