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
            <div className="relative p-8 md:p-16 text-white max-w-7xl mx-auto z-10 w-full">
                <div className="animate-fade-in-up">
                    <span className="inline-block px-3 py-1 mb-4 text-xs font-bold tracking-widest uppercase bg-white/20 backdrop-blur-md rounded-full border border-white/30">
                        The {safeContent.bestTimeVisit ? 'Perfect' : 'Ultimate'} Guide
                    </span>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 shadow-sm leading-[1.1]">
                        {title}
                    </h1>
                    <p className="text-lg md:text-xl font-light opacity-90 max-w-3xl leading-relaxed text-shadow-sm mb-8">
                        {safeContent.description}
                    </p>

                    {/* Quick Stats Grid */}
                    <div className="flex flex-wrap gap-x-12 gap-y-6 pt-8 border-t border-white/20">
                        {safeContent.bestTimeVisit && (
                            <div>
                                <h4 className="text-xs font-bold uppercase opacity-70 mb-1 tracking-wider">Best Time</h4>
                                <p className="font-medium text-lg">{safeContent.bestTimeVisit}</p>
                            </div>
                        )}
                        {safeContent.location?.alt !== undefined && (
                            <div>
                                <h4 className="text-xs font-bold uppercase opacity-70 mb-1 tracking-wider">Elevation</h4>
                                <p className="font-medium text-lg">{safeContent.location.alt}m</p>
                            </div>
                        )}
                        {/* Currency Placeholder */}
                        <div>
                            <h4 className="text-xs font-bold uppercase opacity-70 mb-1 tracking-wider">Currency</h4>
                            <p className="font-medium text-lg">Local / USD</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
