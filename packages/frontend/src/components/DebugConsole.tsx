import { useState } from 'react';
import { useLogStore } from '../lib/store';
import clsx from 'clsx';

export default function DebugConsole() {
    const [open, setOpen] = useState(false);
    const { logs, clearLogs } = useLogStore();

    if (!open) {
        return (
            <button
                onClick={() => setOpen(true)}
                className="fixed bottom-4 right-4 bg-gray-900/80 hover:bg-black text-white px-3 py-2 rounded-lg text-xs font-mono shadow-lg border border-gray-700 z-50 backdrop-blur-sm transition-all"
            >
                Console ({logs.length})
            </button>
        );
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 h-64 bg-gray-900/95 text-gray-200 font-mono text-xs z-50 border-t border-gray-700 shadow-2xl flex flex-col transition-all">
            <div className="flex items-center justify-between p-2 bg-gray-800 border-b border-gray-700">
                <div className="flex items-center space-x-2">
                    <span className="font-bold text-gray-400">DEBUG CONSOLE</span>
                    <span className="text-gray-500">• {logs.length} messages</span>
                </div>
                <div className="flex items-center space-x-2">
                    <button onClick={clearLogs} className="hover:text-white px-2 py-1 rounded">Clear</button>
                    <button onClick={() => setOpen(false)} className="hover:text-white px-2 py-1 rounded">Min</button>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-1">
                {logs.length === 0 && <div className="text-gray-600 italic">System ready. No logs.</div>}
                {logs.map(log => (
                    <div key={log.id} className="flex gap-2">
                        <span className="text-gray-500 shrink-0">
                            {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                        <span className={clsx(
                            "break-words",
                            log.type === 'error' && "text-red-400 font-bold",
                            log.type === 'success' && "text-green-400",
                            log.type === 'info' && "text-blue-300"
                        )}>
                            [{log.type.toUpperCase()}] {log.message}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
