import React from 'react'
import HeroSection from '../components/HeroSection';
import CategoriesSection from '../components/CategoriesSection';
import FeaturedProducts from '../components/FeaturedProducts';
import FlashSale from '../components/FlashSale';
import NewProducts from '../components/NewProducts';
import Brands from '../components/Brands';
import TrustFeatures from '../components/TrustFeatures';

function HomePage() {
    return (
        <div className="min-h-screen flex flex-col ">
            <HeroSection />
            <CategoriesSection />
            <FeaturedProducts />
            <FlashSale />
            <NewProducts />
            <Brands />
            <TrustFeatures />
        </div>
    )
}

export default HomePage
