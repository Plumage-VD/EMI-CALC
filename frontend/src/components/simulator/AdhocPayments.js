import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Plus, Trash2 } from 'lucide-react';
import { Card } from '../ui/card';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { NumericFormat } from 'react-number-format';

export const AdhocPayments = ({ adhocPayments, setAdhocPayments }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    amount: ''
  });

  const handleAdd = () => {
    if (formData.date && formData.amount) {
      setAdhocPayments([
        ...adhocPayments,
        {
          date: formData.date,
          amount: parseFloat(formData.amount)
        }
      ]);
      setFormData({ date: '', amount: '' });
      setShowForm(false);
    }
  };

  const handleRemove = (index) => {
    setAdhocPayments(adhocPayments.filter((_, i) => i !== index));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card className="p-6 border border-stone-200 rounded-xl bg-white shadow-sm" data-testid="adhoc-payments-card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-purple-600/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-stone-900">Adhoc Lump Sum Payments</h2>
              <p className="text-sm text-stone-600">One-time prepayments on specific dates</p>
            </div>
          </div>
          {!showForm && (
            <Button
              onClick={() => setShowForm(true)}
              className="rounded-full bg-purple-600 hover:bg-purple-700"
              size="sm"
              data-testid="add-adhoc-payment-btn"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Payment
            </Button>
          )}
        </div>

        {/* Existing Payments */}
        {adhocPayments.length > 0 && (
          <div className="space-y-3 mb-6">
            {adhocPayments.map((payment, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-stone-50 border border-stone-200 rounded-lg"
                data-testid={`adhoc-payment-${index}`}
              >
                <div className="flex-1">
                  <p className="font-mono text-lg font-semibold text-stone-900">
                    ₹{payment.amount.toLocaleString('en-IN')}
                  </p>
                  <p className="text-sm text-stone-600">
                    {formatDate(payment.date)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemove(index)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  data-testid={`remove-adhoc-payment-${index}`}
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
                <Label className="text-sm font-medium text-stone-700">Payment Date</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="h-10 rounded-lg"
                  data-testid="adhoc-date-input"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-stone-700">Amount (₹)</Label>
                <NumericFormat
                  value={formData.amount}
                  onValueChange={(values) => setFormData({ ...formData, amount: values.value })}
                  thousandSeparator=","
                  prefix="₹ "
                  customInput={Input}
                  className="h-10 rounded-lg"
                  data-testid="adhoc-amount-input"
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={handleAdd}
                className="rounded-full bg-purple-600 hover:bg-purple-700"
                data-testid="save-adhoc-payment-btn"
              >
                Add Payment
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setFormData({ date: '', amount: '' });
                }}
                className="rounded-full"
                data-testid="cancel-adhoc-payment-btn"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {adhocPayments.length === 0 && !showForm && (
          <div className="text-center py-8 text-stone-500">
            <p className="text-sm">No adhoc payments configured</p>
            <p className="text-xs mt-1">Click "Add Payment" to schedule one-time prepayments</p>
          </div>
        )}
      </Card>
    </motion.div>
  );
};

export default AdhocPayments;
