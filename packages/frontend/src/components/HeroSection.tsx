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
        <div className="relative h-[70vh] w-full overflow-hidden">
            {/* Background Image with Parallax-like feel */}
            <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
                style={{ backgroundImage: `url(${bgImage})` }}
            >
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80" />
            </div>

            {/* Content Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 text-white max-w-5xl mx-auto">
                <div className="animate-fade-in-up">
                    <span className="inline-block px-3 py-1 mb-4 text-xs font-bold tracking-widest uppercase bg-white/20 backdrop-blur-md rounded-full border border-white/30">
                        The {safeContent.bestTimeVisit ? 'Perfect' : 'Ultimate'} Guide
                    </span>
                    <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-4 shadow-sm">
                        {title}
                    </h1>
                    <p className="text-lg md:text-2xl font-light opacity-90 max-w-2xl leading-relaxed text-shadow-sm">
                        {safeContent.description}
                    </p>

                    {/* Quick Stats Grid */}
                    <div className="flex flex-wrap gap-6 mt-8 pt-8 border-t border-white/20">
                        {safeContent.bestTimeVisit && (
                            <div>
                                <h4 className="text-xs font-bold uppercase opacity-70 mb-1">Best Time</h4>
                                <p className="font-medium">{safeContent.bestTimeVisit}</p>
                            </div>
                        )}
                        {safeContent.location?.alt !== undefined && (
                            <div>
                                <h4 className="text-xs font-bold uppercase opacity-70 mb-1">Elevation</h4>
                                <p className="font-medium">{safeContent.location.alt}m</p>
                            </div>
                        )}
                        {/* Currency Placeholder */}
                        <div>
                            <h4 className="text-xs font-bold uppercase opacity-70 mb-1">Currency</h4>
                            <p className="font-medium">Local / USD</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
