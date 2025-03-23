"use client"
import React from 'react';
import { Shield, Search, FileText, Activity, Lock, Server, ChevronRight, CheckCircle } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <header className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white">
        <nav className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8" />
              <span className="text-2xl font-bold">CyberHive</span>
            </div>
            <div className="hidden md:flex space-x-8">
              <a href="#features" className="hover:text-blue-200">Features</a>
              <a href="#solutions" className="hover:text-blue-200">Solutions</a>
              <a href="#pricing" className="hover:text-blue-200">Pricing</a>
              <a href="#contact" className="hover:text-blue-200">Contact</a>
            </div>
            <button className="bg-blue-500 hover:bg-blue-600 px-6 py-2 rounded-lg font-semibold transition-colors">
              Get Started
            </button>
          </div>
        </nav>

        <div className="container mx-auto px-6 py-24">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold mb-6">Advanced Security Scanning & Log Analysis Platform</h1>
            <p className="text-xl text-blue-100 mb-8">Protect your infrastructure with real-time threat detection and comprehensive log analysis powered by AI.</p>
            <div className="flex space-x-4">
              <button className="bg-blue-500 hover:bg-blue-600 px-8 py-3 rounded-lg font-semibold flex items-center transition-colors">
                Start Free Trial <ChevronRight className="ml-2 h-5 w-5" />
              </button>
              <button className="border border-white hover:bg-white hover:text-blue-900 px-8 py-3 rounded-lg font-semibold transition-colors">
                Watch Demo
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-20 container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-16">Comprehensive Security Features</h2>
        <div className="grid md:grid-cols-3 gap-12">
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <Search className="h-12 w-12 text-blue-500 mb-6" />
            <h3 className="text-xl font-semibold mb-4">Real-time Scanning</h3>
            <p className="text-gray-600">Continuous monitoring and instant threat detection across your entire infrastructure.</p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <FileText className="h-12 w-12 text-blue-500 mb-6" />
            <h3 className="text-xl font-semibold mb-4">Log Analysis</h3>
            <p className="text-gray-600">Advanced log parsing and analysis with AI-powered insights and anomaly detection.</p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <Activity className="h-12 w-12 text-blue-500 mb-6" />
            <h3 className="text-xl font-semibold mb-4">Performance Metrics</h3>
            <p className="text-gray-600">Detailed performance monitoring and security health scoring system.</p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-blue-900 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">99.9%</div>
              <div className="text-blue-200">Threat Detection Rate</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-blue-200">Active Monitoring</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">5000+</div>
              <div className="text-blue-200">Protected Systems</div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 container mx-auto px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose CyberHive</h2>
          <div className="space-y-6">
            {[
              "Advanced AI-powered threat detection",
              "Real-time security alerts and notifications",
              "Comprehensive log management system",
              "Automated security response protocols",
              "Custom reporting and analytics dashboard",
              "24/7 expert security support"
            ].map((benefit, index) => (
              <div key={index} className="flex items-center space-x-4 bg-white p-4 rounded-lg shadow">
                <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                <span className="text-gray-700">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-8">Ready to Secure Your Infrastructure?</h2>
          <p className="text-xl text-blue-100 mb-8">Start your free trial today and experience enterprise-grade security.</p>
          <button className="bg-blue-500 hover:bg-blue-600 px-8 py-3 rounded-lg font-semibold inline-flex items-center transition-colors">
            Get Started Now <ChevronRight className="ml-2 h-5 w-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <Shield className="h-6 w-6" />
                <span className="text-xl font-bold text-white">CyberHive</span>
              </div>
              <p className="text-sm">Protecting your digital assets with advanced security solutions.</p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Solutions</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Documentation</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
                <li><a href="#" className="hover:text-white">Compliance</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-sm text-center">
            <p>&copy; 2025 CyberHive. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;