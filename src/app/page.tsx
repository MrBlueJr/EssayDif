"use client";

import { useState, useMemo } from "react";
import { compareEssays, ParagraphDiff } from "@/lib/diffEngine";
import { computeMetrics, TextMetrics } from "@/lib/metrics";
import { Toolbar } from "@/components/Toolbar";
import { EditorPane } from "@/components/EditorPane";
import { DiffViewer } from "@/components/DiffViewer";
import { InsightsSidebar } from "@/components/InsightsSidebar";
import { useSyncScroll } from "@/hooks/useSyncScroll";
import { Edit2 } from "lucide-react";

export default function Home() {
  const [textA, setTextA] = useState("");
  const [textB, setTextB] = useState("");
  const [isEditing, setIsEditing] = useState(true);

  const [filters, setFilters] = useState({
    structural: true,
    semantic: true,
    netNew: true,
    wordLevel: true,
    punctuation: false,
  });

  const diffResult = useMemo(() => {
    if (!textA && !textB) return [];
    return compareEssays(textA, textB);
  }, [textA, textB]);

  const metricsA = useMemo(() => computeMetrics(textA), [textA]);
  const metricsB = useMemo(() => computeMetrics(textB), [textB]);

  const { leftPaneRef, rightPaneRef } = useSyncScroll();

  const showDiff = textA.trim().length > 0 && textB.trim().length > 0 && !isEditing;

  return (
    <main className="flex flex-col h-screen bg-background text-foreground">
      <Toolbar filters={filters} setFilters={setFilters} />
      
      <div className="flex-1 overflow-hidden flex flex-row">
        {/* Left Side: Document A */}
        <div className="flex-1 flex flex-col border-r border-border bg-card">
          <div className="px-4 py-3 border-b border-border bg-background-alt flex justify-between items-center">
            <span className="text-sm font-semibold text-foreground/80">Document A (Original)</span>
            {!isEditing && (
              <button onClick={() => setIsEditing(true)} className="text-xs flex items-center gap-1 text-foreground/50 hover:text-foreground">
                <Edit2 className="w-3 h-3" /> Edit
              </button>
            )}
          </div>
          <div ref={leftPaneRef} className="flex-1 overflow-auto p-8">
            {showDiff ? (
              <DiffViewer 
                diffs={diffResult} 
                docType="A" 
                filters={filters} 
              />
            ) : (
              <EditorPane 
                value={textA} 
                onChange={setTextA} 
                placeholder="Paste original essay here..." 
              />
            )}
          </div>
        </div>

        {/* Right Side: Document B */}
        <div className="flex-1 flex flex-col bg-card">
          <div className="px-4 py-3 border-b border-border bg-background-alt flex justify-between items-center">
            <span className="text-sm font-semibold text-foreground/80">Document B (Revised)</span>
            {isEditing && textA && textB && (
              <button 
                onClick={() => setIsEditing(false)} 
                className="text-xs bg-sage hover:bg-sage/90 text-card px-3 py-1.5 rounded-full font-bold shadow-sm transition-colors"
              >
                Compare Essays
              </button>
            )}
            {!isEditing && (
              <button onClick={() => setIsEditing(true)} className="text-xs flex items-center gap-1 text-foreground/50 hover:text-foreground">
                <Edit2 className="w-3 h-3" /> Edit
              </button>
            )}
          </div>
          <div ref={rightPaneRef} className="flex-1 overflow-auto p-8">
            {showDiff ? (
              <DiffViewer 
                diffs={diffResult} 
                docType="B" 
                filters={filters} 
              />
            ) : (
              <EditorPane 
                value={textB} 
                onChange={setTextB} 
                placeholder="Paste revised essay here..." 
              />
            )}
          </div>
        </div>

        {/* Insights Sidebar */}
        <InsightsSidebar 
          diffs={diffResult} 
          metricsA={metricsA} 
          metricsB={metricsB} 
        />
      </div>
    </main>
  );
}
