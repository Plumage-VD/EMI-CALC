import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { Card } from '../ui/card';
import { Label } from '../ui/label';
import { Input } from '../ui/input';

export const InvestmentComparison = ({ investmentReturn, setInvestmentReturn }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      <Card className="p-6 border border-stone-200 rounded-xl bg-white shadow-sm" data-testid="investment-comparison-card">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-green-600/10 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-stone-900">Prepay vs Invest Module</h2>
            <p className="text-sm text-stone-600">Compare prepayment with investment returns</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="investmentReturn" className="text-sm font-medium text-stone-700">
              Expected Annual Return on Investment (%)
            </Label>
            <Input
              id="investmentReturn"
              type="number"
              step="0.1"
              value={investmentReturn}
              onChange={(e) => setInvestmentReturn(parseFloat(e.target.value) || 0)}
              className="h-12 rounded-lg border-stone-300 focus:ring-2 focus:ring-emerald-900/20 focus:border-emerald-900"
              data-testid="investment-return-input"
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-900 mb-2">
              How this works:
            </p>
            <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
              <li>For each prepayment, we calculate what the money would grow to if invested instead</li>
              <li>Investment horizon = remaining tenure at the time of each prepayment</li>
              <li>Compare total investment value vs. interest saved by prepaying</li>
              <li>Get a clear recommendation: Prepay or Invest</li>
            </ul>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default InvestmentComparison;
