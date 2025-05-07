import React from 'react';

const HeroSection = () => {
  return (
    <section className="relative h-[500px] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-accent/80 z-10" />
      <img
        src="/banner1.jpeg"
        alt="Hero Banner"
        className="absolute inset-0 w-full h-full object-cover"
      />
    </section>
  );
};

export default HeroSection; 