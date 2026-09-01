import { ParagraphDiff } from "@/lib/diffEngine";
import { TextMetrics } from "@/lib/metrics";
import { 
  BarChart3, 
  FileText, 
  BookOpen, 
  Clock, 
  ArrowLeftRight,
  PlusCircle,
  MinusCircle,
  Edit3
} from "lucide-react";

interface InsightsSidebarProps {
  diffs: ParagraphDiff[];
  metricsA: TextMetrics;
  metricsB: TextMetrics;
}

export function InsightsSidebar({ diffs, metricsA, metricsB }: InsightsSidebarProps) {
  // Aggregate stats
  const stats = {
    added: diffs.filter(d => d.type === 'added').length,
    deleted: diffs.filter(d => d.type === 'deleted').length,
    moved: diffs.filter(d => d.type === 'moved').length,
    modified: diffs.filter(d => d.type === 'modified').length,
    unchanged: diffs.filter(d => d.type === 'equal').length,
  };

  const totalParas = diffs.length;
  const changedRatio = totalParas ? Math.round(((totalParas - stats.unchanged) / totalParas) * 100) : 0;

  return (
    <div className="w-80 border-l border-border bg-card flex flex-col z-10">
      <div className="h-14 border-b border-border flex items-center px-6 font-semibold text-foreground/80 gap-2">
        <BarChart3 className="w-4 h-4" />
        Insights Summary
      </div>
      
      <div className="p-6 overflow-auto flex flex-col gap-8">
        
        {/* Document Stats */}
        <section>
          <h3 className="text-xs font-bold text-foreground/40 uppercase tracking-widest mb-4">Document Metrics</h3>
          <div className="grid grid-cols-2 gap-4">
            <MetricCard 
              label="Words (Doc B)" 
              value={metricsB.wordCount.toLocaleString()} 
              subValue={formatDelta(metricsB.wordCount - metricsA.wordCount)}
              icon={<FileText className="w-4 h-4 text-slate" />} 
            />
            <MetricCard 
              label="Reading Time" 
              value={`${metricsB.readingTimeMin}m`} 
              subValue={formatDelta(metricsB.readingTimeMin - metricsA.readingTimeMin, "m")}
              icon={<Clock className="w-4 h-4 text-ochre" />} 
            />
            <MetricCard 
              label="Readability" 
              value={`Grade ${metricsB.fleschKincaid}`} 
              subValue={formatDelta(metricsB.fleschKincaid - metricsA.fleschKincaid, "", true)}
              icon={<BookOpen className="w-4 h-4 text-sage" />} 
            />
          </div>
        </section>

        {/* Change Breakdown */}
        <section>
          <h3 className="text-xs font-bold text-foreground/40 uppercase tracking-widest mb-4">Structural Edits</h3>
          <div className="bg-background-alt rounded-lg p-4 border border-border flex flex-col gap-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-foreground/70 font-medium">Total Changed</span>
              <span className="font-bold">{changedRatio}%</span>
            </div>
            
            <div className="w-full h-2 rounded-full overflow-hidden flex">
              <div style={{width: `${(stats.added/totalParas)*100}%`}} className="bg-sage h-full" />
              <div style={{width: `${(stats.modified/totalParas)*100}%`}} className="bg-ochre h-full" />
              <div style={{width: `${(stats.moved/totalParas)*100}%`}} className="bg-slate h-full" />
              <div style={{width: `${(stats.deleted/totalParas)*100}%`}} className="bg-terracotta h-full" />
              <div style={{width: `${(stats.unchanged/totalParas)*100}%`}} className="bg-border h-full" />
            </div>

            <div className="grid grid-cols-2 gap-y-2 mt-2">
              <LegendItem icon={<PlusCircle className="w-3 h-3"/>} color="text-sage" label="Added" count={stats.added} />
              <LegendItem icon={<Edit3 className="w-3 h-3"/>} color="text-ochre" label="Rewritten" count={stats.modified} />
              <LegendItem icon={<ArrowLeftRight className="w-3 h-3"/>} color="text-slate" label="Moved" count={stats.moved} />
              <LegendItem icon={<MinusCircle className="w-3 h-3"/>} color="text-terracotta" label="Deleted" count={stats.deleted} />
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

function MetricCard({ label, value, subValue, icon }: any) {
  const isPositive = subValue && subValue.startsWith('+');
  const isNegative = subValue && subValue.startsWith('-');
  const color = isPositive ? 'text-sage' : (isNegative ? 'text-terracotta' : 'text-foreground/40');

  return (
    <div className="bg-background-alt border border-border rounded-lg p-3 flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-foreground/50">
        {icon}
        <span className="text-xs font-semibold">{label}</span>
      </div>
      <div className="flex items-baseline gap-2 mt-1">
        <span className="text-xl font-bold font-serif">{value}</span>
        {subValue && (
          <span className={`text-xs font-bold ${color}`}>
            {subValue}
          </span>
        )}
      </div>
    </div>
  );
}

function LegendItem({ icon, color, label, count }: any) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-foreground/70">
      <div className={color}>{icon}</div>
      <span>{label}</span>
      <span className="font-bold ml-auto">{count}</span>
    </div>
  );
}

function formatDelta(val: number, suffix: string = "", invertColors: boolean = false) {
  if (isNaN(val) || val === 0) return null;
  const sign = val > 0 ? "+" : "";
  // Round to 1 decimal place
  const rounded = Math.round(val * 10) / 10;
  return `${sign}${rounded}${suffix}`;
}
