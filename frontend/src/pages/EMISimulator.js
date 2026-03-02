import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { Button } from '../components/ui/button';
import Navigation from '../components/Navigation';
import BasicLoanDetails from '../components/simulator/BasicLoanDetails';
import EMIAdjustment from '../components/simulator/EMIAdjustment';
import PeriodicPayments from '../components/simulator/PeriodicPayments';
import AdhocPayments from '../components/simulator/AdhocPayments';
import PrepaymentCharges from '../components/simulator/PrepaymentCharges';
import InvestmentComparison from '../components/simulator/InvestmentComparison';
import ResultsDashboard from '../components/simulator/ResultsDashboard';
import AdvancedOptionsToggle from '../components/simulator/AdvancedOptionsToggle';
import { toast } from 'sonner';

const EMISimulator = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

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
    prepayment_inclusive: prepaymentInclusive,
    bank_preference: bankPreference,
    investment_return: investmentReturn
  };

  return (
    <div className="min-h-screen">
      <Navigation showCTA={false} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 mt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-4">
              Optimize Your{' '}
              <span className="bg-gradient-to-r from-[hsl(var(--brand-gold))] to-[hsl(var(--brand-gold-light))] bg-clip-text text-transparent">
                Loan Repayment
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Configure your loan details below and discover how much you can save with smart prepayment strategies
            </p>
          </div>

          {/* Input Sections */}
          <div className="space-y-6">
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

            <AdvancedOptionsToggle isOpen={showAdvanced} setIsOpen={setShowAdvanced}>
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
                prepaymentInclusive={prepaymentInclusive}
                setPrepaymentInclusive={setPrepaymentInclusive}
                bankPreference={bankPreference}
                setBankPreference={setBankPreference}
              />

              <InvestmentComparison
                investmentReturn={investmentReturn}
                setInvestmentReturn={setInvestmentReturn}
              />
            </AdvancedOptionsToggle>

            {/* Simulate Button */}
            <div className="flex justify-center pt-8">
              <Button
                onClick={handleSimulate}
                disabled={loading}
                className="premium-button text-lg h-16 px-12"
                data-testid="simulate-btn"
              >
                <Play className="w-5 h-5 mr-2" />
                {loading ? 'Calculating...' : 'Run Simulation'}
              </Button>
            </div>
          </div>

          {/* Results Section */}
          {results && (
            <div id="results" className="mt-16">
              <ResultsDashboard results={results} loanData={loanData} />
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default EMISimulator;
