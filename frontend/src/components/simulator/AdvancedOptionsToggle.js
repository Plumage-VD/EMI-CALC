import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';

export const AdvancedOptionsToggle = ({ 
  isOpen, 
  setIsOpen,
  children 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
    >
      <Card className="glass-card overflow-hidden" data-testid="advanced-options-card">
        {/* Toggle Header */}
        <div 
          onClick={() => setIsOpen(!isOpen)}
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
                {isOpen ? 'Configure' : 'Unlock'} powerful prepayment strategies
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2">
              <Switch
                checked={isOpen}
                onCheckedChange={setIsOpen}
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
          </div>
        </div>

        {/* Collapsible Content */}
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
      </Card>
    </motion.div>
  );
};

export default AdvancedOptionsToggle;
