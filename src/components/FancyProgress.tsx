import React from 'react';

export default function FancyProgress({ value, busy }: { value: number; busy?: boolean }) {
const pct = Math.max(0, Math.min(100, Math.round(value)));
return (
<div className="relative h-2 w-full overflow-hidden rounded-full bg-zinc-800">
<div
className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-400 transition-[width] duration-200"
style={{ width: `${pct}%` }}
/>
{busy && (
<div
className="pointer-events-none absolute inset-0 animate-[barberpole_1s_linear_infinite] bg-[length:1.25rem_1.25rem]"
style={{ backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.12) 0 10px, transparent 10px 20px)' }}
/>
)}
<style jsx>{`
@keyframes barberpole { from{background-position:0 0} to{background-position:2rem 0} }
`}</style>
</div>
);
}


