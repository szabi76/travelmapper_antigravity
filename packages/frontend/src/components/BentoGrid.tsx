interface BentoGridProps {
    sections: any[] | undefined;
}

export default function BentoGrid({ sections }: BentoGridProps) {
    if (!sections || sections.length === 0) return null;

    // Helper to get a highlight from a specific section
    const getHighlight = (sectionId: string) => {
        const section = sections.find((s: any) => s.id === sectionId);
        return section?.items?.[0]; // Pick the first item
    };

    const topSight = getHighlight('highlights');
    const topDish = getHighlight('food');
    const topStay = getHighlight('stays');

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[200px]">
            {/* Main Feature (Large) */}
            <div className="md:col-span-2 md:row-span-2 relative rounded-2xl overflow-hidden group">
                {topSight?.photo ? (
                    <img src={topSight.photo} alt={topSight.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                ) : (
                    <div className="w-full h-full bg-indigo-50 flex items-center justify-center text-indigo-300">Don't Miss</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6">
                    <span className="text-xs font-bold uppercase text-indigo-300 mb-1">Don't Miss</span>
                    <h3 className="text-2xl font-bold text-white">{topSight?.title || 'Loading...'}</h3>
                    <p className="text-sm text-gray-200 line-clamp-2 opacity-90">{topSight?.description}</p>
                </div>
            </div>

            {/* Secondary Feature (Food) */}
            <div className="relative rounded-2xl overflow-hidden group">
                {topDish?.photo ? (
                    <img src={topDish.photo} alt={topDish.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                ) : (
                    <div className="w-full h-full bg-orange-50 flex items-center justify-center text-orange-300">Local Flavor</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6">
                    <span className="text-xs font-bold uppercase text-orange-300 mb-1">Local Flavor</span>
                    <h3 className="text-lg font-bold text-white">{topDish?.title || 'Loading...'}</h3>
                </div>
            </div>

            {/* Tertiary Feature (Stay/Tip) */}
            <div className="relative rounded-2xl overflow-hidden group bg-gray-900 border border-gray-800">
                <div className="absolute inset-0 flex flex-col justify-center p-6 text-center">
                    <span className="text-xs font-bold uppercase text-emerald-400 mb-2">Insider Tip</span>
                    <p className="text-white font-medium italic">"{topStay?.description || 'Explore the local neighborhoods...'}"</p>
                    <div className="mt-4 text-xs text-gray-400 font-bold uppercase tracking-widest">{topStay?.title}</div>
                </div>
            </div>
        </div>
    );
}
