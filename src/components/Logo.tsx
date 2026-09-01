export function Logo({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      <rect x="2" y="2" width="28" height="28" rx="6" fill="currentColor" />
      <path d="M19 9H23C24.1046 9 25 9.89543 25 11V21C25 22.1046 24.1046 23 23 23H19" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M13 9H9C7.89543 9 7 9.89543 7 11V21C7 22.1046 7.89543 23 9 23H13" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M11 16H21" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
