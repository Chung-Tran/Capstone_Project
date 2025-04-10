// components/GlobalLoading.js
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';

const GlobalLoading = () => {
    const isLoading = useSelector((state) => state.loading.isLoading);

    // Prevent scrolling when loading overlay is active
    useEffect(() => {
        if (isLoading) {
            document.body.classList.add('overflow-hidden');
        } else {
            document.body.classList.remove('overflow-hidden');
        }

        return () => {
            document.body.classList.remove('overflow-hidden');
        };
    }, [isLoading]);

    if (!isLoading) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="flex flex-col items-center">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>

                <p className="mt-4 text-white font-medium">Đang tải...</p>
            </div>
        </div>
    );
};

export default GlobalLoading;