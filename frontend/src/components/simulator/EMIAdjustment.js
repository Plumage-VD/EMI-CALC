import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, AlertCircle } from 'lucide-react';
import { Card } from '../ui/card';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Slider } from '../ui/slider';
import { NumericFormat } from 'react-number-format';

export const EMIAdjustment = ({ adjustedEmi, setAdjustedEmi, loanAmount, interestRate, tenureYears }) => {
  // Calculate standard EMI
  const calculateStandardEMI = () => {
    const P = loanAmount;
    const r = interestRate / 1200;
    const n = tenureYears * 12;
    
    if (r === 0) return P / n;
    
    const emi = P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
    return Math.round(emi);
  };

  const standardEMI = calculateStandardEMI();
  const currentEMI = adjustedEmi ? parseFloat(adjustedEmi) : standardEMI;
  const isValid = !adjustedEmi || currentEMI >= standardEMI;
  const maxEMI = standardEMI * 2;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Card className="p-6 border border-stone-200 rounded-xl bg-white shadow-sm" data-testid="emi-adjustment-card">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-amber-600/10 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-stone-900">EMI Adjustment</h2>
            <p className="text-sm text-stone-600">Increase your EMI to save interest</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-medium text-stone-700">Adjusted EMI (₹)</Label>
              <span className="text-xs text-stone-500 font-mono">
                Standard: ₹{standardEMI.toLocaleString('en-IN')}
              </span>
            </div>
            
            <Slider
              value={[adjustedEmi ? parseFloat(adjustedEmi) : standardEMI]}
              onValueChange={(value) => setAdjustedEmi(value[0].toString())}
              min={standardEMI}
              max={maxEMI}
              step={100}
              className="py-4"
              data-testid="emi-slider"
            />

            <NumericFormat
              value={adjustedEmi}
              onValueChange={(values) => setAdjustedEmi(values.value)}
              thousandSeparator=","
              prefix="₹ "
              customInput={Input}
              placeholder={`₹ ${standardEMI.toLocaleString('en-IN')}`}
              className="h-12 rounded-lg border-stone-300 focus:ring-2 focus:ring-emerald-900/20 focus:border-emerald-900"
              data-testid="adjusted-emi-input"
            />
          </div>

          {!isValid && (
            <div className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg" data-testid="emi-validation-error">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900">Invalid EMI Amount</p>
                <p className="text-xs text-red-700 mt-1">
                  Adjusted EMI must be greater than or equal to the standard EMI of ₹{standardEMI.toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          )}

          {adjustedEmi && isValid && parseFloat(adjustedEmi) > standardEMI && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4" data-testid="emi-increase-info">
              <p className="text-sm font-medium text-emerald-900">
                Extra payment per month: ₹{(parseFloat(adjustedEmi) - standardEMI).toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-emerald-700 mt-1">
                This will significantly reduce your loan tenure and interest burden
              </p>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

export default EMIAdjustment;
