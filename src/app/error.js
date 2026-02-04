'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-rose-50 p-4">
            <div className="bg-white p-8 rounded-xl shadow-2xl border border-red-200 max-w-lg text-center">
                <h2 className="text-2xl font-serif text-red-900 mb-4">Cosmic Alignment Error</h2>
                <p className="text-gray-700 mb-6">
                    Something went wrong while calculating the celestial positions.
                    <br />
                    <span className="text-sm font-mono text-red-500 mt-2 block bg-red-50 p-2 rounded">
                        {error.message || "Unknown Error"}
                    </span>
                </p>
                <button
                    onClick={() => reset()}
                    className="bg-red-800 text-white px-6 py-2 rounded-lg hover:bg-red-900 transition-colors font-bold"
                >
                    Try Again
                </button>
            </div>
        </div>
    );
}
