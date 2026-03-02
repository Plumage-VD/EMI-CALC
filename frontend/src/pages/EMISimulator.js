import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, DollarSign } from 'lucide-react';
import { Button } from '../components/ui/button';
import BasicLoanDetails from '../components/simulator/BasicLoanDetails';
import EMIAdjustment from '../components/simulator/EMIAdjustment';
import PeriodicPayments from '../components/simulator/PeriodicPayments';
import AdhocPayments from '../components/simulator/AdhocPayments';
import PrepaymentCharges from '../components/simulator/PrepaymentCharges';
import InvestmentComparison from '../components/simulator/InvestmentComparison';
import ResultsDashboard from '../components/simulator/ResultsDashboard';
import { toast } from 'sonner';

const EMISimulator = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  // Basic loan details
  const [loanAmount, setLoanAmount] = useState(5000000);
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenureYears, setTenureYears] = useState(20);
  const [loanStartDate, setLoanStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [loanType, setLoanType] = useState('Home');
  const [processingFee, setProcessingFee] = useState(0);

  // EMI adjustment
  const [adjustedEmi, setAdjustedEmi] = useState('');

  // Periodic payments
  const [periodicPayments, setPeriodicPayments] = useState([]);

  // Adhoc payments
  const [adhocPayments, setAdhocPayments] = useState([]);

  // Prepayment charges
  const [prepaymentChargePercent, setPrepaymentChargePercent] = useState(2);
  const [prepaymentFixedFee, setPrepaymentFixedFee] = useState(0);
  const [prepaymentChargeYears, setPrepaymentChargeYears] = useState(3);
  const [prepaymentInclusive, setPrepaymentInclusive] = useState(true);
  const [bankPreference, setBankPreference] = useState('reduce_tenure');

  // Investment comparison
  const [investmentReturn, setInvestmentReturn] = useState(12);

  const handleSimulate = async () => {
    setLoading(true);
    try {
      const payload = {
        loan_amount: loanAmount,
        interest_rate: interestRate,
        tenure_years: tenureYears,
        loan_start_date: loanStartDate,
        loan_type: loanType,
        processing_fee: processingFee,
        adjusted_emi: adjustedEmi ? parseFloat(adjustedEmi) : null,
        periodic_payments: periodicPayments,
        adhoc_payments: adhocPayments,
        prepayment_charge_percent: prepaymentChargePercent,
        prepayment_fixed_fee: prepaymentFixedFee,
        prepayment_charge_years: prepaymentChargeYears,
        prepayment_inclusive: prepaymentInclusive,
        bank_preference: bankPreference,
        investment_return: investmentReturn
      };

      const API_URL = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(`${API_URL}/api/simulate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Simulation failed');
      }

      const data = await response.json();
      setResults(data);
      toast.success('Simulation completed successfully!');
      
      // Scroll to results
      setTimeout(() => {
        document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      console.error('Simulation error:', error);
      toast.error(error.message || 'Failed to run simulation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loanData = {
    loan_amount: loanAmount,
    interest_rate: interestRate,
    tenure_years: tenureYears,
    loan_start_date: loanStartDate,
    loan_type: loanType,
    processing_fee: processingFee,
    adjusted_emi: adjustedEmi ? parseFloat(adjustedEmi) : null,
    periodic_payments: periodicPayments,
    adhoc_payments: adhocPayments,
    prepayment_charge_percent: prepaymentChargePercent,
    prepayment_fixed_fee: prepaymentFixedFee,
    prepayment_charge_years: prepaymentChargeYears,
    prepayment_inclusive: prepaymentInclusive,
    bank_preference: bankPreference,
    investment_return: investmentReturn
  };

  return (
    <div className="min-h-screen bg-stone-100">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass-effect border-b border-stone-200/50">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="rounded-full"
                data-testid="back-to-home-btn"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </Button>
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 rounded-full bg-emerald-900 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-emerald-900">EMI Simulator</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className=\"text-4xl sm:text-5xl font-bold text-stone-900 mb-4\">
            Optimize Your Loan Repayment
          </h1>
          <p className=\"text-lg text-stone-600 mb-12 max-w-3xl\">
            Configure your loan details and repayment strategy below. See real-time comparisons 
            between standard and optimized repayment scenarios.
          </p>

          {/* Input Sections */}
          <div className=\"space-y-8\">
            <BasicLoanDetails
              loanAmount={loanAmount}
              setLoanAmount={setLoanAmount}
              interestRate={interestRate}
              setInterestRate={setInterestRate}
              tenureYears={tenureYears}
              setTenureYears={setTenureYears}
              loanStartDate={loanStartDate}
              setLoanStartDate={setLoanStartDate}
              loanType={loanType}
              setLoanType={setLoanType}
              processingFee={processingFee}
              setProcessingFee={setProcessingFee}
            />

            <EMIAdjustment
              adjustedEmi={adjustedEmi}
              setAdjustedEmi={setAdjustedEmi}
              loanAmount={loanAmount}
              interestRate={interestRate}
              tenureYears={tenureYears}
            />

            <PeriodicPayments
              periodicPayments={periodicPayments}
              setPeriodicPayments={setPeriodicPayments}
            />

            <AdhocPayments
              adhocPayments={adhocPayments}
              setAdhocPayments={setAdhocPayments}
            />

            <PrepaymentCharges
              prepaymentChargePercent={prepaymentChargePercent}
              setPrepaymentChargePercent={setPrepaymentChargePercent}
              prepaymentFixedFee={prepaymentFixedFee}
              setPrepaymentFixedFee={setPrepaymentFixedFee}
              prepaymentChargeYears={prepaymentChargeYears}
              setPrepaymentChargeYears={setPrepaymentChargeYears}
              prepaymentInclusive={prepaymentInclusive}
              setPrepaymentInclusive={setPrepaymentInclusive}
              bankPreference={bankPreference}
              setBankPreference={setBankPreference}
            />

            <InvestmentComparison
              investmentReturn={investmentReturn}
              setInvestmentReturn={setInvestmentReturn}
            />

            {/* Simulate Button */}
            <div className=\"flex justify-center pt-8\">
              <Button
                onClick={handleSimulate}
                disabled={loading}
                className=\"rounded-full px-12 py-6 text-lg bg-emerald-900 hover:bg-emerald-800 transition-all active:scale-95 shadow-lg\"
                data-testid=\"simulate-btn\"
              >
                {loading ? 'Calculating...' : 'Run Simulation'}
              </Button>
            </div>
          </div>

          {/* Results Section */}
          {results && (
            <div id=\"results\" className=\"mt-16\">
              <ResultsDashboard results={results} loanData={loanData} />
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default EMISimulator;
