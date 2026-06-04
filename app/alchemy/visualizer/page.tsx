"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { VisualizerContent } from "./visualizer-content";

export default function AlchemyVisualizer() {
  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-6 pt-36 pb-4">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Link
                href="/alchemy"
                className="inline-flex items-center gap-1.5 text-xs text-[#A8B5C8] hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to Alchemy
              </Link>
              <span className="text-[#1F3A66]">.</span>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-[#3FB8FF]/20 bg-[#3FB8FF]/25 px-3 py-0.5 text-xs font-medium text-[#3FB8FF]">
                Interactive Tool
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6">
        <VisualizerContent />
      </div>
    </div>
  );
}
