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
      <Card className="p-6 glass-card" data-testid="prepayment-charges-card">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-red-600/10 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Prepayment Charges & Bank Preference</h2>
            <p className="text-sm text-muted-foreground">Applies for full loan tenure</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Charge Percentage (%)</Label>
              <Input
                type="number"
                step="0.1"
                value={prepaymentChargePercent}
                onChange={(e) => setPrepaymentChargePercent(parseFloat(e.target.value) || 0)}
                className="h-10 rounded-lg"
                data-testid="prepayment-charge-percent-input"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Fixed Fee (₹)</Label>
              <Input
                type="number"
                value={prepaymentFixedFee}
                onChange={(e) => setPrepaymentFixedFee(parseFloat(e.target.value) || 0)}
                className="h-10 rounded-lg"
                data-testid="prepayment-fixed-fee-input"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Charge Calculation Method</Label>
            <RadioGroup value={prepaymentInclusive.toString()} onValueChange={(value) => setPrepaymentInclusive(value === 'true')}>
              <div className="flex items-center space-x-2 p-3 border border-border rounded-lg hover:bg-muted/50">
                <RadioGroupItem value="true" id="inclusive" data-testid="prepayment-inclusive-radio" />
                <Label htmlFor="inclusive" className="flex-1 cursor-pointer text-sm">
                  <span className="font-medium">Inclusive</span>
                  <p className="text-xs text-muted-foreground mt-1">Payment includes charges (Net principal = Amount - Charges)</p>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border border-border rounded-lg hover:bg-muted/50">
                <RadioGroupItem value="false" id="exclusive" data-testid="prepayment-exclusive-radio" />
                <Label htmlFor="exclusive" className="flex-1 cursor-pointer text-sm">
                  <span className="font-medium">Exclusive</span>
                  <p className="text-xs text-muted-foreground mt-1">Charges are separate (Full amount → principal + charges added)</p>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Bank Adjustment Preference</Label>
            <RadioGroup value={bankPreference} onValueChange={setBankPreference}>
              <div className="flex items-center space-x-2 p-3 border border-border rounded-lg hover:bg-muted/50">
                <RadioGroupItem value="reduce_tenure" id="reduce_tenure" data-testid="reduce-tenure-radio" />
                <Label htmlFor="reduce_tenure" className="flex-1 cursor-pointer text-sm">
                  <span className="font-medium">Reduce Tenure</span>
                  <p className="text-xs text-muted-foreground mt-1">Keep EMI same, reduce loan duration</p>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border border-border rounded-lg hover:bg-muted/50">
                <RadioGroupItem value="reduce_emi" id="reduce_emi" data-testid="reduce-emi-radio" />
                <Label htmlFor="reduce_emi" className="flex-1 cursor-pointer text-sm">
                  <span className="font-medium">Reduce EMI</span>
                  <p className="text-xs text-muted-foreground mt-1">Recalculate and reduce monthly EMI amount</p>
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
