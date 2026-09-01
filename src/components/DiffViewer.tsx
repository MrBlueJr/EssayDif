import { ParagraphDiff, DiffToken } from "@/lib/diffEngine";
import { ArrowLeftRight, CheckCircle2, AlertCircle } from "lucide-react";

interface DiffViewerProps {
  diffs: ParagraphDiff[];
  docType: "A" | "B";
  filters: any;
}

export function DiffViewer({ diffs, docType, filters }: DiffViewerProps) {
  return (
    <div className="font-serif text-lg leading-relaxed pb-[50vh]">
      {diffs.map((diff, index) => {
        // Decide whether to render this paragraph in this doc view
        if (docType === "A" && diff.type === "added") return null;
        if (docType === "B" && diff.type === "deleted") return null;

        const tokens = docType === "A" ? diff.tokensA : diff.tokensB;
        const text = docType === "A" ? diff.textA : diff.textB;
        const paraId = `para-${docType}-${index}`;

        // Determine paragraph base styling based on type and filters
        let bgClass = "transparent";
        let borderClass = "border-transparent";
        let Badge = null;

        if (diff.type === "moved" && filters.structural) {
          bgClass = "bg-slate-light/40";
          borderClass = "border-slate/30";
          Badge = (
            <div className="absolute -left-3 top-2 flex items-center gap-1 text-[10px] uppercase font-sans font-bold text-slate bg-card px-1.5 py-0.5 rounded border border-slate/20 shadow-sm">
              <ArrowLeftRight className="w-3 h-3" />
              Moved
            </div>
          );
        } else if (diff.type === "added" && filters.netNew) {
          bgClass = "bg-sage-light/40";
          borderClass = "border-sage/30";
          Badge = (
            <div className="absolute -left-3 top-2 flex items-center gap-1 text-[10px] uppercase font-sans font-bold text-sage bg-card px-1.5 py-0.5 rounded border border-sage/20 shadow-sm">
              <CheckCircle2 className="w-3 h-3" />
              New
            </div>
          );
        } else if (diff.type === "deleted" && filters.netNew) {
          bgClass = "bg-terracotta-light/40";
          borderClass = "border-terracotta/30";
          Badge = (
            <div className="absolute -left-3 top-2 flex items-center gap-1 text-[10px] uppercase font-sans font-bold text-terracotta bg-card px-1.5 py-0.5 rounded border border-terracotta/20 shadow-sm">
              <AlertCircle className="w-3 h-3" />
              Removed
            </div>
          );
        }

        // Optional: detect heavy paraphrasing for the "semantic" filter
        const isHeavilyModified = diff.type === "modified" && tokens && tokens.filter(t => t.type !== 'equal').length > tokens.length * 0.3;
        if (isHeavilyModified && filters.semantic) {
          bgClass = "bg-ochre-light/20";
          borderClass = "border-ochre/20";
        }

        return (
          <div 
            key={diff.id} 
            id={paraId}
            className={`relative mb-6 p-2 -mx-2 rounded border-l-2 transition-colors duration-300 ${bgClass} ${borderClass}`}
            data-sync-id={diff.id} // Used for scroll syncing
          >
            {Badge}
            <p className="whitespace-pre-wrap text-foreground/90">
              {tokens ? (
                tokens.map((token, i) => (
                  <TokenRenderer 
                    key={i} 
                    token={token} 
                    filters={filters} 
                  />
                ))
              ) : (
                text
              )}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function TokenRenderer({ token, filters }: { token: DiffToken; filters: any }) {
  if (token.type === 'equal') return <span>{token.text}</span>;

  let className = "";
  let shouldRender = false;

  if (token.type === 'insert' && filters.wordLevel) {
    className = "bg-sage-light text-foreground/90 px-0.5 rounded";
    shouldRender = true;
  } else if (token.type === 'delete' && filters.wordLevel) {
    className = "bg-terracotta-light text-terracotta line-through px-0.5 rounded";
    shouldRender = true;
  } else if (token.type === 'punctuation' && filters.punctuation) {
    className = "bg-slate-blue-light text-slate-blue font-bold px-0.5 rounded underline decoration-dotted underline-offset-4";
    shouldRender = true;
  }

  if (!shouldRender) {
    // If filter is off, we still render the text if it's an insertion in B, 
    // but without highlight. If it's a deletion in A, we don't render it in B normally, 
    // but since this component is per-doc, the text naturally belongs there.
    return <span>{token.text}</span>;
  }

  return <span className={className}>{token.text}</span>;
}
