import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Download, TrendingDown, Calendar, DollarSign, FileText, AlertCircle, Lightbulb } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { toast } from 'sonner';

export const ResultsDashboard = ({ results, loanData }) => {
  const [exportingExcel, setExportingExcel] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);

  const { original, optimized, savings, investment_analysis } = results;

  const handleExportExcel = async () => {
    setExportingExcel(true);
    try {
      const API_URL = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(`${API_URL}/api/export/excel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loanData)
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'loan_amortization.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Excel file downloaded successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export Excel file');
    } finally {
      setExportingExcel(false);
    }
  };

  const handleExportPdf = async () => {
    setExportingPdf(true);
    try {
      const API_URL = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(`${API_URL}/api/export/pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loanData)
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'loan_summary.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('PDF file downloaded successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export PDF file');
    } finally {
      setExportingPdf(false);
    }
  };

  // Prepare chart data
  const outstandingChartData = [];
  const maxLength = Math.max(results.original_schedule.length, results.optimized_schedule.length);
  
  for (let i = 0; i < maxLength; i++) {
    const originalEntry = results.original_schedule[i];
    const optimizedEntry = results.optimized_schedule[i];
    
    outstandingChartData.push({
      month: i + 1,
      original: originalEntry ? originalEntry.closing_balance : 0,
      optimized: optimizedEntry ? optimizedEntry.closing_balance : 0
    });
  }

  // Interest vs Principal per year
  const yearlyData = [];
  const optimizedSchedule = results.optimized_schedule;
  
  let currentYear = 1;
  let yearInterest = 0;
  let yearPrincipal = 0;
  
  optimizedSchedule.forEach((entry, index) => {
    yearInterest += entry.interest;
    yearPrincipal += entry.total_principal;
    
    if ((index + 1) % 12 === 0 || index === optimizedSchedule.length - 1) {
      yearlyData.push({
        year: currentYear,
        interest: Math.round(yearInterest),
        principal: Math.round(yearPrincipal)
      });
      currentYear++;
      yearInterest = 0;
      yearPrincipal = 0;
    }
  });

  // Cumulative interest comparison
  const cumulativeInterestData = [];
  let originalCumulative = 0;
  let optimizedCumulative = 0;
  
  for (let i = 0; i < maxLength; i++) {
    const originalEntry = results.original_schedule[i];
    const optimizedEntry = results.optimized_schedule[i];
    
    if (originalEntry) originalCumulative += originalEntry.interest;
    if (optimizedEntry) optimizedCumulative += optimizedEntry.interest;
    
    if ((i + 1) % 12 === 0 || i === maxLength - 1) {
      cumulativeInterestData.push({
        month: i + 1,
        original: Math.round(originalCumulative),
        optimized: Math.round(optimizedCumulative)
      });
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-2" data-testid="results-title">
            Simulation Results
          </h2>
          <p className="text-lg text-stone-600">
            Compare your original vs optimized loan scenario
          </p>
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={handleExportExcel}
            disabled={exportingExcel}
            className="rounded-full bg-emerald-900 hover:bg-emerald-800"
            data-testid="export-excel-btn"
          >
            <Download className="w-4 h-4 mr-2" />
            {exportingExcel ? 'Exporting...' : 'Excel'}
          </Button>
          <Button
            onClick={handleExportPdf}
            disabled={exportingPdf}
            className="rounded-full bg-amber-600 hover:bg-amber-700"
            data-testid="export-pdf-btn"
          >
            <FileText className="w-4 h-4 mr-2" />
            {exportingPdf ? 'Exporting...' : 'PDF'}
          </Button>
        </div>
      </div>

      {/* Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 border border-stone-200 rounded-xl bg-white">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-900/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-900" />
            </div>
            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full" data-testid="emi-badge">
              EMI
            </span>
          </div>
          <p className="text-xs text-stone-600 mb-1">Monthly EMI</p>
          <p className="text-2xl font-mono font-bold text-stone-900" data-testid="optimized-emi">
            ₹{Math.round(optimized.emi).toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-stone-500 mt-1">
            Original: ₹{Math.round(original.emi).toLocaleString('en-IN')}
          </p>
        </Card>

        <Card className="p-6 border border-stone-200 rounded-xl bg-white">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded-full" data-testid="tenure-badge">
              Saved
            </span>
          </div>
          <p className="text-xs text-stone-600 mb-1">Tenure Saved</p>
          <p className="text-2xl font-mono font-bold text-blue-900" data-testid="years-saved">
            {savings.years_saved} years
          </p>
          <p className="text-xs text-stone-500 mt-1">
            {savings.months_saved} months saved
          </p>
        </Card>

        <Card className="p-6 border border-stone-200 rounded-xl bg-white">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-green-600/10 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded-full" data-testid="interest-badge">
              Saved
            </span>
          </div>
          <p className="text-xs text-stone-600 mb-1">Interest Saved</p>
          <p className="text-2xl font-mono font-bold text-green-900" data-testid="interest-saved">
            ₹{Math.round(savings.interest_saved).toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-stone-500 mt-1">
            vs ₹{Math.round(original.total_interest).toLocaleString('en-IN')} original
          </p>
        </Card>

        <Card className="p-6 border border-stone-200 rounded-xl bg-white">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-amber-600/10 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-1 rounded-full" data-testid="charges-badge">
              Charges
            </span>
          </div>
          <p className="text-xs text-stone-600 mb-1">Prepayment Charges</p>
          <p className="text-2xl font-mono font-bold text-amber-900" data-testid="prepayment-charges">
            ₹{Math.round(optimized.prepayment_charges).toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-stone-500 mt-1">
            Total fees paid
          </p>
        </Card>
      </div>

      {/* Detailed Comparison Table */}
      <Card className="p-6 border border-stone-200 rounded-xl bg-white">
        <h3 className="text-xl font-bold text-stone-900 mb-4">Detailed Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full" data-testid="comparison-table">
            <thead>
              <tr className="border-b border-stone-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-stone-700">Metric</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-stone-700">Original</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-stone-700">Optimized</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-stone-700">Difference</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-stone-100">
                <td className="py-3 px-4 text-sm text-stone-900">EMI</td>
                <td className="py-3 px-4 text-sm text-right font-mono">₹{Math.round(original.emi).toLocaleString('en-IN')}</td>
                <td className="py-3 px-4 text-sm text-right font-mono">₹{Math.round(optimized.emi).toLocaleString('en-IN')}</td>
                <td className="py-3 px-4 text-sm text-right font-mono">-</td>
              </tr>
              <tr className="border-b border-stone-100">
                <td className="py-3 px-4 text-sm text-stone-900">Tenure (months)</td>
                <td className="py-3 px-4 text-sm text-right font-mono">{original.actual_tenure}</td>
                <td className="py-3 px-4 text-sm text-right font-mono">{optimized.actual_tenure}</td>
                <td className="py-3 px-4 text-sm text-right font-mono text-green-700">{savings.months_saved}</td>
              </tr>
              <tr className="border-b border-stone-100">
                <td className="py-3 px-4 text-sm text-stone-900">Total Interest</td>
                <td className="py-3 px-4 text-sm text-right font-mono">₹{Math.round(original.total_interest).toLocaleString('en-IN')}</td>
                <td className="py-3 px-4 text-sm text-right font-mono">₹{Math.round(optimized.total_interest).toLocaleString('en-IN')}</td>
                <td className="py-3 px-4 text-sm text-right font-mono text-green-700">₹{Math.round(savings.interest_saved).toLocaleString('en-IN')}</td>
              </tr>
              <tr className="border-b border-stone-100">
                <td className="py-3 px-4 text-sm text-stone-900">Prepayment Charges</td>
                <td className="py-3 px-4 text-sm text-right font-mono">₹0</td>
                <td className="py-3 px-4 text-sm text-right font-mono">₹{Math.round(optimized.prepayment_charges).toLocaleString('en-IN')}</td>
                <td className="py-3 px-4 text-sm text-right font-mono">-</td>
              </tr>
              <tr className="bg-stone-50">
                <td className="py-3 px-4 text-sm font-semibold text-stone-900">Total Repayment</td>
                <td className="py-3 px-4 text-sm text-right font-mono font-semibold">₹{Math.round(original.total_repayment).toLocaleString('en-IN')}</td>
                <td className="py-3 px-4 text-sm text-right font-mono font-semibold">₹{Math.round(optimized.total_repayment).toLocaleString('en-IN')}</td>
                <td className="py-3 px-4 text-sm text-right font-mono font-semibold text-green-700">₹{Math.round(original.total_repayment - optimized.total_repayment).toLocaleString('en-IN')}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Investment Analysis */}
      {investment_analysis.enabled && (
        <Card className="p-6 border border-amber-200 rounded-xl bg-amber-50">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-lg bg-amber-600 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-amber-900 mb-4">Prepay vs Invest Analysis</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-amber-800 mb-2">If you had invested prepayments @ {investment_analysis.investment_return_rate}% p.a.</p>
                  <p className="text-2xl font-mono font-bold text-amber-900">
                    ₹{Math.round(investment_analysis.investment_future_value).toLocaleString('en-IN')}
                  </p>
                  <p className="text-xs text-amber-700 mt-1">Future value of investments</p>
                </div>
                
                <div>
                  <p className="text-sm text-amber-800 mb-2">Interest saved by prepaying</p>
                  <p className="text-2xl font-mono font-bold text-amber-900">
                    ₹{Math.round(savings.interest_saved).toLocaleString('en-IN')}
                  </p>
                  <p className="text-xs text-amber-700 mt-1">Total interest saved</p>
                </div>
              </div>

              <div className={`p-4 rounded-lg border-2 ${investment_analysis.recommendation === 'Invest' ? 'bg-green-50 border-green-300' : 'bg-blue-50 border-blue-300'}`}>
                <div className="flex items-center space-x-2">
                  <AlertCircle className={`w-5 h-5 ${investment_analysis.recommendation === 'Invest' ? 'text-green-700' : 'text-blue-700'}`} />
                  <p className={`font-semibold ${investment_analysis.recommendation === 'Invest' ? 'text-green-900' : 'text-blue-900'}`}>
                    Recommendation: {investment_analysis.recommendation}
                  </p>
                </div>
                <p className={`text-sm mt-2 ${investment_analysis.recommendation === 'Invest' ? 'text-green-800' : 'text-blue-800'}`}>
                  {investment_analysis.recommendation === 'Invest' 
                    ? `Investing your prepayments could yield ₹${Math.round(Math.abs(investment_analysis.difference)).toLocaleString('en-IN')} more than prepaying the loan.`
                    : `Prepaying your loan saves you ₹${Math.round(Math.abs(investment_analysis.difference)).toLocaleString('en-IN')} more than investing at ${investment_analysis.investment_return_rate}% returns.`
                  }
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Charts */}
      <Card className="p-6 border border-stone-200 rounded-xl bg-white">
        <Tabs defaultValue="outstanding" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="outstanding" data-testid="outstanding-chart-tab">Outstanding Balance</TabsTrigger>
            <TabsTrigger value="yearly" data-testid="yearly-chart-tab">Yearly Breakdown</TabsTrigger>
            <TabsTrigger value="cumulative" data-testid="cumulative-chart-tab">Cumulative Interest</TabsTrigger>
          </TabsList>

          <TabsContent value="outstanding" className="mt-6">
            <h3 className="text-lg font-semibold text-stone-900 mb-4">Outstanding Principal Over Time</h3>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={outstandingChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                <XAxis dataKey="month" stroke="#57534e" />
                <YAxis stroke="#57534e" tickFormatter={(value) => `₹${(value / 100000).toFixed(0)}L`} />
                <Tooltip 
                  formatter={(value) => `₹${Math.round(value).toLocaleString('en-IN')}`}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e7e5e4', borderRadius: '8px' }}
                />
                <Legend />
                <Area type="monotone" dataKey="original" stroke="#78716c" fill="#d6d3d1" name="Original" />
                <Area type="monotone" dataKey="optimized" stroke="#064e3b" fill="#10b981" name="Optimized" />
              </AreaChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="yearly" className="mt-6">
            <h3 className="text-lg font-semibold text-stone-900 mb-4">Interest vs Principal Per Year</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={yearlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                <XAxis dataKey="year" stroke="#57534e" />
                <YAxis stroke="#57534e" tickFormatter={(value) => `₹${(value / 100000).toFixed(0)}L`} />
                <Tooltip 
                  formatter={(value) => `₹${Math.round(value).toLocaleString('en-IN')}`}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e7e5e4', borderRadius: '8px' }}
                />
                <Legend />
                <Bar dataKey="interest" fill="#ef4444" name="Interest" />
                <Bar dataKey="principal" fill="#064e3b" name="Principal" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="cumulative" className="mt-6">
            <h3 className="text-lg font-semibold text-stone-900 mb-4">Cumulative Interest Comparison</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={cumulativeInterestData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                <XAxis dataKey="month" stroke="#57534e" />
                <YAxis stroke="#57534e" tickFormatter={(value) => `₹${(value / 100000).toFixed(0)}L`} />
                <Tooltip 
                  formatter={(value) => `₹${Math.round(value).toLocaleString('en-IN')}`}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e7e5e4', borderRadius: '8px' }}
                />
                <Legend />
                <Line type="monotone" dataKey="original" stroke="#78716c" strokeWidth={2} name="Original" />
                <Line type="monotone" dataKey="optimized" stroke="#064e3b" strokeWidth={2} name="Optimized" />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Advisory Note */}
      {savings.interest_saved > 0 && (
        <Card className="p-6 border border-emerald-200 rounded-xl bg-emerald-50">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center flex-shrink-0">
              <Lightbulb className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-emerald-900 mb-2">Financial Advisory</h3>
              <p className="text-sm text-emerald-800 leading-relaxed">
                By implementing this optimized repayment strategy, you can save <strong>₹{Math.round(savings.interest_saved).toLocaleString('en-IN')}</strong> in interest 
                and become loan-free <strong>{savings.years_saved} years</strong> earlier. This is a significant financial achievement that puts you on the path to true financial freedom. 
                Consider setting up automatic transfers for your periodic prepayments to stay on track.
              </p>
            </div>
          </div>
        </Card>
      )}
    </motion.div>
  );
};

export default ResultsDashboard;
