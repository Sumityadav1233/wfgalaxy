'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  MapPin, Phone, Clock, Mail, Globe, Send, CheckCircle2, Star, 
  Sparkles, CreditCard, ShieldCheck, Truck, ShoppingBag, ExternalLink 
} from 'lucide-react';

export default function AboutClient() {
  const [formState, setFormState] = useState({
    name: '',
    emailOrPhone: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name || !formState.emailOrPhone || !formState.message) {
      alert('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormState({ name: '', emailOrPhone: '', subject: '', message: '' });
      setTimeout(() => setIsSubmitted(false), 5000);
    }, 1000);
  };

  const galleryImages = [
    {
      url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800&auto=format&fit=crop',
      title: 'Boutique Storefront',
      desc: 'Shiv Chowk, Janakpur'
    },
    {
      url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop',
      title: 'Men\'s Collection',
      desc: 'Tailored Luxury Suits & Shirts'
    },
    {
      url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=800&auto=format&fit=crop',
      title: 'Footwear & Accessories',
      desc: 'Handcrafted Shoes & Belts'
    },
    {
      url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop',
      title: 'Streetwear & Hoodies',
      desc: 'Contemporary Everyday Fits'
    }
  ];

  const testimonials = [
    {
      name: 'Ramesh K. Sharma',
      location: 'Janakpur',
      rating: 5,
      comment: 'WF Galaxy is hands down the best fashion store in Janakpur! The fabric quality of their jackets and shirts is top notch. Excellent customer service at Shiv Chowk store.'
    },
    {
      name: 'Pooja Thapa',
      location: 'Kathmandu',
      rating: 5,
      comment: 'Ordered online and received my delivery in 2 days. The sizing guide was 100% accurate. Highly recommend WF Galaxy for authentic, premium fashion in Nepal.'
    },
    {
      name: 'Aayush Yadav',
      location: 'Birgunj',
      rating: 5,
      comment: 'Great store ambiance and helpful staff. Their shoes and hoodies collection is unmatched. Glad to have a high-end boutique right at Shiv Chowk.'
    }
  ];

  const paymentMethods = [
    { name: 'eSewa Mobile Wallet', badge: 'eSewa', color: 'bg-green-600' },
    { name: 'Khalti Digital Wallet', badge: 'Khalti', color: 'bg-purple-600' },
    { name: 'Cash on Delivery (COD)', badge: 'COD', color: 'bg-[#3B2A20]' },
    { name: 'Direct Bank Transfer', badge: 'Bank Transfer', color: 'bg-blue-600' },
    { name: 'Visa & Mastercard', badge: 'Cards', color: 'bg-indigo-600' }
  ];

  return (
    <div className="pt-28 pb-24 max-w-7xl mx-auto px-6 lg:px-8 w-full space-y-20">
      
      {/* 1. Hero / Header Banner */}
      <div className="text-center relative bg-gradient-to-b from-[#F3F1EC] to-white p-10 md:p-16 rounded-3xl border border-gray-100 shadow-xs">
        <div className="inline-flex items-center space-x-2 bg-amber-100/80 text-[#3B2A20] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
          <Sparkles className="w-4 h-4 text-[#F5820B]" />
          <span>Shiv Chowk, Janakpur, Nepal</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-serif font-bold text-[#3B2A20] mb-6 leading-tight">
          WF Galaxy
        </h1>
        
        <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-normal">
          Welcome to <strong className="text-[#3B2A20]">WF Galaxy</strong>, your premier fashion destination located at the iconic Shiv Chowk in Janakpur, Nepal. We are dedicated to providing elevated apparel, handcrafted footwear, and modern luxury outerwear tailored for style and comfort. Explore our curated collections in-store daily or shop online 24/7 with fast delivery across Nepal.
        </p>

        <div className="flex flex-wrap justify-center gap-4 mt-8">
          <Link 
            href="/shop" 
            className="bg-[#3B2A20] text-white px-8 py-3.5 rounded-full font-bold text-sm uppercase tracking-wider hover:bg-[#F5820B] transition-colors shadow-md hover:shadow-lg flex items-center"
          >
            <ShoppingBag className="w-4 h-4 mr-2" /> Explore Collection
          </Link>
          <a 
            href="#contact-section" 
            className="bg-white text-[#3B2A20] border border-gray-300 px-8 py-3.5 rounded-full font-bold text-sm uppercase tracking-wider hover:border-[#F5820B] hover:text-[#F5820B] transition-colors"
          >
            Visit Our Store
          </a>
        </div>
      </div>

      {/* 2. Key Information Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Address */}
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#F5820B] flex items-center justify-center mb-6">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold font-serif text-[#3B2A20] mb-2">Store Location</h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              Shiv Chowk, PWHH+RVJ, Janakpur 45600, Nepal<br />
              <span className="text-xs text-gray-400">Plus Code: PWHH+RVJ, Janakpur 45600</span>
            </p>
          </div>
          <a 
            href="https://www.google.com/maps/place/WF+GALAXY/@26.7296091,85.9296929,19z/data=!4m6!3m5!1s0x39ec4100723dc1ff:0x8098f6dd814716d3!8m2!3d26.729636!4d85.9297216!16s%2Fg%2F11mdxqydpc" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs font-bold text-[#F5820B] hover:underline inline-flex items-center pt-4 border-t border-gray-100"
          >
            Open in Google Maps <ExternalLink className="w-3.5 h-3.5 ml-1" />
          </a>
        </div>

        {/* Operating Hours */}
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-[#F5820B] flex items-center justify-center mb-6">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold font-serif text-[#3B2A20] mb-2">Operating Hours</h3>
            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <div className="flex justify-between border-b border-gray-50 pb-1.5">
                <span className="font-semibold text-[#3B2A20]">Boutique Store:</span>
                <span className="font-bold text-[#F5820B]">7:00 AM – 10:00 PM</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 pb-1.5">
                <span className="font-semibold text-[#3B2A20]">Days Open:</span>
                <span>Daily (Mon – Sun)</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-[#3B2A20]">Online Shopping:</span>
                <span className="font-bold text-green-600">24 Hours / 7 Days</span>
              </div>
            </div>
          </div>
          <span className="text-xs text-gray-400 pt-4 border-t border-gray-100">
            Open on all weekends and public holidays.
          </span>
        </div>

        {/* Contact Hotlines */}
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-[#3B2A20]/5 text-[#3B2A20] flex items-center justify-center mb-6">
              <Phone className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold font-serif text-[#3B2A20] mb-2">Contact & Hotlines</h3>
            <div className="space-y-2 text-sm text-gray-700 mb-4 font-semibold">
              <p className="flex items-center">
                <Phone className="w-4 h-4 mr-2 text-[#F5820B]" />
                <a href="tel:9822039083" className="hover:text-[#F5820B] transition-colors">9822039083</a>
              </p>
              <p className="flex items-center">
                <Phone className="w-4 h-4 mr-2 text-[#F5820B]" />
                <a href="tel:9709141876" className="hover:text-[#F5820B] transition-colors">9709141876</a>
              </p>
              <p className="flex items-center text-xs text-gray-500 pt-1">
                <Mail className="w-4 h-4 mr-2 text-gray-400" />
                <a href="mailto:wfgalaxy.nepal@gmail.com" className="hover:text-[#F5820B] transition-colors">wfgalaxy.nepal@gmail.com</a>
              </p>
            </div>
          </div>
          <span className="text-xs text-gray-400 pt-4 border-t border-gray-100">
            Call us directly for order tracking or store directions.
          </span>
        </div>
      </div>

      {/* 3. Our Story Section */}
      <div className="bg-white p-8 md:p-14 rounded-3xl border border-gray-100 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-block bg-amber-50 text-[#F5820B] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            Our Brand History
          </div>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#3B2A20] leading-tight">
            Elevating Style in Janakpur & Across Nepal
          </h2>
          <p className="text-gray-600 leading-relaxed text-base">
            Founded with a passion for craftsmanship and luxury aesthetics, <strong>WF Galaxy</strong> began its journey at Shiv Chowk, Janakpur with a simple mission: to make premium quality clothing and footwear accessible to everyone without compromise.
          </p>
          <p className="text-gray-600 leading-relaxed text-base">
            From hand-picked organic cotton fabrics to modern streetwear silhouettes, every garment in our boutique is chosen with meticulous attention to detail. Whether you are shopping for everyday essentials, formal shirts, comfortable jeans, or winter jackets, WF Galaxy guarantees unmatched quality and contemporary fit.
          </p>
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
            <div>
              <span className="block text-3xl font-serif font-bold text-[#3B2A20]">100%</span>
              <span className="text-xs text-gray-500 font-medium">Authentic & Quality Assured</span>
            </div>
            <div>
              <span className="block text-3xl font-serif font-bold text-[#F5820B]">24/7</span>
              <span className="text-xs text-gray-500 font-medium">Online Store Availability</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 relative">
          <div className="relative rounded-2xl overflow-hidden aspect-4/3 shadow-xl">
            <img 
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1000&auto=format&fit=crop" 
              alt="WF Galaxy Store Ambiance" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6">
              <div className="text-white">
                <p className="font-serif text-lg font-bold">WF Galaxy Boutique</p>
                <p className="text-xs text-gray-200">Shiv Chowk, Janakpur, Nepal</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Clickable Social Media Links Section */}
      <div className="bg-[#3B2A20] text-white p-8 md:p-12 rounded-3xl text-center space-y-8">
        <div>
          <span className="text-xs font-bold text-[#F5820B] uppercase tracking-widest block mb-2">Connect With Us</span>
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Follow WF Galaxy Online</h2>
          <p className="text-gray-300 max-w-2xl mx-auto text-sm">
            Stay updated with our latest drops, new arrival videos, style guides, and exclusive discounts across our official social channels.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {/* TikTok */}
          <a 
            href="https://www.tiktok.com/@wf.galaxy3?is_from_webapp=1&sender_device=pc" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-white/10 hover:bg-[#F5820B] backdrop-blur-md p-6 rounded-2xl border border-white/10 transition-all duration-300 group flex flex-col items-center justify-center space-y-3"
          >
            <div className="w-12 h-12 rounded-full bg-white text-[#3B2A20] flex items-center justify-center group-hover:scale-110 transition-transform font-bold text-lg">
              🎵
            </div>
            <div>
              <h3 className="font-bold text-base">TikTok</h3>
              <p className="text-xs text-gray-300 group-hover:text-white">@wf.galaxy3</p>
            </div>
            <span className="text-[11px] uppercase tracking-wider font-bold underline opacity-80 group-hover:opacity-100">
              Watch Videos &rarr;
            </span>
          </a>

          {/* Facebook */}
          <a 
            href="https://facebook.com/wfgalaxy" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-white/10 hover:bg-[#F5820B] backdrop-blur-md p-6 rounded-2xl border border-white/10 transition-all duration-300 group flex flex-col items-center justify-center space-y-3"
          >
            <div className="w-12 h-12 rounded-full bg-white text-[#3B2A20] flex items-center justify-center group-hover:scale-110 transition-transform font-bold text-lg">
              f
            </div>
            <div>
              <h3 className="font-bold text-base">Facebook</h3>
              <p className="text-xs text-gray-300 group-hover:text-white">wf galaxy</p>
            </div>
            <span className="text-[11px] uppercase tracking-wider font-bold underline opacity-80 group-hover:opacity-100">
              Visit Page &rarr;
            </span>
          </a>

          {/* Instagram */}
          <a 
            href="https://www.instagram.com/wfgalaxy03?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-white/10 hover:bg-[#F5820B] backdrop-blur-md p-6 rounded-2xl border border-white/10 transition-all duration-300 group flex flex-col items-center justify-center space-y-3"
          >
            <div className="w-12 h-12 rounded-full bg-white text-[#3B2A20] flex items-center justify-center group-hover:scale-110 transition-transform font-bold text-lg">
              📷
            </div>
            <div>
              <h3 className="font-bold text-base">Instagram</h3>
              <p className="text-xs text-gray-300 group-hover:text-white">@wfgalaxy03</p>
            </div>
            <span className="text-[11px] uppercase tracking-wider font-bold underline opacity-80 group-hover:opacity-100">
              Follow Us &rarr;
            </span>
          </a>
        </div>
      </div>

      {/* 5. Store Photo Gallery */}
      <div className="space-y-8">
        <div className="text-center">
          <span className="text-xs font-bold text-[#F5820B] uppercase tracking-widest block mb-2">Boutique & Products</span>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#3B2A20]">WF Galaxy Showcase</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {galleryImages.map((img, idx) => (
            <div key={idx} className="group relative overflow-hidden rounded-2xl bg-gray-100 shadow-sm border border-gray-100 aspect-4/5">
              <img 
                src={img.url} 
                alt={img.title} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity flex flex-col justify-end p-5 text-white">
                <h3 className="font-serif font-bold text-lg">{img.title}</h3>
                <p className="text-xs text-gray-300">{img.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Embedded Google Maps & Direct Location */}
      <div className="bg-white p-8 md:p-12 rounded-3xl border border-gray-100 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-[#F5820B] uppercase tracking-widest block mb-1">Interactive Map</span>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#3B2A20]">Find Us at Shiv Chowk</h2>
            <p className="text-sm text-gray-500">Janakpur, Nepal — Open daily from 7:00 AM to 10:00 PM</p>
          </div>
          <a 
            href="https://www.google.com/maps/place/WF+GALAXY/@26.7296091,85.9296929,19z/data=!4m6!3m5!1s0x39ec4100723dc1ff:0x8098f6dd814716d3!8m2!3d26.729636!4d85.9297216!16s%2Fg%2F11mdxqydpc" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center bg-[#3B2A20] text-white px-6 py-3 rounded-full font-bold text-xs uppercase tracking-wider hover:bg-[#F5820B] transition-colors shadow-xs"
          >
            <MapPin className="w-4 h-4 mr-2" /> Directions on Google Maps
          </a>
        </div>

        <div className="w-full h-80 rounded-2xl overflow-hidden border border-gray-200 relative bg-gray-100">
          <iframe 
            title="WF Galaxy Location Map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d890.5802283086708!2d85.9296929!3d26.7296091!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39ec4100723dc1ff%3A0x8098f6dd814716d3!2sWF%20GALAXY!5e0!3m2!1sen!2snp!4v1700000000000!5m2!1sen!2snp" 
            className="w-full h-full border-0"
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>

      {/* 7. Customer Testimonials Section */}
      <div className="space-y-8">
        <div className="text-center">
          <span className="text-xs font-bold text-[#F5820B] uppercase tracking-widest block mb-2">Real Feedback</span>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#3B2A20]">What Our Customers Say</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div key={idx} className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center space-x-1 mb-4 text-amber-400">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm italic leading-relaxed">
                  "{t.comment}"
                </p>
              </div>
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="font-bold text-[#3B2A20] text-sm">{t.name}</span>
                <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-md">{t.location}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 8. Interactive Contact Form & Payment Methods */}
      <div id="contact-section" className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Contact Form */}
        <div className="lg:col-span-7 bg-white p-8 md:p-12 rounded-3xl border border-gray-100 shadow-xs space-y-6">
          <div>
            <span className="text-xs font-bold text-[#F5820B] uppercase tracking-widest block mb-1">Get In Touch</span>
            <h2 className="text-3xl font-serif font-bold text-[#3B2A20]">Send Us a Message</h2>
            <p className="text-sm text-gray-500 mt-1">Have a question about clothing sizes, custom orders, or bulk inquiries?</p>
          </div>

          {isSubmitted ? (
            <div className="bg-green-50 border border-green-200 text-green-800 p-6 rounded-2xl flex items-center space-x-3">
              <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-sm">Message Sent Successfully!</h4>
                <p className="text-xs text-green-700 mt-0.5">Thank you for reaching out. Our team at WF Galaxy will get back to you shortly.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#3B2A20] uppercase tracking-wider mb-1">Your Name *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Ramesh Sharma"
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-hidden focus:border-[#F5820B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#3B2A20] uppercase tracking-wider mb-1">Email or Phone *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="9822039083 / email@domain.com"
                    value={formState.emailOrPhone}
                    onChange={(e) => setFormState({ ...formState, emailOrPhone: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-hidden focus:border-[#F5820B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#3B2A20] uppercase tracking-wider mb-1">Subject</label>
                <input 
                  type="text" 
                  placeholder="e.g. Product Inquiry / Order Details"
                  value={formState.subject}
                  onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-hidden focus:border-[#F5820B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#3B2A20] uppercase tracking-wider mb-1">Message *</label>
                <textarea 
                  rows={4}
                  required
                  placeholder="Type your message here..."
                  value={formState.message}
                  onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-hidden focus:border-[#F5820B] resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#3B2A20] text-white py-4 rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-[#F5820B] transition-colors shadow-md flex items-center justify-center"
              >
                {isSubmitting ? (
                  <span>Sending Message...</span>
                ) : (
                  <span className="flex items-center"><Send className="w-4 h-4 mr-2" /> Send Message</span>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Payment Methods Accepted */}
        <div className="lg:col-span-5 bg-white p-8 md:p-12 rounded-3xl border border-gray-100 shadow-xs space-y-6">
          <div>
            <span className="text-xs font-bold text-[#F5820B] uppercase tracking-widest block mb-1">Accepted Payments</span>
            <h2 className="text-2xl font-serif font-bold text-[#3B2A20]">Easy & Secure Checkout</h2>
            <p className="text-xs text-gray-500 mt-1">We accept multiple payment options in-store and online across Nepal.</p>
          </div>

          <div className="space-y-3">
            {paymentMethods.map((pm, idx) => (
              <div key={idx} className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center space-x-3">
                  <span className={`text-[10px] font-extrabold text-white px-2.5 py-1 rounded-md ${pm.color}`}>
                    {pm.badge}
                  </span>
                  <span className="text-sm font-semibold text-[#3B2A20]">{pm.name}</span>
                </div>
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center space-x-3 text-xs text-gray-500">
            <ShieldCheck className="w-5 h-5 text-green-600 flex-shrink-0" />
            <span>100% Safe & Encrypted Checkout for all orders.</span>
          </div>
        </div>
      </div>

    </div>
  );
}
