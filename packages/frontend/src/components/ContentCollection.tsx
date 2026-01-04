interface ContentItem {
    title: string;
    type: string;
    description: string;
    photo?: string;
}

interface ContentCollectionProps {
    title: string;
    items: ContentItem[];
}

export default function ContentCollection({ title, items }: ContentCollectionProps) {
    if (!items || items.length === 0) return null;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h2>

            <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0">
                {items.map((item, i) => (
                    <div
                        key={i}
                        className="flex-none w-[280px] md:w-[320px] snap-center bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-shadow"
                    >
                        {/* Image */}
                        <div className="h-48 overflow-hidden bg-gray-100 relative">
                            {item.photo ? (
                                <img
                                    src={item.photo}
                                    alt={item.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-gray-300 bg-gray-50">
                                    <span className="text-sm font-medium uppercase tracking-wider">No Photo</span>
                                </div>
                            )}
                            <div className="absolute top-2 right-2 px-2 py-1 bg-white/90 backdrop-blur-sm rounded text-[10px] uppercase font-bold text-gray-500">
                                {item.type}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-4">
                            <h3 className="text-lg font-bold text-gray-900 mb-1 leading-tight">{item.title}</h3>
                            <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                                {item.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
