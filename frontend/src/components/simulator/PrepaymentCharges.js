import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign } from 'lucide-react';
import { Card } from '../ui/card';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';

export const PrepaymentCharges = ({
  prepaymentChargePercent,
  setPrepaymentChargePercent,
  prepaymentFixedFee,
  setPrepaymentFixedFee,
  prepaymentChargeYears,
  setPrepaymentChargeYears,
  prepaymentInclusive,
  setPrepaymentInclusive,
  bankPreference,
  setBankPreference
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <Card className="p-6 border border-stone-200 rounded-xl bg-white shadow-sm" data-testid="prepayment-charges-card">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-red-600/10 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-stone-900">Prepayment Charges & Bank Preference</h2>
            <p className="text-sm text-stone-600">Configure prepayment penalties</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-stone-700">Charge Percentage (%)</Label>
              <Input
                type="number"
                step="0.1"
                value={prepaymentChargePercent}
                onChange={(e) => setPrepaymentChargePercent(parseFloat(e.target.value) || 0)}
                className="h-10 rounded-lg border-stone-300 focus:ring-2 focus:ring-emerald-900/20 focus:border-emerald-900"
                data-testid="prepayment-charge-percent-input"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-stone-700">Fixed Fee (₹)</Label>
              <Input
                type="number"
                value={prepaymentFixedFee}
                onChange={(e) => setPrepaymentFixedFee(parseFloat(e.target.value) || 0)}
                className="h-10 rounded-lg border-stone-300 focus:ring-2 focus:ring-emerald-900/20 focus:border-emerald-900"
                data-testid="prepayment-fixed-fee-input"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-stone-700">Applicable Within (Years)</Label>
              <Input
                type="number"
                value={prepaymentChargeYears}
                onChange={(e) => setPrepaymentChargeYears(parseInt(e.target.value) || 0)}
                className="h-10 rounded-lg border-stone-300 focus:ring-2 focus:ring-emerald-900/20 focus:border-emerald-900"
                data-testid="prepayment-charge-years-input"
                placeholder="0 = Always applies"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium text-stone-700">Charge Calculation Method</Label>
            <RadioGroup value={prepaymentInclusive.toString()} onValueChange={(value) => setPrepaymentInclusive(value === 'true')}>
              <div className="flex items-center space-x-2 p-3 border border-stone-200 rounded-lg hover:bg-stone-50">
                <RadioGroupItem value="true" id="inclusive" data-testid="prepayment-inclusive-radio" />
                <Label htmlFor="inclusive" className="flex-1 cursor-pointer text-sm">
                  <span className="font-medium text-stone-900">Inclusive</span>
                  <p className="text-xs text-stone-600 mt-1">Payment amount includes charges (Net principal = Amount - Charges)</p>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border border-stone-200 rounded-lg hover:bg-stone-50">
                <RadioGroupItem value="false" id="exclusive" data-testid="prepayment-exclusive-radio" />
                <Label htmlFor="exclusive" className="flex-1 cursor-pointer text-sm">
                  <span className="font-medium text-stone-900">Exclusive</span>
                  <p className="text-xs text-stone-600 mt-1">Charges are separate (Full amount goes to principal + charges added separately)</p>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium text-stone-700">Bank Adjustment Preference on Prepayment</Label>
            <RadioGroup value={bankPreference} onValueChange={setBankPreference}>
              <div className="flex items-center space-x-2 p-3 border border-stone-200 rounded-lg hover:bg-stone-50">
                <RadioGroupItem value="reduce_tenure" id="reduce_tenure" data-testid="reduce-tenure-radio" />
                <Label htmlFor="reduce_tenure" className="flex-1 cursor-pointer text-sm">
                  <span className="font-medium text-stone-900">Reduce Tenure</span>
                  <p className="text-xs text-stone-600 mt-1">Keep EMI same, reduce loan duration</p>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border border-stone-200 rounded-lg hover:bg-stone-50">
                <RadioGroupItem value="reduce_emi" id="reduce_emi" data-testid="reduce-emi-radio" />
                <Label htmlFor="reduce_emi" className="flex-1 cursor-pointer text-sm">
                  <span className="font-medium text-stone-900">Reduce EMI</span>
                  <p className="text-xs text-stone-600 mt-1">Recalculate and reduce monthly EMI amount</p>
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default PrepaymentCharges;
