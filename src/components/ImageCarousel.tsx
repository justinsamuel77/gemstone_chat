import React, { useState, useEffect } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';

const carouselData = [
  {
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop",
    title: "Connect with Your Community",
    subtitle: "Join thousands of like-minded individuals and start meaningful conversations."
  },
  {
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&h=600&fit=crop",
    title: "Discover New Opportunities",
    subtitle: "Unlock exclusive content and features tailored just for you."
  },
  {
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop",
    title: "Build Something Amazing",
    subtitle: "Get the tools and support you need to achieve your goals."
  }
];

export function ImageCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === carouselData.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Background Images */}
      {carouselData.map((item, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <ImageWithFallback
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
      ))}
      
      {/* Content Overlay */}
      <div className="relative z-10 text-center px-8 max-w-lg">
        <div className="space-y-6">
          {carouselData.map((item, index) => (
            <div
              key={index}
              className={`transition-all duration-1000 ${
                index === currentIndex 
                  ? 'opacity-100 transform translate-y-0' 
                  : 'opacity-0 transform translate-y-4'
              }`}
            >
              {index === currentIndex && (
                <>
                  <h1 className="text-white mb-4">{item.title}</h1>
                  <p className="text-white/90 text-lg">{item.subtitle}</p>
                </>
              )}
            </div>
          ))}
        </div>
        
        {/* Progress Dots */}
        <div className="flex justify-center space-x-2 mt-8">
          {carouselData.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-white scale-125' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}