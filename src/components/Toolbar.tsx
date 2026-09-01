import { Logo } from "./Logo";
import { 
  ArrowRightLeft, 
  FileText, 
  PlusSquare, 
  Type, 
  Quote
} from "lucide-react";

interface ToolbarProps {
  filters: {
    structural: boolean;
    semantic: boolean;
    netNew: boolean;
    wordLevel: boolean;
    punctuation: boolean;
  };
  setFilters: (f: any) => void;
}

export function Toolbar({ filters, setFilters }: ToolbarProps) {
  const toggle = (key: keyof typeof filters) => {
    setFilters({ ...filters, [key]: !filters[key] });
  };

  return (
    <div className="h-14 border-b border-border bg-card flex items-center px-6 gap-6 shadow-sm z-10">
      <div className="flex items-center gap-2.5 cursor-default">
        <Logo className="w-8 h-8 text-ochre drop-shadow-sm" />
        <div className="flex flex-col justify-center">
          <span className="font-extrabold text-foreground tracking-tight leading-none text-[1.1rem]">
            Essay<span className="text-ochre">Dif</span>
          </span>
          <span className="text-[0.6rem] font-bold text-foreground/40 tracking-[0.2em] uppercase leading-none mt-1">
            Comparison Tool
          </span>
        </div>
      </div>

      <div className="w-px h-6 bg-border mx-2" />

      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold text-foreground/50 uppercase tracking-wider">Filters</span>
        
        <FilterToggle 
          icon={<ArrowRightLeft className="w-4 h-4" />} 
          label="Structural Moves" 
          active={filters.structural} 
          onClick={() => toggle('structural')} 
          colorClass="data-[state=active]:bg-slate-light data-[state=active]:text-slate data-[state=active]:border-slate"
        />
        <FilterToggle 
          icon={<FileText className="w-4 h-4" />} 
          label="Semantic Rewrites" 
          active={filters.semantic} 
          onClick={() => toggle('semantic')} 
          colorClass="data-[state=active]:bg-ochre-light data-[state=active]:text-ochre data-[state=active]:border-ochre"
        />
        <FilterToggle 
          icon={<PlusSquare className="w-4 h-4" />} 
          label="Net-New / Deleted" 
          active={filters.netNew} 
          onClick={() => toggle('netNew')}
          colorClass="data-[state=active]:bg-sage-light data-[state=active]:text-sage data-[state=active]:border-sage"
        />
        <FilterToggle 
          icon={<Type className="w-4 h-4" />} 
          label="Word-Level" 
          active={filters.wordLevel} 
          onClick={() => toggle('wordLevel')} 
          colorClass="data-[state=active]:bg-foreground/10 data-[state=active]:text-foreground data-[state=active]:border-foreground/30"
        />
        <FilterToggle 
          icon={<Quote className="w-4 h-4" />} 
          label="Punctuation" 
          active={filters.punctuation} 
          onClick={() => toggle('punctuation')} 
          colorClass="data-[state=active]:bg-slate-blue-light data-[state=active]:text-slate-blue data-[state=active]:border-slate-blue"
        />
      </div>
    </div>
  );
}

function FilterToggle({ icon, label, active, onClick, colorClass }: any) {
  return (
    <button
      data-state={active ? "active" : "inactive"}
      onClick={onClick}
      className={`
        flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-transparent text-sm transition-all
        text-foreground/60 hover:bg-foreground/5 hover:text-foreground
        ${colorClass}
      `}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
