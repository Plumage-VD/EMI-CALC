import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Repeat, Plus, Trash2 } from 'lucide-react';
import { Card } from '../ui/card';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { NumericFormat } from 'react-number-format';

export const PeriodicPayments = ({ periodicPayments, setPeriodicPayments }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    frequency: 'monthly',
    start_period: '1',
    occurrences: ''
  });

  const handleAdd = () => {
    if (formData.amount && formData.start_period && formData.occurrences) {
      setPeriodicPayments([
        ...periodicPayments,
        {
          amount: parseFloat(formData.amount),
          frequency: formData.frequency,
          start_period: parseInt(formData.start_period),
          occurrences: parseInt(formData.occurrences)
        }
      ]);
      setFormData({ amount: '', frequency: 'monthly', start_period: '1', occurrences: '' });
      setShowForm(false);
    }
  };

  const handleRemove = (index) => {
    setPeriodicPayments(periodicPayments.filter((_, i) => i !== index));
  };

  const getFrequencyLabel = (freq) => {
    const labels = {
      monthly: 'Monthly',
      quarterly: 'Quarterly',
      half_yearly: 'Half-Yearly',
      yearly: 'Yearly'
    };
    return labels[freq] || freq;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="p-6 border border-stone-200 rounded-xl bg-white shadow-sm" data-testid="periodic-payments-card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600/10 flex items-center justify-center">
              <Repeat className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-stone-900">Periodic Additional Principal</h2>
              <p className="text-sm text-stone-600">Set up recurring prepayments</p>
            </div>
          </div>
          {!showForm && (
            <Button
              onClick={() => setShowForm(true)}
              className="rounded-full bg-blue-600 hover:bg-blue-700"
              size="sm"
              data-testid="add-periodic-payment-btn"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Payment
            </Button>
          )}
        </div>

        {/* Existing Payments */}
        {periodicPayments.length > 0 && (
          <div className="space-y-3 mb-6">
            {periodicPayments.map((payment, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-stone-50 border border-stone-200 rounded-lg"
                data-testid={`periodic-payment-${index}`}
              >
                <div className="flex-1">
                  <p className="font-mono text-lg font-semibold text-stone-900">
                    ₹{payment.amount.toLocaleString('en-IN')}
                  </p>
                  <p className="text-sm text-stone-600">
                    {getFrequencyLabel(payment.frequency)} from Period {payment.start_period} for {payment.occurrences} times
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemove(index)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  data-testid={`remove-periodic-payment-${index}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Add Form */}
        {showForm && (
          <div className="space-y-4 p-4 bg-stone-50 border border-stone-200 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-stone-700">Amount (₹)</Label>
                <NumericFormat
                  value={formData.amount}
                  onValueChange={(values) => setFormData({ ...formData, amount: values.value })}
                  thousandSeparator=","
                  prefix="₹ "
                  customInput={Input}
                  className="h-10 rounded-lg"
                  data-testid="periodic-amount-input"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-stone-700">Frequency</Label>
                <Select value={formData.frequency} onValueChange={(value) => setFormData({ ...formData, frequency: value })}>
                  <SelectTrigger className="h-10 rounded-lg" data-testid="periodic-frequency-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="half_yearly">Half-Yearly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-stone-700">Start Period (Month #)</Label>
                <Input
                  type="number"
                  value={formData.start_period}
                  onChange={(e) => setFormData({ ...formData, start_period: e.target.value })}
                  className="h-10 rounded-lg"
                  min="1"
                  data-testid="periodic-start-period-input"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-stone-700">Number of Occurrences</Label>
                <Input
                  type="number"
                  value={formData.occurrences}
                  onChange={(e) => setFormData({ ...formData, occurrences: e.target.value })}
                  className="h-10 rounded-lg"
                  min="1"
                  data-testid="periodic-occurrences-input"
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={handleAdd}
                className="rounded-full bg-blue-600 hover:bg-blue-700"
                data-testid="save-periodic-payment-btn"
              >
                Add Payment
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setFormData({ amount: '', frequency: 'monthly', start_period: '1', occurrences: '' });
                }}
                className="rounded-full"
                data-testid="cancel-periodic-payment-btn"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {periodicPayments.length === 0 && !showForm && (
          <div className="text-center py-8 text-stone-500">
            <p className="text-sm">No periodic payments configured</p>
            <p className="text-xs mt-1">Click "Add Payment" to set up recurring prepayments</p>
          </div>
        )}
      </Card>
    </motion.div>
  );
};

export default PeriodicPayments;
