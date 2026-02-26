export function PawIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Main pad */}
      <ellipse cx="12" cy="16" rx="4.5" ry="5" />
      {/* Top left toe */}
      <ellipse cx="7" cy="9" rx="2" ry="3" />
      {/* Top center-left toe */}
      <ellipse cx="10" cy="6" rx="2" ry="3" />
      {/* Top center-right toe */}
      <ellipse cx="14" cy="6" rx="2" ry="3" />
      {/* Top right toe */}
      <ellipse cx="17" cy="9" rx="2" ry="3" />
    </svg>
  );
}
