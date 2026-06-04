"use client";

import { useState } from "react";
import { Maximize2, Minimize2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AlchemyVisualizer() {
  const [fullscreen, setFullscreen] = useState(false);

  return (
    <div className="min-h-screen bg-[#06101E]">
      <div className="max-w-5xl mx-auto px-6 pt-36 pb-4">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Link
                href="/alchemy"
                className="inline-flex items-center gap-1.5 text-xs text-[#A8B5C8] hover:text-white transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to Alchemy
              </Link>
              <span className="text-[#1F3A66]">·</span>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-[#3FB8FF]/20 bg-[#3FB8FF]/5 px-3 py-0.5 text-xs font-medium text-[#3FB8FF]">
                Interactive Tool
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white">System Visualizer</h1>
            <p className="mt-2 text-[#A8B5C8] text-sm max-w-xl leading-relaxed">
              Move the sliders to adjust BTC price, vault size, ICE outstanding,
              and FIRE supply. The reserve ratio, capital stack, and scenario
              projections update in real time.
            </p>
          </div>
          <button
            onClick={() => setFullscreen(true)}
            className="shrink-0 flex items-center gap-2 rounded-lg border border-[#1F3A66] bg-[#152846] px-3 py-2 text-xs text-[#A8B5C8] hover:text-white hover:border-[#3FB8FF]/50 transition-all mt-8"
          >
            <Maximize2 className="h-4 w-4" />
            Fullscreen
          </button>
        </div>
      </div>

      <iframe
        src="/alchemy/visualizer.html"
        className="w-full border-0"
        style={{ height: "calc(100vh - 200px)", minHeight: "700px" }}
        title="Alchemy System Visualizer"
      />

      {fullscreen && (
        <div className="fixed inset-0 z-50 bg-[#06101E]">
          <button
            onClick={() => setFullscreen(false)}
            className="absolute top-4 right-4 z-10 flex items-center gap-2 rounded-lg border border-[#1F3A66] bg-[#152846] px-3 py-2 text-xs text-[#A8B5C8] hover:text-white transition-all"
          >
            <Minimize2 className="h-4 w-4" />
            Exit Fullscreen
          </button>
          <iframe
            src="/alchemy/visualizer.html"
            className="w-full h-full border-0"
            title="Alchemy System Visualizer"
          />
        </div>
      )}
    </div>
  );
}
