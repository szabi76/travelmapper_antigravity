import React, { useState, useEffect } from 'react';

export default function LoginModal() {
    const [token, setToken] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const existingToken = localStorage.getItem('api_token');
        if (!existingToken) {
            setIsOpen(true);
        }
    }, []);

    const handleSave = () => {
        if (token.trim()) {
            localStorage.setItem('api_token', token.trim());
            setIsOpen(false);
            window.location.reload(); // Reload to retry failed requests
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">🔐 Access Required</h2>
                <p className="text-gray-600 mb-6 text-center text-sm">
                    Please enter your <strong>API Secret Token</strong> to continue.
                </p>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Secret Token</label>
                        <input
                            type="password"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            placeholder="s3cr3t-..."
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                        />
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={!token}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Unlock Application
                    </button>
                </div>
            </div>
        </div>
    );
}
