import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Moon, Sun, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import { useTheme } from '../context/ThemeContext';

export const Navigation = ({ showCTA = true }) => {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  return (
    <nav className="fixed top-0 w-full z-50 glass-nav">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-4">
        <div className="flex justify-between items-center">
          <div 
            onClick={() => navigate('/')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="relative">
              <img 
                src="/logo.png" 
                alt="Capital Strategy Lab" 
                className="w-10 h-10 transition-transform group-hover:scale-110"
              />
            </div>
            <div>
              <span className="text-lg font-bold bg-gradient-to-r from-[hsl(var(--brand-gold))] to-[hsl(var(--brand-gold-light))] bg-clip-text text-transparent">
                Capital Strategy Lab
              </span>
              <p className="text-[10px] text-muted-foreground">by Plumage Consultancy</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <a 
              href="https://www.plumageconsultancy.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hidden sm:flex items-center space-x-1 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <span>Visit Main Site</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full w-10 h-10"
              data-testid="theme-toggle"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-[hsl(var(--brand-gold))]" />
              ) : (
                <Moon className="w-5 h-5 text-[hsl(var(--brand-gold))]" />
              )}
            </Button>
            
            {showCTA && (
              <Button 
                onClick={() => navigate('/emi-simulator')}
                className="premium-button"
                data-testid="nav-start-planning-btn"
              >
                Start Planning
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
