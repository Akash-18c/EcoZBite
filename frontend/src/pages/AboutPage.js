import React from 'react';
import { Leaf, Users, Globe, Heart } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-white py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              About EcoZBite
            </h1>
            <p className="text-xl text-gray-600">
              We're on a mission to reduce food waste and create a sustainable future
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-gray-600 mb-4">
                EcoZBite connects consumers with local stores to reduce food waste by offering 
                discounted products that are approaching their expiry dates.
              </p>
              <p className="text-gray-600">
                Every year, millions of tons of food go to waste while people struggle with 
                rising grocery costs. We're changing that by creating a win-win solution.
              </p>
            </div>
            <div className="text-center">
              <div className="text-6xl mb-4">🌱</div>
              <h3 className="text-xl font-semibold text-green-600">Sustainable Future</h3>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-8 mb-16">
            {[
              { icon: <Leaf className="w-8 h-8" />, title: "Eco-Friendly", desc: "Reduce food waste" },
              { icon: <Users className="w-8 h-8" />, title: "Community", desc: "Connect people" },
              { icon: <Globe className="w-8 h-8" />, title: "Global Impact", desc: "Worldwide change" },
              { icon: <Heart className="w-8 h-8" />, title: "Care", desc: "For our planet" }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="text-green-600 mb-4 flex justify-center">{item.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;