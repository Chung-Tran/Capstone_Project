import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Custom carousel/slider component
const CarouselList = ({ title, icon, children, viewAll }) => {
    const [scrollPosition, setScrollPosition] = useState(0);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(true);

    const scrollContainerRef = React.useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            if (scrollContainerRef.current) {
                const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
                setScrollPosition(scrollLeft);
                setShowLeftArrow(scrollLeft > 0);
                setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
            }
        };

        const scrollContainer = scrollContainerRef.current;
        if (scrollContainer) {
            scrollContainer.addEventListener('scroll', handleScroll);
            handleScroll(); // Check initial state

            return () => scrollContainer.removeEventListener('scroll', handleScroll);
        }
    }, []);

    const scroll = (direction) => {
        if (scrollContainerRef.current) {
            const { clientWidth } = scrollContainerRef.current;
            const scrollAmount = direction === 'left' ? -clientWidth / 2 : clientWidth / 2;
            scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                        {icon}
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                </div>
                {viewAll && (
                    <a href={viewAll} className="text-blue-600 hover:underline flex items-center text-sm font-medium">
                        Xem tất cả <ChevronRight size={16} />
                    </a>
                )}
            </div>

            <div className="relative">
                {showLeftArrow && (
                    <button
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow-md p-2 hover:bg-gray-100 transition-colors"
                        onClick={() => scroll('left')}
                    >
                        <ChevronLeft size={20} />
                    </button>
                )}

                <div
                    ref={scrollContainerRef}
                    className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 relative scroll-smooth"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {children}
                </div>

                {showRightArrow && (
                    <button
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow-md p-2 hover:bg-gray-100 transition-colors"
                        onClick={() => scroll('right')}
                    >
                        <ChevronRight size={20} />
                    </button>
                )}
            </div>
        </div>
    );
};

export default CarouselList;