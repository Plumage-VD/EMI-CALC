import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, Sparkles, Lock } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { useAuth } from '../../context/AuthContext';

export const AdvancedOptionsToggle = ({ 
  isOpen, 
  setIsOpen,
  children 
}) => {
  const { isAuthenticated, openAuthModal } = useAuth();

  const handleToggle = () => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    setIsOpen(!isOpen);
  };

  const handleSwitchChange = (checked) => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    setIsOpen(checked);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
    >
      <Card className="glass-card overflow-hidden relative" data-testid="advanced-options-card">
        {/* Toggle Header */}
        <div 
          onClick={handleToggle}
          className="p-6 cursor-pointer hover:bg-muted/50 transition-colors flex items-center justify-between group"
          data-testid="advanced-options-toggle"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Advanced Optimization</h3>
              <p className="text-sm text-muted-foreground">
                {!isAuthenticated 
                  ? 'Sign in to unlock powerful strategies' 
                  : isOpen ? 'Configure' : 'Unlock'} {isAuthenticated && 'powerful prepayment strategies'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {!isAuthenticated ? (
              <Button 
                variant="outline"
                size="sm"
                className="rounded-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  openAuthModal();
                }}
              >
                <Lock className="w-4 h-4 mr-2" />
                Sign in to Unlock
              </Button>
            ) : (
              <>
                <div className="hidden sm:flex items-center space-x-2">
                  <Switch
                    checked={isOpen}
                    onCheckedChange={handleSwitchChange}
                    onClick={(e) => e.stopPropagation()}
                    data-testid="advanced-options-switch"
                  />
                  <Label className="text-sm font-medium">
                    {isOpen ? 'Enabled' : 'Disabled'}
                  </Label>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="rounded-full"
                >
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Teaser Preview for non-authenticated users */}
        {!isAuthenticated && (
          <div className="relative">
            <div className="p-6 pt-0 space-y-4 border-t border-border/50 opacity-40 blur-[2px] pointer-events-none select-none">
              {/* Teaser cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-semibold mb-2">Periodic Prepayments</h4>
                  <p className="text-sm text-muted-foreground">Set up recurring additional payments</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-semibold mb-2">Lump Sum Payments</h4>
                  <p className="text-sm text-muted-foreground">Plan one-time extra payments</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-semibold mb-2">Prepay vs Invest</h4>
                  <p className="text-sm text-muted-foreground">Compare investment alternatives</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-semibold mb-2">Bank Preferences</h4>
                  <p className="text-sm text-muted-foreground">Reduce tenure or EMI options</p>
                </div>
              </div>
            </div>
            
            {/* Overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-background via-background/80 to-transparent">
              <Button 
                className="premium-button shadow-lg"
                onClick={openAuthModal}
              >
                <Lock className="w-4 h-4 mr-2" />
                Sign in to Unlock Features
              </Button>
            </div>
          </div>
        )}

        {/* Collapsible Content for authenticated users */}
        {isAuthenticated && (
          <div 
            className={`toggle-section ${isOpen ? 'open' : ''}`}
            style={{
              maxHeight: isOpen ? '5000px' : '0',
              overflow: 'hidden',
              transition: 'max-height 0.5s ease-in-out'
            }}
          >
            <div className="p-6 pt-0 space-y-6 border-t border-border/50">
              {children}
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  );
};

export default AdvancedOptionsToggle;
