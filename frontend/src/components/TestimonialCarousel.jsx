import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';

const TestimonialCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const testimonials = [
    {
      id: 1,
      name: "Emily Rodriguez",
      role: "Small Business Owner",
      location: "Austin, TX",
      rating: 5,
      message: "ServiceHub completely transformed how I find reliable contractors for my business. The quality of providers and the ease of communication is outstanding!",
      avatar: "ER",
      service: "Business Consulting"
    },
    {
      id: 2,
      name: "Michael Thompson",
      role: "Homeowner",
      location: "Denver, CO",
      rating: 5,
      message: "I found the perfect web developer for my startup through ServiceHub. The platform made it so easy to compare providers and their reviews. Highly recommend!",
      avatar: "MT",
      service: "Web Development"
    },
    {
      id: 3,
      name: "Sarah Chen",
      role: "Marketing Director",
      location: "San Francisco, CA",
      rating: 5,
      message: "The best platform for finding professional services! I've hired multiple providers through ServiceHub and every experience has been excellent.",
      avatar: "SC",
      service: "Digital Marketing"
    },
    {
      id: 4,
      name: "David Wilson",
      role: "Restaurant Owner",
      location: "Miami, FL",
      rating: 5,
      message: "ServiceHub helped me find amazing graphic designers and social media experts for my restaurant. The review system gives me confidence in my choices.",
      avatar: "DW",
      service: "Graphic Design"
    },
    {
      id: 5,
      name: "Lisa Park",
      role: "Tech Startup Founder",
      location: "Seattle, WA",
      rating: 5,
      message: "As a busy entrepreneur, ServiceHub saves me so much time. I can quickly find vetted professionals for any project. The platform is intuitive and reliable.",
      avatar: "LP",
      service: "Mobile Development"
    },
    {
      id: 6,
      name: "James Anderson",
      role: "E-commerce Owner",
      location: "Chicago, IL",
      rating: 5,
      message: "The messaging system on ServiceHub makes communication with service providers seamless. I've built lasting relationships with several providers I found here.",
      avatar: "JA",
      service: "SEO Services"
    }
  ];

  // Auto-slide functionality
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying, testimonials.length]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    // Resume auto-play after 10 seconds
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToPrevious = () => {
    const newIndex = currentIndex === 0 ? testimonials.length - 1 : currentIndex - 1;
    goToSlide(newIndex);
  };

  const goToNext = () => {
    const newIndex = currentIndex === testimonials.length - 1 ? 0 : currentIndex + 1;
    goToSlide(newIndex);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Main testimonial display */}
      <div className="relative overflow-hidden">
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="w-full flex-shrink-0">
              <Card className="mx-4 border-0 shadow-lg bg-white">
                <CardContent className="p-8 text-center">
                  {/* Quote icon */}
                  <div className="flex justify-center mb-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Quote className="w-6 h-6 text-primary" />
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex justify-center mb-4">
                    {renderStars(testimonial.rating)}
                  </div>

                  {/* Message */}
                  <blockquote className="text-lg text-gray-700 mb-6 leading-relaxed italic">
                    "{testimonial.message}"
                  </blockquote>

                  {/* User info */}
                  <div className="flex items-center justify-center space-x-4">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                      {testimonial.avatar}
                    </div>
                    <div className="text-left">
                      <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                      <p className="text-xs text-gray-500">{testimonial.location}</p>
                    </div>
                  </div>

                  {/* Service badge */}
                  <div className="mt-4">
                    <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs rounded-full">
                      {testimonial.service}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors z-10"
        aria-label="Previous testimonial"
      >
        <ChevronLeft className="w-5 h-5 text-gray-600" />
      </button>

      <button
        onClick={goToNext}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors z-10"
        aria-label="Next testimonial"
      >
        <ChevronRight className="w-5 h-5 text-gray-600" />
      </button>

      {/* Dots indicator */}
      <div className="flex justify-center mt-6 space-x-2">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? 'bg-primary w-6'
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
            aria-label={`Go to testimonial ${index + 1}`}
          />
        ))}
      </div>

      {/* Auto-play indicator */}
      <div className="flex justify-center mt-4">
        <button
          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
        >
          {isAutoPlaying ? '⏸️ Pause' : '▶️ Play'} Auto-slide
        </button>
      </div>
    </div>
  );
};

export default TestimonialCarousel; 