import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;
const base = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export function GridIcon(props: IconProps) {
  return <svg {...base} {...props}><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/></svg>;
}
export function PortfolioIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="M12 3v18M4 8l8-5 8 5M5 10h14M6 10v7M10 10v7M14 10v7M18 10v7M4 21h16"/></svg>;
}
export function ActivityIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="M3 12h4l2.2-6 4.1 13 2.3-7H21"/></svg>;
}
export function TransferIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="M7 7h12l-3-3M19 17H7l3 3M19 7l-3 3M7 17l3-3"/></svg>;
}
export function ShieldIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="M12 3 5 6v5c0 4.8 2.8 8 7 10 4.2-2 7-5.2 7-10V6l-7-3Z"/><path d="m9 12 2 2 4-4"/></svg>;
}
export function ArrowBackIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="M19 12H5M11 18l-6-6 6-6"/></svg>;
}
