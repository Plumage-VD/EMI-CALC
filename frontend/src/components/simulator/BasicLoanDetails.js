import React from 'react';
import { motion } from 'framer-motion';
import { Calculator } from 'lucide-react';
import { Card } from '../ui/card';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { NumericFormat } from 'react-number-format';
import { formatIndianCurrency } from '../../lib/formatters';

// Custom function for Indian thousand separator (XX,XX,XXX format)
const indianThousandSeparator = (numStr) => {
  const num = numStr.replace(/,/g, '');
  if (num.length <= 3) return num;
  
  let result = num.slice(-3);
  let remaining = num.slice(0, -3);
  
  while (remaining.length > 0) {
    const chunk = remaining.slice(-2);
    remaining = remaining.slice(0, -2);
    result = chunk + ',' + result;
  }
  
  return result;
};

export const BasicLoanDetails = ({
  loanAmount,
  setLoanAmount,
  interestRate,
  setInterestRate,
  tenureYears,
  setTenureYears,
  loanStartDate,
  setLoanStartDate,
  loanType,
  setLoanType,
  processingFee,
  setProcessingFee
}) => {
  // Calculate standard EMI for display
  const calculateEMI = () => {
    const P = loanAmount;
    const r = interestRate / 1200;
    const n = tenureYears * 12;
    
    if (r === 0) return P / n;
    
    const emi = P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
    return emi;
  };

  const standardEMI = calculateEMI();
  const totalRepayment = standardEMI * tenureYears * 12;
  const totalInterest = totalRepayment - loanAmount;

  // Format display value for loan amount input with Indian separators
  const formatLoanDisplay = (value) => {
    if (!value) return '';
    const numStr = String(Math.round(value));
    return indianThousandSeparator(numStr);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="p-6 border border-stone-200 rounded-xl bg-white shadow-sm" data-testid="basic-loan-details-card">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-emerald-900/10 flex items-center justify-center">
            <Calculator className="w-5 h-5 text-emerald-900" />
          </div>
          <h2 className="text-2xl font-bold text-stone-900">Basic Loan Details</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="loanAmount" className="text-sm font-medium text-stone-700">
              Loan Amount (₹)
            </Label>
            <NumericFormat
              id="loanAmount"
              value={loanAmount}
              onValueChange={(values) => setLoanAmount(values.floatValue || 0)}
              thousandsGroupStyle="lakh"
              thousandSeparator=","
              prefix="₹ "
              customInput={Input}
              className="h-12 rounded-lg border-stone-300 focus:ring-2 focus:ring-emerald-900/20 focus:border-emerald-900"
              data-testid="loan-amount-input"
            />
            <p className="text-xs text-stone-500">
              {loanAmount >= 10000000 
                ? `${(loanAmount / 10000000).toFixed(2)} Crores`
                : loanAmount >= 100000 
                  ? `${(loanAmount / 100000).toFixed(2)} Lakhs`
                  : ''}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="interestRate" className="text-sm font-medium text-stone-700">
              Interest Rate (% p.a.)
            </Label>
            <Input
              id="interestRate"
              type="number"
              step="0.01"
              value={interestRate}
              onChange={(e) => setInterestRate(parseFloat(e.target.value) || 0)}
              className="h-12 rounded-lg border-stone-300 focus:ring-2 focus:ring-emerald-900/20 focus:border-emerald-900"
              data-testid="interest-rate-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tenureYears" className="text-sm font-medium text-stone-700">
              Tenure (Years)
            </Label>
            <Input
              id="tenureYears"
              type="number"
              value={tenureYears}
              onChange={(e) => setTenureYears(parseInt(e.target.value) || 0)}
              className="h-12 rounded-lg border-stone-300 focus:ring-2 focus:ring-emerald-900/20 focus:border-emerald-900"
              data-testid="tenure-years-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="loanStartDate" className="text-sm font-medium text-stone-700">
              Loan Start Date
            </Label>
            <Input
              id="loanStartDate"
              type="date"
              value={loanStartDate}
              onChange={(e) => setLoanStartDate(e.target.value)}
              className="h-12 rounded-lg border-stone-300 focus:ring-2 focus:ring-emerald-900/20 focus:border-emerald-900"
              data-testid="loan-start-date-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="loanType" className="text-sm font-medium text-stone-700">
              Loan Type
            </Label>
            <Select value={loanType} onValueChange={setLoanType}>
              <SelectTrigger className="h-12 rounded-lg border-stone-300" data-testid="loan-type-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Home">Home Loan</SelectItem>
                <SelectItem value="Personal">Personal Loan</SelectItem>
                <SelectItem value="Car">Car Loan</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="processingFee" className="text-sm font-medium text-stone-700">
              Processing Fee (₹) <span className="text-stone-500">(Optional)</span>
            </Label>
            <NumericFormat
              id="processingFee"
              value={processingFee}
              onValueChange={(values) => setProcessingFee(values.floatValue || 0)}
              thousandsGroupStyle="lakh"
              thousandSeparator=","
              prefix="₹ "
              customInput={Input}
              className="h-12 rounded-lg border-stone-300 focus:ring-2 focus:ring-emerald-900/20 focus:border-emerald-900"
              data-testid="processing-fee-input"
            />
          </div>
        </div>

        {/* Quick Summary */}
        <div className="mt-8 pt-6 border-t border-stone-200">
          <h3 className="text-sm font-semibold text-stone-700 mb-4">Standard Loan Summary</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-stone-50 rounded-lg p-4">
              <p className="text-xs text-stone-600 mb-1">Standard EMI</p>
              <p className="text-xl font-mono font-bold text-emerald-900" data-testid="standard-emi-display">
                {formatIndianCurrency(standardEMI)}
              </p>
            </div>
            <div className="bg-stone-50 rounded-lg p-4">
              <p className="text-xs text-stone-600 mb-1">Total Interest</p>
              <p className="text-xl font-mono font-bold text-stone-900" data-testid="total-interest-display">
                {formatIndianCurrency(totalInterest)}
              </p>
            </div>
            <div className="bg-stone-50 rounded-lg p-4">
              <p className="text-xs text-stone-600 mb-1">Total Repayment</p>
              <p className="text-xl font-mono font-bold text-stone-900" data-testid="total-repayment-display">
                {formatIndianCurrency(totalRepayment)}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default BasicLoanDetails;
