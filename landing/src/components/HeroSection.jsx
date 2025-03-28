import React from 'react';

const HeroSection = () => {
  return (
    <section className="relative h-[500px] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-accent/80 z-10" />
      <img
        src="/images/hero-banner.jpg"
        alt="Hero Banner"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="relative z-20 container mx-auto px-4 h-full flex items-center">
        <div className="max-w-2xl text-white">
          <h1 className="text-5xl font-bold mb-6">
            Khám phá xu hướng mới nhất
          </h1>
          <p className="text-xl mb-8">
            Giảm giá lên đến 50% cho tất cả sản phẩm mới.
            Nhanh tay săn deal hot nhất mùa này!
          </p>
          <button className="bg-white text-primary px-8 py-3 rounded-full text-lg font-semibold hover:bg-gray-100 transition-colors">
            Mua ngay
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection; 