import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Camera, 
  Shield, 
  Zap, 
  ArrowRight,
  Menu,
  X,
  Sparkles,
  Globe,
  Lock
} from 'lucide-react';

export default function Homepage() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen w-screen overflow-x-hidden" style={{background: 'linear-gradient(135deg, #0f1e2a, #1a2f3a)'}}>
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 px-6 py-4 backdrop-blur-md" style={{background: '#698ea2'}}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{background: 'linear-gradient(135deg, #e4a576, #d89660)'}}>
              <Camera className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">FaceRec</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-white/70 hover:text-white transition-colors text-sm font-medium">Features</a>
            <a href="#about" className="text-white/70 hover:text-white transition-colors text-sm font-medium">About</a>
            <a href="#pricing" className="text-white/70 hover:text-white transition-colors text-sm font-medium">Pricing</a>
            <Link 
              to="/login" 
              className="px-5 py-2.5 rounded-xl font-medium transition-all text-sm hover:scale-105"
              style={{background: 'linear-gradient(135deg, #e4a576, #d89660)', color: 'white'}}
            >
              Get Started
            </Link>
          </div>

          <button 
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 border backdrop-blur-sm"
            style={{background: 'rgba(228, 165, 118, 0.1)', borderColor: 'rgba(228, 165, 118, 0.2)'}}
          >
            <Sparkles className="w-4 h-4" style={{color: '#e4a576'}} />
            <span className="text-sm font-medium text-white">Next-gen AI Recognition</span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
          >
            Intelligent{' '}
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Video Calls
            </span>
            <br />
            with{' '}
            <span 
              className="bg-gradient-to-r bg-clip-text text-transparent"
              style={{backgroundImage: 'linear-gradient(135deg, #e4a576, #f4b88a)'}}
            >
              Face Recognition
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl text-white/70 mb-10 max-w-3xl mx-auto leading-relaxed"
          >
            Experience the future of video communication with advanced AI-powered face recognition, 
            secure connections, and seamless user experience.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <Link 
              to="/login"
              className="px-8 py-4 rounded-2xl font-semibold text-white flex items-center gap-2 justify-center transition-all transform hover:scale-105 shadow-lg"
              style={{background: 'linear-gradient(135deg, #e4a576, #d89660)'}}
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </Link>
            
            <button className="px-8 py-4 rounded-2xl font-semibold text-white border border-white/20 hover:border-white/40 transition-all backdrop-blur-sm flex items-center gap-2 justify-center">
              <Camera className="w-5 h-5" />
              Watch Demo
            </button>
          </motion.div>

          {/* Hero Visual */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="relative max-w-4xl mx-auto"
          >
            {/* Main Dashboard Mockup */}
            <div 
              className="rounded-3xl p-8 shadow-2xl border"
              style={{
                background: 'linear-gradient(135deg, rgba(223, 204, 204, 0.1), rgba(204, 213, 209, 0.05))',
                borderColor: 'rgba(255, 255, 255, 0.1)'
              }}
            >
              {/* Top Bar */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{background: '#ff5f56'}}></div>
                  <div className="w-3 h-3 rounded-full" style={{background: '#ffbd2e'}}></div>
                  <div className="w-3 h-3 rounded-full" style={{background: '#27ca3f'}}></div>
                </div>
                <div className="text-white/60 text-sm">facerec.com/dashboard</div>
              </div>

              {/* Content Area */}
              <div className="grid md:grid-cols-3 gap-6">
                {/* Active Call */}
                <div className="md:col-span-2 rounded-2xl p-6" style={{background: 'rgba(15, 30, 42, 0.5)'}}>
                  <div className="flex items-center justify-center h-48 rounded-xl" style={{background: 'rgba(228, 165, 118, 0.1)'}}>
                    <Camera className="w-16 h-16" style={{color: '#e4a576'}} />
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-white font-medium">Active Call</div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full animate-pulse" style={{background: '#27ca3f'}}></div>
                      <span className="text-white/60 text-sm">Connected</span>
                    </div>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                  <div className="rounded-2xl p-4" style={{background: 'rgba(105, 142, 162, 0.1)'}}>
                    <div className="text-white font-medium mb-2">Recognition Status</div>
                    <div className="text-2xl font-bold" style={{color: '#698ea2'}}>98.7%</div>
                    <div className="text-white/60 text-sm">Accuracy</div>
                  </div>
                  
                  <div className="rounded-2xl p-4" style={{background: 'rgba(228, 165, 118, 0.1)'}}>
                    <div className="text-white font-medium mb-2">Active Users</div>
                    <div className="text-2xl font-bold" style={{color: '#e4a576'}}>1,247</div>
                    <div className="text-white/60 text-sm">Online now</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-6 -left-6 w-16 h-16 rounded-full flex items-center justify-center animate-pulse" style={{background: 'linear-gradient(135deg, #698ea2, #5a7a8a)'}}>
              <Shield className="w-8 h-8 text-white" />
            </div>
            
            <div className="absolute -bottom-6 -right-6 w-16 h-16 rounded-full flex items-center justify-center animate-pulse" style={{background: 'linear-gradient(135deg, #e4a576, #d89660)'}}>
              <Zap className="w-8 h-8 text-white" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Why Choose FaceRec?
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Built with cutting-edge technology for the modern world
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Camera,
                title: "AI Recognition",
                description: "Advanced facial recognition with 99% accuracy and real-time processing"
              },
              {
                icon: Lock,
                title: "End-to-End Security",
                description: "Military-grade encryption ensures your conversations stay private"
              },
              {
                icon: Globe,
                title: "Global Scale",
                description: "Connect with anyone, anywhere in the world with low latency"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="p-8 rounded-3xl backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all group"
                style={{background: 'rgba(255, 255, 255, 0.02)'}}
              >
                <div className="w-16 h-16 rounded-2xl mb-6 flex items-center justify-center group-hover:scale-110 transition-transform" style={{background: 'linear-gradient(135deg, #e4a576, #d89660)'}}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-white/70 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="p-12 rounded-3xl backdrop-blur-sm border border-white/10"
            style={{background: 'linear-gradient(135deg, rgba(228, 165, 118, 0.05), rgba(105, 142, 162, 0.05))'}}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Calls?
            </h2>
            
            <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
              Join thousands of users who have already upgraded their communication experience
            </p>
            
            <Link 
              to="/login"
              className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl font-semibold text-white transition-all transform hover:scale-105 shadow-xl"
              style={{background: 'linear-gradient(135deg, #e4a576, #d89660)'}}
            >
              Get Started Today
              <ArrowRight className="w-6 h-6" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/10" style={{background: '#698ea2'}}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{background: 'linear-gradient(135deg, #e4a576, #d89660)'}}>
                <Camera className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">FaceRec</span>
            </div>
            
            <div className="flex items-center gap-8">
              <a href="#" className="text-white/60 hover:text-white transition-colors text-sm">Privacy</a>
              <a href="#" className="text-white/60 hover:text-white transition-colors text-sm">Terms</a>
              <a href="#" className="text-white/60 hover:text-white transition-colors text-sm">Support</a>
            </div>
            
            <div className="text-white/60 text-sm">
              © 2025 FaceRec. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}