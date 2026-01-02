
import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import clsx from 'clsx';

const categoryColors: Record<string, string> = {
    Destination: 'border-blue-500 bg-blue-50',
    Activity: 'border-green-500 bg-green-50',
    Accommodation: 'border-amber-500 bg-amber-50',
    Food: 'border-red-500 bg-red-50',
    Transportation: 'border-purple-500 bg-purple-50',
    Culture: 'border-teal-500 bg-teal-50',
};

const CustomNode = ({ data, selected }: NodeProps) => {
    const { title, category, type, label, description } = data;
    const colorClass = categoryColors[category] || 'border-gray-500 bg-gray-50';
    const isDiscovery = type === 'discovery';

    return (
        <div
            className={clsx(
                'w-64 rounded-xl border-2 px-4 py-3 shadow-lg transition-all duration-300 hover:shadow-xl',
                colorClass,
                selected && 'ring-2 ring-offset-2 ring-indigo-500 scale-105',
                isDiscovery && 'border-dashed'
            )}
        >
            <Handle type="target" position={Position.Top} className="!bg-gray-400" />

            <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider opacity-70">
                        {category}
                    </span>
                    {isDiscovery && <span className="text-lg">✨</span>}
                </div>

                <h3 className="text-lg font-bold leading-tight text-gray-900">
                    {title || label}
                </h3>

                {description && (
                    <p className="mt-2 text-xs text-gray-600 line-clamp-3">
                        {description}
                    </p>
                )}
            </div>

            <Handle type="source" position={Position.Bottom} className="!bg-gray-400" />
        </div>
    );
};

export default memo(CustomNode);
