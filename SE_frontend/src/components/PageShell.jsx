import TopNav from "./TopNav";

export default function PageShell({ children, className = "", hideTopNav = false }) {
  return (
    <div className={`min-h-screen bg-sand-50 ${className}`}>
      {!hideTopNav && <TopNav />}
      {children}
    </div>
  );
}
