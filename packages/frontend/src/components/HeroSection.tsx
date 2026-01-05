import type { Node } from '@travelmapper/shared';

interface HeroSectionProps {
    node: Node;
}

export default function HeroSection({ node }: HeroSectionProps) {
    const { title, content } = node;
    const safeContent = typeof content === 'string' ? { description: content } : (content || {});

    // Use first photo or proper placeholder
    const bgImage = safeContent.photos?.[0] || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop';

    return (
        <div className="relative min-h-[75vh] w-full flex flex-col justify-end">
            {/* Background Image with Parallax-like feel */}
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${bgImage})` }}
            >
                {/* Stronger gradient for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
            </div>

            {/* Content Overlay */}
            <div className="relative p-8 md:p-12 lg:px-20 text-white w-full flex flex-col lg:flex-row items-end gap-12 lg:gap-24 z-10">

                {/* LEFT COLUMN: Text Content (Grow) */}
                <div className="flex-1 animate-fade-in-up w-full">
                    <span className="inline-block px-3 py-1 mb-4 text-xs font-bold tracking-widest uppercase bg-white/20 backdrop-blur-md rounded-full border border-white/30">
                        The {safeContent.bestTimeVisit ? 'Perfect' : 'Ultimate'} Guide
                    </span>
                    <h1 className="text-5xl md:text-7xl xl:text-8xl font-black tracking-tight mb-6 shadow-sm leading-[1.05]">
                        {title}
                    </h1>
                    <p className="text-lg md:text-xl font-light opacity-90 leading-relaxed text-shadow-sm mb-0 max-w-4xl">
                        {safeContent.description}
                    </p>
                </div>

                {/* RIGHT COLUMN: Quick Facts Card (Fixed width) */}
                <div className="w-full md:w-[360px] bg-black/20 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl animate-fade-in-up delay-100 flex-shrink-0">
                    <h3 className="text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2 border-b border-white/20 pb-4 text-white/80">
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        Travel Guide Facts
                    </h3>

                    <div className="space-y-5">
                        <div className="flex justify-between items-start gap-4">
                            <span className="text-[10px] font-bold uppercase opacity-60 tracking-wider pt-1">Best Time</span>
                            <span className="font-medium text-right text-sm flex-1 leading-snug">{safeContent.quickFacts?.bestTime || safeContent.bestTimeVisit || 'Year-round'}</span>
                        </div>
                        <div className="flex justify-between items-center gap-4">
                            <span className="text-[10px] font-bold uppercase opacity-60 tracking-wider">Currency</span>
                            <span className="font-medium text-right text-sm flex-1">{safeContent.quickFacts?.currency || 'Local'}</span>
                        </div>
                        <div className="flex justify-between items-center gap-4">
                            <span className="text-[10px] font-bold uppercase opacity-60 tracking-wider">Language</span>
                            <span className="font-medium text-right text-sm flex-1">{safeContent.quickFacts?.language || 'Local'}</span>
                        </div>
                        <div className="flex justify-between items-center gap-4">
                            <span className="text-[10px] font-bold uppercase opacity-60 tracking-wider">Safety</span>
                            <div className="flex-1 flex justify-end">
                                <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/30 text-emerald-100 text-[10px] font-bold uppercase tracking-wider">
                                    {safeContent.quickFacts?.safety || 'Standard'}
                                </span>
                            </div>
                        </div>
                        <div className="flex justify-between items-center gap-4">
                            <span className="text-[10px] font-bold uppercase opacity-60 tracking-wider">Tipping</span>
                            <span className="font-medium text-right text-sm flex-1">{safeContent.quickFacts?.tipping || 'Optional'}</span>
                        </div>
                        {/* Elevation Fallback */}
                        {safeContent.location?.alt !== undefined && (
                            <div className="flex justify-between items-center border-t border-white/10 pt-4 mt-2 gap-4">
                                <span className="text-[10px] font-bold uppercase opacity-60 tracking-wider">Elevation</span>
                                <span className="font-medium text-right text-sm flex-1">{safeContent.location.alt}m</span>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
