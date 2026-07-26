'use client';

import React, { useState } from 'react';
import { Phone, MapPin, Mail, Clock, Send, CheckCircle } from 'lucide-react';

export default function ContactPage() {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate sending email/message
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormState({ name: '', email: '', phone: '', message: '' });
    }, 1000);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 flex-grow">
      {/* Page Title */}
      <div className="border-b border-border pb-5 mb-10 text-center sm:text-left">
        <h1 className="text-3xl font-bold tracking-tight text-primary uppercase">CONTACT WF GALAXY</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Have a question about our sizes, custom orders, or shipping? Reach out to us.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Column: Contact Details & Info */}
        <div className="space-y-8">
          <div className="bg-muted/40 border border-border p-8 rounded-lg space-y-6">
            <h2 className="text-xl font-bold tracking-wider text-primary uppercase border-b border-border pb-3">
              Store Information
            </h2>
            
            {/* Address */}
            <div className="flex items-start space-x-4">
              <div className="h-10 w-10 rounded-full bg-primary text-accent flex items-center justify-center shrink-0">
                <MapPin className="h-5 w-5 stroke-[1.5]" />
              </div>
              <div>
                <h3 className="font-semibold text-sm uppercase tracking-wider text-primary">Location Address</h3>
                <p className="text-neutral-600 text-sm mt-1 font-light">
                  Shiv Chowk, Janakpur
                  <br />
                  Dhanusha, Nepal
                </p>
              </div>
            </div>

            {/* Operating Hours */}
            <div className="flex items-start space-x-4">
              <div className="h-10 w-10 rounded-full bg-primary text-accent flex items-center justify-center shrink-0">
                <Clock className="h-5 w-5 stroke-[1.5]" />
              </div>
              <div>
                <h3 className="font-semibold text-sm uppercase tracking-wider text-primary">Store Hours</h3>
                <p className="text-neutral-600 text-sm mt-1 font-light">
                  Monday – Sunday: 9:00 AM – 8:00 PM
                  <br />
                  (Open on holidays)
                </p>
              </div>
            </div>

            {/* General Email */}
            <div className="flex items-start space-x-4">
              <div className="h-10 w-10 rounded-full bg-primary text-accent flex items-center justify-center shrink-0">
                <Mail className="h-5 w-5 stroke-[1.5]" />
              </div>
              <div>
                <h3 className="font-semibold text-sm uppercase tracking-wider text-primary">Email Support</h3>
                <p className="text-neutral-600 text-sm mt-1 font-light hover:text-accent transition-colors">
                  <a href="mailto:support@wfgalaxy.com">support@wfgalaxy.com</a>
                </p>
              </div>
            </div>
          </div>

          {/* Click-to-Call Hotline */}
          <div className="bg-primary text-primary-foreground border border-neutral-800 p-8 rounded-lg space-y-4">
            <h2 className="text-lg font-bold tracking-wider text-accent uppercase">
              DIRECT STORE HOTLINES
            </h2>
            <p className="text-xs text-neutral-400 font-light">
              Tap any phone number below to call a WF GALAXY representative directly:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <a
                href="tel:9709141876"
                className="flex flex-col items-center justify-center p-4 rounded-md bg-neutral-900 border border-neutral-800 hover:border-accent transition-all group text-center"
              >
                <Phone className="h-5 w-5 text-accent mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Representative 1</span>
                <span className="text-sm font-semibold text-white mt-1">9709141876</span>
              </a>

              <a
                href="tel:9709143347"
                className="flex flex-col items-center justify-center p-4 rounded-md bg-neutral-900 border border-neutral-800 hover:border-accent transition-all group text-center"
              >
                <Phone className="h-5 w-5 text-accent mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Representative 2</span>
                <span className="text-sm font-semibold text-white mt-1">9709143347</span>
              </a>

              <a
                href="tel:9705447139"
                className="flex flex-col items-center justify-center p-4 rounded-md bg-neutral-900 border border-neutral-800 hover:border-accent transition-all group text-center"
              >
                <Phone className="h-5 w-5 text-accent mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Representative 3</span>
                <span className="text-sm font-semibold text-white mt-1">9705447139</span>
              </a>
            </div>
          </div>
        </div>

        {/* Right Column: Contact Form */}
        <div className="bg-background border border-border p-8 rounded-lg shadow-xs">
          <h2 className="text-xl font-bold tracking-wider text-primary uppercase mb-6">
            Send a Message
          </h2>
          
          {isSubmitted ? (
            <div className="py-12 flex flex-col items-center text-center space-y-4 animate-fade-in">
              <CheckCircle className="h-16 w-16 text-accent stroke-[1.2]" />
              <div>
                <h3 className="text-lg font-bold text-primary uppercase">MESSAGE SENT SUCCESSFULLY</h3>
                <p className="text-sm text-neutral-500 font-light mt-1 max-w-sm">
                  Thank you for reaching out. We have received your query and a representative will call or write to you shortly.
                </p>
              </div>
              <button
                onClick={() => setIsSubmitted(false)}
                className="px-6 py-2 border border-primary text-xs font-semibold tracking-wider hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                SEND ANOTHER MESSAGE
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-xs font-bold uppercase text-primary mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-muted/30 border border-border rounded-sm py-2.5 px-3 text-sm focus:outline-hidden focus:border-accent text-primary"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-xs font-bold uppercase text-primary mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={formState.email}
                  onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                  placeholder="e.g. rahul@example.com"
                  className="w-full bg-muted/30 border border-border rounded-sm py-2.5 px-3 text-sm focus:outline-hidden focus:border-accent text-primary"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-xs font-bold uppercase text-primary mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  required
                  value={formState.phone}
                  onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                  placeholder="e.g. 9709141876"
                  className="w-full bg-muted/30 border border-border rounded-sm py-2.5 px-3 text-sm focus:outline-hidden focus:border-accent text-primary"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-xs font-bold uppercase text-primary mb-1">
                  Your Message
                </label>
                <textarea
                  id="message"
                  required
                  rows={5}
                  value={formState.message}
                  onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                  placeholder="Tell us what you need help with..."
                  className="w-full bg-muted/30 border border-border rounded-sm py-2.5 px-3 text-sm focus:outline-hidden focus:border-accent text-primary resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center bg-primary hover:bg-neutral-800 disabled:bg-neutral-200 text-primary-foreground py-3 text-xs font-bold tracking-widest uppercase transition-colors rounded-sm shadow-xs mt-6"
              >
                <Send className="mr-2 h-4 w-4 stroke-[1.8]" />
                {isSubmitting ? 'SENDING...' : 'SEND MESSAGE'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
