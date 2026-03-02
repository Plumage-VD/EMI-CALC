import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, TrendingDown, Calendar, DollarSign, Target, LineChart, FileText, Sparkles, ChevronRight, ExternalLink } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import Navigation from '../components/Navigation';

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: TrendingDown,
      title: 'Smart EMI Optimization',
      description: 'Dynamic simulation engine that shows exactly how much you can save',
      gradient: 'from-amber-500 to-orange-500'
    },
    {
      icon: Calendar,
      title: 'Flexible Prepayments',
      description: 'Plan periodic and one-time payments that fit your cash flow',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: DollarSign,
      title: 'Cost Modeling',
      description: 'Factor in prepayment charges and bank preferences automatically',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: LineChart,
      title: 'Investment Comparison',
      description: 'Should you prepay or invest? Get data-driven recommendations',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: Target,
      title: 'Goal Tracking',
      description: 'Visualize your path to loan freedom with interactive charts',
      gradient: 'from-red-500 to-rose-500'
    },
    {
      icon: FileText,
      title: 'Export Reports',
      description: 'Download detailed amortization schedules as Excel or PDF',
      gradient: 'from-indigo-500 to-violet-500'
    }
  ];

  const stats = [
    { value: '₹26L+', label: 'Avg Interest Saved' },
    { value: '8.3 Yrs', label: 'Avg Time Saved' },
    { value: '10K+', label: 'Loans Optimized' },
    { value: '98%', label: 'User Satisfaction' }
  ];

  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 md:px-12 overflow-hidden hero-pattern">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Production-Ready Fintech Platform</span>
              </div>
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-6 leading-tight">
                Don't just <br />
                <span className="bg-gradient-to-r from-[hsl(var(--brand-gold))] via-[hsl(var(--brand-gold-light))] to-[hsl(var(--brand-gold))] bg-clip-text text-transparent">
                  calculate EMI
                </span>
              </h1>
              
              <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-foreground/80">
                Optimize your loan freedom
              </h2>
              
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-xl">
                A production-ready loan repayment optimization platform designed for Indian borrowers. 
                Simulate, strategize, and save lakhs in interest with our advanced planning engine.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={() => navigate('/emi-simulator')}
                  className="premium-button text-lg h-14"
                  data-testid="hero-start-planning-btn"
                >
                  Launch Simulator
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
                  className="rounded-full h-14 px-8 text-lg border-2"
                  data-testid="learn-more-btn"
                >
                  See How It Works
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </motion.div>
            
            <motion.div 
              className="lg:col-span-1"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--brand-gold))]/20 to-primary/20 rounded-3xl blur-3xl"></div>
                <img 
                  src="https://images.unsplash.com/photo-1767630415897-0ba72ec109c0?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODd8MHwxfHNlYXJjaHwyfHxtb2Rlcm4lMjBtaW5pbWFsaXN0JTIwaG9tZSUyMGFyY2hpdGVjdHVyZXxlbnwwfHx8fDE3NzI0NTc4OTB8MA&ixlib=rb-4.1.0&q=85"
                  alt="Modern home representing financial freedom"
                  className="relative rounded-3xl shadow-2xl w-full h-auto"
                />
              </div>
            </motion.div>
          </div>
          
          {/* Stats Bar */}
          <motion.div 
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-black bg-gradient-to-r from-[hsl(var(--brand-gold))] to-[hsl(var(--brand-gold-light))] bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl sm:text-5xl font-black mb-4">
              Powerful Features for <br />
              <span className="bg-gradient-to-r from-[hsl(var(--brand-gold))] to-[hsl(var(--brand-gold-light))] bg-clip-text text-transparent">
                Smart Borrowers
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to take control of your loan repayment journey
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="group p-6 h-full glass-card hover:shadow-2xl transition-all duration-300 cursor-pointer card-shine">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 md:px-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--brand-gold))]/10 to-primary/10"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl sm:text-5xl font-black mb-6">
              Ready to Achieve <br />
              <span className="bg-gradient-to-r from-[hsl(var(--brand-gold))] to-[hsl(var(--brand-gold-light))] bg-clip-text text-transparent">
                Loan Freedom?
              </span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Start your journey to financial freedom today. Our simulator will show you exactly how much you can save.
            </p>
            <Button 
              onClick={() => navigate('/emi-simulator')}
              className="premium-button text-lg h-14"
              data-testid="cta-start-planning-btn"
            >
              Launch EMI Simulator
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 md:px-12 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-3">
              <img src="/logo.png" alt="Logo" className="w-8 h-8" />
              <div>
                <span className="text-base font-bold bg-gradient-to-r from-[hsl(var(--brand-gold))] to-[hsl(var(--brand-gold-light))] bg-clip-text text-transparent block">
                  Plumage Capital Strategy Lab
                </span>
                <p className="text-xs text-muted-foreground">
                  Empowering borrowers to achieve financial freedom
                </p>
              </div>
            </div>
            
            <div className="flex flex-col items-center md:items-end space-y-2">
              <a 
                href="https://www.plumageconsultancy.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center space-x-1"
              >
                <span>A Plumage Consultancy Initiative</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <p className="text-xs text-muted-foreground">
                © 2026 Plumage Capital. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
