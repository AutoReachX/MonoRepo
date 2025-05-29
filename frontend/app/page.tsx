'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import Logo from '@/components/ui/Logo';
import { NAVIGATION_ITEMS } from '@/lib/constants';

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const testimonials = [
    {
      text: "AutoReach helped me grow from 500 to 10K followers in just 3 months. The AI content is incredible!",
      author: "Sarah Chen",
      role: "Tech Entrepreneur",
      avatar: "👩‍💼"
    },
    {
      text: "Finally, a Twitter tool that actually works. The token system is so much better than monthly fees.",
      author: "Marcus Rodriguez",
      role: "Digital Marketer",
      avatar: "👨‍💻"
    },
    {
      text: "The automated engagement features saved me 10+ hours per week. ROI was immediate.",
      author: "Emily Watson",
      role: "Content Creator",
      avatar: "👩‍🎨"
    }
  ];

  const features = [
    {
      icon: "🤖",
      title: "AI-Powered Content",
      description: "Generate viral tweets that match your voice and engage your audience",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: "⚡",
      title: "Smart Automation",
      description: "Schedule, engage, and grow your audience while you sleep",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: "📊",
      title: "Growth Analytics",
      description: "Track what works and optimize your strategy with detailed insights",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: "🎯",
      title: "Targeted Engagement",
      description: "Find and connect with your ideal audience automatically",
      gradient: "from-orange-500 to-red-500"
    },
    {
      icon: "💎",
      title: "Token Economy",
      description: "Pay only for what you use - no wasteful monthly subscriptions",
      gradient: "from-indigo-500 to-purple-500"
    },
    {
      icon: "🚀",
      title: "Viral Optimization",
      description: "AI analyzes trending patterns to maximize your reach",
      gradient: "from-pink-500 to-rose-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-2000"></div>
      </div>

      {/* Custom Dark Header */}
      <header className="relative z-50 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Logo */}
            <div className="flex items-center">
              <div className="text-white font-bold text-xl sm:text-2xl">
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  AutoReach
                </span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
              {NAVIGATION_ITEMS.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:transform hover:scale-105 ${
                    item.name === 'Test API'
                      ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30 border border-green-500/30'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-base">
                      {item.name === 'Dashboard' && '📊'}
                      {item.name === 'Content' && '✍️'}
                      {item.name === 'Analytics' && '📈'}
                      {item.name === 'Settings' && '⚙️'}
                      {item.name === 'Auth' && '🔐'}
                      {item.name === 'Test API' && '🧪'}
                    </span>
                    <span className="hidden lg:inline">{item.name}</span>
                  </span>
                </Link>
              ))}

              {/* Login Button */}
              <Link
                href="/login"
                className="ml-4 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg text-sm font-medium transition-all duration-300 hover:transform hover:scale-105"
              >
                Sign In
              </Link>
            </nav>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500"
              aria-label="Toggle mobile menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden absolute top-16 sm:top-20 left-0 right-0 bg-slate-900/95 backdrop-blur-lg border border-white/10 rounded-2xl mx-4 shadow-2xl">
              <nav className="px-4 py-4 space-y-2">
                {NAVIGATION_ITEMS.map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 ${
                      item.name === 'Test API'
                        ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30 border border-green-500/30'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-lg">
                        {item.name === 'Dashboard' && '📊'}
                        {item.name === 'Content' && '✍️'}
                        {item.name === 'Analytics' && '📈'}
                        {item.name === 'Settings' && '⚙️'}
                        {item.name === 'Auth' && '🔐'}
                        {item.name === 'Test API' && '🧪'}
                      </span>
                      {item.name}
                    </span>
                  </Link>
                ))}

                {/* Mobile Login Button */}
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-center"
                >
                  <span className="flex items-center justify-center gap-3">
                    <span className="text-lg">🔐</span>
                    Sign In
                  </span>
                </Link>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>

            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 backdrop-blur-sm mb-8">
              <span className="text-sm font-medium text-purple-200">🎉 Join 10,000+ creators growing with AutoReach</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent leading-tight px-4 sm:px-0">
              <span className="block sm:inline">Build Your Twitter</span>
              <br className="hidden sm:block" />
              <span className="block sm:inline mt-2 sm:mt-0">
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Empire
                </span>{' '}
                with AI
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 mb-6 sm:mb-8 max-w-4xl mx-auto leading-relaxed px-4 sm:px-0">
              Stop wasting time on content that doesn't convert. Our AI creates viral tweets,
              automates engagement, and grows your audience while you focus on what matters.
            </p>

            {/* Value Props */}
            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-6 mb-8 sm:mb-12 text-xs sm:text-sm px-4 sm:px-0">
              <div className="flex items-center justify-center gap-2 text-green-400">
                <span className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></span>
                <span>No monthly fees - Pay per use</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-blue-400">
                <span className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></span>
                <span>AI that learns your voice</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-purple-400">
                <span className="w-2 h-2 bg-purple-400 rounded-full flex-shrink-0"></span>
                <span>10x faster growth</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-12">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105"
              >
                <Link href="/login" className="flex items-center gap-2">
                  🚀 Start Growing Now
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-purple-400/50 text-purple-200 hover:bg-purple-500/10 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-xl backdrop-blur-sm transition-all duration-300"
              >
                <span className="flex items-center gap-2">
                  ▶️ Watch Demo
                </span>
              </Button>
            </div>



            {/* Social Proof */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 max-w-2xl mx-auto border border-white/10">
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="flex -space-x-2">
                  {['👨‍💼', '👩‍💻', '👨‍🎨', '👩‍🔬', '👨‍💻'].map((avatar, i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white border-2 border-slate-900">
                      {avatar}
                    </div>
                  ))}
                </div>
                <div className="text-left">
                  <div className="text-yellow-400 text-sm">⭐⭐⭐⭐⭐</div>
                  <div className="text-gray-300 text-sm">4.9/5 from 2,847 users</div>
                </div>
              </div>

              {/* Rotating testimonials */}
              <div className="relative h-20 overflow-hidden">
                {testimonials.map((testimonial, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-all duration-500 ${
                      index === currentTestimonial
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-0 translate-y-4'
                    }`}
                  >
                    <p className="text-gray-300 italic mb-2">"{testimonial.text}"</p>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-lg">{testimonial.avatar}</span>
                      <div className="text-sm">
                        <div className="text-white font-medium">{testimonial.author}</div>
                        <div className="text-gray-400">{testimonial.role}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent px-4 sm:px-0">
              <span className="block sm:inline">Everything You Need to</span>
              <span className="block sm:inline bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"> Dominate Twitter</span>
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-400 max-w-3xl mx-auto px-4 sm:px-0">
              Stop using 5 different tools. AutoReach is the only Twitter growth platform you'll ever need.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group relative bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-500 hover:transform hover:scale-105 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-4 group-hover:text-purple-300 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                  {feature.description}
                </p>

                {/* Hover effect overlay */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
              </div>
            ))}
          </div>
        </div>

        {/* Token Pricing Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center px-3 sm:px-4 py-2 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 backdrop-blur-sm mb-6 sm:mb-8">
              <span className="text-xs sm:text-sm font-medium text-green-200">💎 Revolutionary Token-Based Pricing</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent px-4 sm:px-0">
              <span className="block sm:inline">Pay for Results,</span>
              <span className="block sm:inline bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent"> Not Time</span>
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-400 max-w-3xl mx-auto mb-8 sm:mb-12 px-4 sm:px-0">
              No more wasted monthly fees. Buy tokens, use them when you need them.
              Scale up or down based on your actual usage.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
            {/* Starter Pack */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/10 hover:border-purple-500/50 transition-all duration-300">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">🌱</div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Starter Pack</h3>
                <div className="text-3xl sm:text-4xl font-bold text-purple-400 mb-2">$29</div>
                <div className="text-sm sm:text-base text-gray-400 mb-4 sm:mb-6">1,000 tokens</div>
                <div className="space-y-2 sm:space-y-3 text-left mb-6 sm:mb-8">
                  <div className="flex items-center gap-2 sm:gap-3 text-gray-300 text-sm sm:text-base">
                    <span className="text-green-400 flex-shrink-0">✓</span>
                    <span>~100 AI-generated tweets</span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 text-gray-300 text-sm sm:text-base">
                    <span className="text-green-400 flex-shrink-0">✓</span>
                    <span>Smart scheduling</span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 text-gray-300 text-sm sm:text-base">
                    <span className="text-green-400 flex-shrink-0">✓</span>
                    <span>Basic analytics</span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 text-gray-300 text-sm sm:text-base">
                    <span className="text-green-400 flex-shrink-0">✓</span>
                    <span>Auto-engagement</span>
                  </div>
                </div>
                <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl py-2 sm:py-3 text-sm sm:text-base">
                  Get Started
                </Button>
              </div>
            </div>

            {/* Growth Pack - Popular */}
            <div className="bg-gradient-to-b from-purple-500/10 to-pink-500/10 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border-2 border-purple-500/50 relative hover:border-purple-400 transition-all duration-300 md:transform md:scale-105">
              <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-bold">
                  🔥 MOST POPULAR
                </div>
              </div>
              <div className="text-center pt-4 sm:pt-0">
                <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">🚀</div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Growth Pack</h3>
                <div className="text-3xl sm:text-4xl font-bold text-purple-400 mb-2">$79</div>
                <div className="text-sm sm:text-base text-gray-400 mb-4 sm:mb-6">3,000 tokens</div>
                <div className="space-y-2 sm:space-y-3 text-left mb-6 sm:mb-8">
                  <div className="flex items-center gap-2 sm:gap-3 text-gray-300 text-sm sm:text-base">
                    <span className="text-green-400 flex-shrink-0">✓</span>
                    <span>~300 AI-generated tweets</span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 text-gray-300 text-sm sm:text-base">
                    <span className="text-green-400 flex-shrink-0">✓</span>
                    <span>Advanced scheduling</span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 text-gray-300 text-sm sm:text-base">
                    <span className="text-green-400 flex-shrink-0">✓</span>
                    <span>Detailed analytics</span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 text-gray-300 text-sm sm:text-base">
                    <span className="text-green-400 flex-shrink-0">✓</span>
                    <span>Smart auto-engagement</span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 text-gray-300 text-sm sm:text-base">
                    <span className="text-green-400 flex-shrink-0">✓</span>
                    <span>Viral optimization</span>
                  </div>
                </div>
                <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl py-2 sm:py-3 text-sm sm:text-base">
                  Start Growing
                </Button>
              </div>
            </div>

            {/* Pro Pack */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/10 hover:border-yellow-500/50 transition-all duration-300">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">👑</div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Pro Pack</h3>
                <div className="text-3xl sm:text-4xl font-bold text-yellow-400 mb-2">$199</div>
                <div className="text-sm sm:text-base text-gray-400 mb-4 sm:mb-6">10,000 tokens</div>
                <div className="space-y-2 sm:space-y-3 text-left mb-6 sm:mb-8">
                  <div className="flex items-center gap-2 sm:gap-3 text-gray-300 text-sm sm:text-base">
                    <span className="text-green-400 flex-shrink-0">✓</span>
                    <span>~1,000 AI-generated tweets</span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 text-gray-300 text-sm sm:text-base">
                    <span className="text-green-400 flex-shrink-0">✓</span>
                    <span>Everything in Growth</span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 text-gray-300 text-sm sm:text-base">
                    <span className="text-green-400 flex-shrink-0">✓</span>
                    <span>Priority support</span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 text-gray-300 text-sm sm:text-base">
                    <span className="text-green-400 flex-shrink-0">✓</span>
                    <span>Custom AI training</span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 text-gray-300 text-sm sm:text-base">
                    <span className="text-green-400 flex-shrink-0">✓</span>
                    <span>Advanced targeting</span>
                  </div>
                </div>
                <Button className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white rounded-xl py-2 sm:py-3 text-sm sm:text-base">
                  Go Pro
                </Button>
              </div>
            </div>
          </div>

          {/* Token Benefits */}
          <div className="mt-12 sm:mt-16 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl p-6 sm:p-8 border border-green-500/20">
            <div className="text-center mb-6 sm:mb-8">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-2 sm:mb-4 px-4 sm:px-0">Why Tokens Beat Monthly Subscriptions</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl mb-3 sm:mb-4">💰</div>
                <h4 className="text-base sm:text-lg font-semibold text-white mb-2">Pay Only for Usage</h4>
                <p className="text-sm sm:text-base text-gray-400">No wasted money on unused features. Tokens never expire.</p>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl mb-3 sm:mb-4">📈</div>
                <h4 className="text-base sm:text-lg font-semibold text-white mb-2">Scale Flexibly</h4>
                <p className="text-sm sm:text-base text-gray-400">Ramp up during campaigns, scale down during breaks.</p>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl mb-3 sm:mb-4">🎯</div>
                <h4 className="text-base sm:text-lg font-semibold text-white mb-2">Better ROI</h4>
                <p className="text-sm sm:text-base text-gray-400">Invest in growth when you need it, not on a schedule.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Comparison Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent px-4 sm:px-0">
              <span className="block sm:inline">Why Choose AutoReach Over</span>
              <span className="block sm:inline bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent"> The Competition?</span>
            </h2>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8 border border-white/10">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 sm:py-4 px-3 sm:px-6 text-white font-semibold text-sm sm:text-base">Feature</th>
                    <th className="text-center py-3 sm:py-4 px-2 sm:px-6 text-purple-400 font-bold text-sm sm:text-base">AutoReach</th>
                    <th className="text-center py-3 sm:py-4 px-2 sm:px-6 text-gray-400 text-sm sm:text-base">TweetHunter</th>
                    <th className="text-center py-3 sm:py-4 px-2 sm:px-6 text-gray-400 text-sm sm:text-base">Buffer</th>
                    <th className="text-center py-3 sm:py-4 px-2 sm:px-6 text-gray-400 text-sm sm:text-base">Hootsuite</th>
                  </tr>
                </thead>
                <tbody className="text-xs sm:text-sm">
                  <tr className="border-b border-white/5">
                    <td className="py-3 sm:py-4 px-3 sm:px-6 text-gray-300">Token-based pricing</td>
                    <td className="py-3 sm:py-4 px-2 sm:px-6 text-center text-green-400">✓</td>
                    <td className="py-3 sm:py-4 px-2 sm:px-6 text-center text-red-400">✗</td>
                    <td className="py-3 sm:py-4 px-2 sm:px-6 text-center text-red-400">✗</td>
                    <td className="py-3 sm:py-4 px-2 sm:px-6 text-center text-red-400">✗</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-3 sm:py-4 px-3 sm:px-6 text-gray-300">AI content generation</td>
                    <td className="py-3 sm:py-4 px-2 sm:px-6 text-center text-green-400">✓</td>
                    <td className="py-3 sm:py-4 px-2 sm:px-6 text-center text-green-400">✓</td>
                    <td className="py-3 sm:py-4 px-2 sm:px-6 text-center text-red-400">✗</td>
                    <td className="py-3 sm:py-4 px-2 sm:px-6 text-center text-red-400">✗</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-3 sm:py-4 px-3 sm:px-6 text-gray-300">Smart auto-engagement</td>
                    <td className="py-3 sm:py-4 px-2 sm:px-6 text-center text-green-400">✓</td>
                    <td className="py-3 sm:py-4 px-2 sm:px-6 text-center text-yellow-400">Limited</td>
                    <td className="py-3 sm:py-4 px-2 sm:px-6 text-center text-red-400">✗</td>
                    <td className="py-3 sm:py-4 px-2 sm:px-6 text-center text-red-400">✗</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-3 sm:py-4 px-3 sm:px-6 text-gray-300">Viral optimization</td>
                    <td className="py-3 sm:py-4 px-2 sm:px-6 text-center text-green-400">✓</td>
                    <td className="py-3 sm:py-4 px-2 sm:px-6 text-center text-red-400">✗</td>
                    <td className="py-3 sm:py-4 px-2 sm:px-6 text-center text-red-400">✗</td>
                    <td className="py-3 sm:py-4 px-2 sm:px-6 text-center text-red-400">✗</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-3 sm:py-4 px-3 sm:px-6 text-gray-300">Starting price</td>
                    <td className="py-3 sm:py-4 px-2 sm:px-6 text-center text-green-400 font-bold">$29</td>
                    <td className="py-3 sm:py-4 px-2 sm:px-6 text-center text-gray-400">$49/mo</td>
                    <td className="py-3 sm:py-4 px-2 sm:px-6 text-center text-gray-400">$15/mo</td>
                    <td className="py-3 sm:py-4 px-2 sm:px-6 text-center text-gray-400">$99/mo</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Final CTA Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 border border-purple-500/30 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent px-4 sm:px-0">
              <span className="block sm:inline">Ready to Build Your</span>
              <span className="block sm:inline bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"> Twitter Empire?</span>
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-300 mb-6 sm:mb-8 max-w-3xl mx-auto px-4 sm:px-0">
              Join thousands of creators who've transformed their Twitter presence with AutoReach.
              Start with just $29 and watch your audience grow.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6 sm:mb-8">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 sm:px-12 py-4 sm:py-6 text-lg sm:text-xl font-bold rounded-xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105"
              >
                <Link href="/login" className="flex items-center gap-2 sm:gap-3">
                  🚀 Start Your Journey
                </Link>
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-gray-400">
              <div className="flex items-center justify-center gap-2">
                <span className="text-green-400 flex-shrink-0">✓</span>
                <span>No credit card required</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="text-green-400 flex-shrink-0">✓</span>
                <span>Start with free tokens</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="text-green-400 flex-shrink-0">✓</span>
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 border-t border-white/10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="sm:col-span-2 lg:col-span-1">
              <h3 className="text-white font-bold text-lg mb-3 sm:mb-4">AutoReach</h3>
              <p className="text-gray-400 text-sm mb-3 sm:mb-4">
                The AI-powered Twitter growth platform that helps creators build their empire.
              </p>
              <div className="flex gap-3 sm:gap-4">
                <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                  <span className="text-lg sm:text-xl">🐦</span>
                </a>
                <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                  <span className="text-lg sm:text-xl">💼</span>
                </a>
                <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                  <span className="text-lg sm:text-xl">📧</span>
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Product</h4>
              <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                <li><Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link href="/content" className="text-gray-400 hover:text-white transition-colors">Content</Link></li>
                <li><Link href="/analytics" className="text-gray-400 hover:text-white transition-colors">Analytics</Link></li>
                <li><Link href="/settings" className="text-gray-400 hover:text-white transition-colors">Settings</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Support</h4>
              <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact Us</a></li>
                <li><Link href="/test-connection" className="text-gray-400 hover:text-white transition-colors">System Status</Link></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">API Docs</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Company</h4>
              <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 mt-8 sm:mt-12 pt-6 sm:pt-8 text-center">
            <p className="text-gray-400 text-xs sm:text-sm">
              © 2024 AutoReach. All rights reserved. Built with ❤️ for Twitter creators.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}