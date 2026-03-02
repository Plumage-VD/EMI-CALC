import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, Mail } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { toast } from 'sonner';

const AvailableSoon = ({ title, description }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  const handleNotify = (e) => {
    e.preventDefault();
    if (email) {
      toast.success('Thanks! We\'ll notify you when this feature launches.');
      setEmail('');
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center px-6">
      <Card className="max-w-2xl w-full p-12 text-center border border-stone-200 rounded-2xl bg-white shadow-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-10 h-10 text-amber-600" />
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-4" data-testid="available-soon-title">
            {title}
          </h1>
          
          <p className="text-lg text-stone-600 mb-8" data-testid="available-soon-description">
            {description}
          </p>
          
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-6 mb-8">
            <h3 className="font-semibold text-stone-900 mb-2">Get Notified</h3>
            <p className="text-sm text-stone-600 mb-4">
              Enter your email to be the first to know when this feature launches
            </p>
            
            <form onSubmit={handleNotify} className="flex flex-col sm:flex-row gap-3">
              <Input
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 h-12 rounded-lg border-stone-300 focus:ring-2 focus:ring-emerald-900/20 focus:border-emerald-900"
                data-testid="email-input"
                required
              />
              <Button 
                type="submit"
                className="rounded-full px-6 bg-emerald-900 hover:bg-emerald-800 transition-all active:scale-95"
                data-testid="notify-me-btn"
              >
                <Mail className="w-4 h-4 mr-2" />
                Notify Me
              </Button>
            </form>
          </div>
          
          <Button 
            onClick={() => navigate('/')}
            variant="outline"
            className="rounded-full px-6 border-stone-300 text-stone-700 hover:bg-stone-100"
            data-testid="back-home-btn"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </motion.div>
      </Card>
    </div>
  );
};

export default AvailableSoon;
