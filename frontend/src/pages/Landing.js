import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, TrendingDown, Calendar, DollarSign, Target, LineChart, FileText, Lightbulb, Calculator } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Calculator,
      title: 'EMI Simulation',
      description: 'Dynamic loan simulation engine with strategic comparison capability',
      image: 'https://images.unsplash.com/photo-1718279602896-6df6c34f61e5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODl8MHwxfHNlYXJjaHwyfHxwZXJzb24lMjB3b3JraW5nJTIwbGFwdG9wJTIwY29mZmVlJTIwc2hvcCUyMHN1bmxpZ2h0fGVufDB8fHx8MTc3MjQ1NzkwMXww&ixlib=rb-4.1.0&q=85'
    },
    {
      icon: TrendingDown,
      title: 'Extra Principal Strategy',
      description: 'Plan periodic and adhoc prepayments to reduce your loan burden',
      image: 'https://images.unsplash.com/photo-1552248524-10d9a7e4841c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwyfHxtaW5pbWFsaXN0JTIwc21hbGwlMjBwbGFudCUyMGdyb3dpbmclMjBmcm9tJTIwc29pbHxlbnwwfHx8fDE3NzI0NTc4OTl8MA&ixlib=rb-4.1.0&q=85'
    },
    {
      icon: DollarSign,
      title: 'Prepayment Charge Modeling',
      description: 'Factor in prepayment charges with inclusive/exclusive options',
      image: 'https://images.unsplash.com/photo-1533696848654-6bdf438edea4?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzV8MHwxfHNlYXJjaHwxfHxoYW5kJTIwaG9sZGluZyUyMGhvdXNlJTIwa2V5cyUyMGNsb3NlJTIwdXB8ZW58MHx8fHwxNzcyNDU3OTExfDA&ixlib=rb-4.1.0&q=85'
    },
    {
      icon: LineChart,
      title: 'Prepay vs Invest Comparison',
      description: 'Analyze whether prepaying or investing yields better returns',
      image: 'https://images.unsplash.com/photo-1552248524-10d9a7e4841c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwyfHxtaW5pbWFsaXN0JTIwc21hbGwlMjBwbGFudCUyMGdyb3dpbmclMjBmcm9tJTIwc29pbHxlbnwwfHx8fDE3NzI0NTc4OTl8MA&ixlib=rb-4.1.0&q=85'
    },
    {
      icon: Target,
      title: 'Tenure & Interest Savings',
      description: 'See exactly how many years and interest amount you can save',
      image: 'https://images.unsplash.com/photo-1533696848654-6bdf438edea4?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzV8MHwxfHNlYXJjaHwxfHxoYW5kJTIwaG9sZGluZyUyMGhvdXNlJTIwa2V5cyUyMGNsb3NlJTIwdXB8ZW58MHx8fHwxNzcyNDU3OTExfDA&ixlib=rb-4.1.0&q=85'
    },
    {
      icon: FileText,
      title: 'Downloadable Reports',
      description: 'Export detailed amortization schedules as Excel and PDF',
      image: 'https://images.unsplash.com/photo-1718279602896-6df6c34f61e5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODl8MHwxfHNlYXJjaHwyfHxwZXJzb24lMjB3b3JraW5nJTIwbGFwdG9wJTIwY29mZmVlJTIwc2hvcCUyMHN1bmxpZ2h0fGVufDB8fHx8MTc3MjQ1NzkwMXww&ixlib=rb-4.1.0&q=85'
    }
  ];

  const tools = [
    { name: 'Refinancing Analyzer', path: '/refinancing-analyzer' },
    { name: 'Rent vs Buy', path: '/rent-vs-buy' },
    { name: 'SIP vs Prepayment', path: '/sip-vs-prepayment' },
    { name: 'Financial Health', path: '/financial-health' }
  ];

  return (
    <div className="min-h-screen bg-stone-100">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass-effect border-b border-stone-200/50">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-4">
          <div className="flex justify-between items-center">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-900 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-emerald-900">Loan Freedom Planner</span>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Button 
                onClick={() => navigate('/emi-simulator')}
                className="rounded-full px-6 bg-emerald-900 hover:bg-emerald-800 transition-all active:scale-95 shadow-lg"
                data-testid="nav-start-planning-btn"
              >
                Start Planning
              </Button>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6 md:px-12 gradient-hero">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <motion.div 
              className="lg:col-span-7"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-stone-900 mb-6 leading-tight">
                Don't just calculate EMI.
                <span className="text-emerald-900"> Optimize your loan freedom.</span>
              </h1>
              <p className="text-lg text-stone-600 mb-8 leading-relaxed max-w-2xl">
                A production-ready loan repayment optimization platform designed for Indian borrowers. 
                Simulate, strategize, and save thousands in interest with our advanced planning engine.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={() => navigate('/emi-simulator')}
                  className="rounded-full px-8 py-6 text-lg bg-emerald-900 hover:bg-emerald-800 transition-all active:scale-95 shadow-lg"
                  data-testid="hero-start-planning-btn"
                >
                  Start Planning <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
                  className="rounded-full px-8 py-6 text-lg border-stone-300 text-stone-700 hover:bg-stone-100"
                  data-testid="learn-more-btn"
                >
                  Learn More
                </Button>
              </div>
            </motion.div>
            
            <motion.div 
              className="lg:col-span-5"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1767630415897-0ba72ec109c0?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODd8MHwxfHNlYXJjaHwyfHxtb2Rlcm4lMjBtaW5pbWFsaXN0JTIwaG9tZSUyMGFyY2hpdGVjdHVyZXxlbnwwfHx8fDE3NzI0NTc4OTB8MA&ixlib=rb-4.1.0&q=85"
                  alt="Modern home representing financial freedom"
                  className="w-full h-auto"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 md:px-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 mb-4">
              Powerful Features for Smart Borrowers
            </h2>
            <p className="text-lg text-stone-600 max-w-2xl mx-auto">
              Everything you need to take control of your loan repayment journey
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="p-6 h-full hover:shadow-lg transition-all duration-300 border border-stone-200 rounded-xl bg-white">
                  <div className="w-12 h-12 rounded-lg bg-emerald-900/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-emerald-900" />
                  </div>
                  <h3 className="text-xl font-bold text-stone-900 mb-2">{feature.title}</h3>
                  <p className="text-stone-600 leading-relaxed">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 md:px-12 bg-emerald-900">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Achieve Loan Freedom?
            </h2>
            <p className="text-lg text-emerald-100 mb-8 max-w-2xl mx-auto">
              Start your journey to financial freedom today. Our simulator will show you exactly how much you can save.
            </p>
            <Button 
              onClick={() => navigate('/emi-simulator')}
              className="rounded-full px-8 py-6 text-lg bg-white text-emerald-900 hover:bg-stone-100 transition-all active:scale-95 shadow-lg"
              data-testid="cta-start-planning-btn"
            >
              Launch EMI Simulator <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Other Tools */}
      <section className="py-24 px-6 md:px-12 bg-stone-50">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-4">
              More Tools Coming Soon
            </h2>
            <p className="text-lg text-stone-600">
              We're building a complete financial planning suite for you
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tools.map((tool, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  onClick={() => navigate(tool.path)}
                  className="p-6 text-center cursor-pointer hover:shadow-lg transition-all duration-300 border border-stone-200 rounded-xl bg-white"
                  data-testid={`tool-card-${index}`}
                >
                  <Lightbulb className="w-8 h-8 text-amber-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-stone-900">{tool.name}</h3>
                  <p className="text-sm text-stone-500 mt-2">Coming Soon</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 md:px-12 bg-stone-900">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">Loan Freedom Planner</span>
          </div>
          <p className="text-stone-400">
            © 2026 Loan Freedom Planner. Empowering borrowers to achieve financial freedom.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
