export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-white">
      {/* SVG Texture Filter - The 'Brushed' effect */}
      <svg className="pointer-events-none fixed isolate z-50 h-full w-full opacity-[0.15] mix-blend-soft-light">
        <filter id="brushed-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#brushed-grain)" />
      </svg>

      {/* Premium Ambient Background (Vibrant Mesh) */}
      <div className="absolute top-[-10%] right-[-5%] w-[80%] h-[80%] rounded-full bg-emerald-400/25 blur-[120px] animate-pulse duration-[12s]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[70%] h-[70%] rounded-full bg-green-500/20 blur-[130px] animate-pulse duration-[10s] delay-1000" />
      <div className="absolute top-[25%] left-[5%] w-[60%] h-[60%] rounded-full bg-mint-200/40 blur-[100px]" />
      
      {/* Central Halo for the Login Card */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[500px] h-[500px] bg-emerald-500/10 blur-[100px] rounded-full" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1.5px,transparent_1.5px)] [background-size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_60%,transparent_100%)] opacity-[0.3]" />

      <div className="relative z-10 w-full flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
}
