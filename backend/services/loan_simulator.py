from datetime import datetime, timedelta
from typing import List, Dict, Optional
from decimal import Decimal, ROUND_HALF_UP
import math

class LoanSimulator:
    def __init__(self, loan_data: dict):
        # Input validation
        if loan_data['loan_amount'] <= 0:
            raise ValueError("Loan amount must be positive")
        if loan_data['interest_rate'] < 0:
            raise ValueError("Interest rate cannot be negative")
        if loan_data['tenure_years'] <= 0:
            raise ValueError("Tenure must be positive")
            
        self.loan_amount = Decimal(str(loan_data['loan_amount']))
        self.annual_rate = Decimal(str(loan_data['interest_rate']))
        self.tenure_years = int(loan_data['tenure_years'])
        self.loan_start_date = datetime.strptime(loan_data['loan_start_date'], '%Y-%m-%d')
        self.loan_type = loan_data.get('loan_type', 'Home')
        self.processing_fee = Decimal(str(loan_data.get('processing_fee', 0)))
        
        # EMI adjustment
        self.adjusted_emi = Decimal(str(loan_data.get('adjusted_emi', 0))) if loan_data.get('adjusted_emi') else None
        
        # Periodic payments
        self.periodic_payments = loan_data.get('periodic_payments', [])
        
        # Adhoc payments
        self.adhoc_payments = loan_data.get('adhoc_payments', [])
        
        # Prepayment charges
        self.prepayment_charge_percent = Decimal(str(loan_data.get('prepayment_charge_percent', 0)))
        self.prepayment_fixed_fee = Decimal(str(loan_data.get('prepayment_fixed_fee', 0)))
        # Always use full loan tenure for prepayment charges
        self.prepayment_charge_years = self.tenure_years
        self.prepayment_inclusive = loan_data.get('prepayment_inclusive', True)
        
        # Bank preference
        self.bank_preference = loan_data.get('bank_preference', 'reduce_tenure')  # 'reduce_tenure' or 'reduce_emi'
        
        # Tax impact (optional)
        self.tax_slab = Decimal(str(loan_data.get('tax_slab', 0)))
        
        # Investment return for comparison
        self.investment_return = Decimal(str(loan_data.get('investment_return', 0)))
        
        self.monthly_rate = self.annual_rate / Decimal('1200')  # Convert to monthly decimal
        self.total_months = self.tenure_years * 12
        
    def calculate_emi(self, principal: Decimal, rate: Decimal, months: int) -> Decimal:
        """Calculate EMI using standard formula
        Note: rate should be monthly rate as decimal (e.g., 0.00708 for 8.5% annual)
        """
        if rate == 0:
            return principal / Decimal(str(months))
        
        # rate is already in decimal form (monthly_rate), no need to divide by 100 again
        emi = principal * rate * ((1 + rate) ** months) / (((1 + rate) ** months) - 1)
        return emi.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
    
    def calculate_standard_emi(self) -> Decimal:
        """Calculate standard EMI without adjustments"""
        return self.calculate_emi(self.loan_amount, self.monthly_rate, self.total_months)
    
    def get_prepayment_charge(self, amount: Decimal, month: int) -> Decimal:
        """Calculate prepayment charge"""
        years_elapsed = month / 12
        
        if self.prepayment_charge_years > 0 and years_elapsed > self.prepayment_charge_years:
            return Decimal('0')
        
        percent_charge = amount * self.prepayment_charge_percent / Decimal('100')
        total_charge = percent_charge + self.prepayment_fixed_fee
        
        return total_charge.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
    
    def get_periodic_payment(self, month: int) -> Decimal:
        """Get periodic payment for a given month"""
        total = Decimal('0')
        
        for payment in self.periodic_payments:
            amount = Decimal(str(payment['amount']))
            frequency = payment['frequency']  # 'monthly', 'quarterly', 'half_yearly', 'yearly'
            start_period = int(payment['start_period'])
            occurrences = int(payment['occurrences'])
            
            if month < start_period:
                continue
            
            months_from_start = month - start_period
            
            frequency_map = {
                'monthly': 1,
                'quarterly': 3,
                'half_yearly': 6,
                'yearly': 12
            }
            
            interval = frequency_map.get(frequency, 1)
            
            if months_from_start % interval == 0:
                occurrence_number = months_from_start // interval
                if occurrence_number < occurrences:
                    total += amount
        
        return total
    
    def get_adhoc_payment(self, current_date: datetime) -> Decimal:
        """Get adhoc payment for a given date"""
        total = Decimal('0')
        
        for payment in self.adhoc_payments:
            payment_date = datetime.strptime(payment['date'], '%Y-%m-%d')
            if payment_date.year == current_date.year and payment_date.month == current_date.month:
                amount = Decimal(str(payment['amount']))
                total += amount
        
        return total
    
    def simulate(self) -> Dict:
        """Run the loan simulation"""
        standard_emi = self.calculate_standard_emi()
        
        # Validate adjusted EMI
        if self.adjusted_emi and self.adjusted_emi < standard_emi:
            raise ValueError(f"Adjusted EMI ({self.adjusted_emi}) must be >= standard EMI ({standard_emi})")
        
        working_emi = self.adjusted_emi if self.adjusted_emi else standard_emi
        
        # Simulate original loan (no prepayments)
        original_schedule = self._simulate_original()
        original_tenure = original_schedule['summary']['actual_tenure']
        
        # Simulate optimized loan (with prepayments)
        optimized_schedule = self._simulate_optimized(working_emi)
        
        # Calculate interest saved
        interest_saved = float(original_schedule['summary']['total_interest'] - optimized_schedule['summary']['total_interest'])
        
        # Calculate investment comparison - PASS ORIGINAL TENURE
        investment_analysis = self._calculate_investment_comparison(optimized_schedule, original_tenure)
        
        # Add interest saved and recommendation to investment analysis
        if investment_analysis['enabled']:
            investment_analysis['interest_saved_by_prepaying'] = interest_saved
            investment_analysis['difference'] = investment_analysis['investment_future_value'] - interest_saved
            investment_analysis['recommendation'] = 'Invest' if investment_analysis['investment_future_value'] > interest_saved else 'Prepay'
        
        return {
            'standard_emi': float(standard_emi),
            'original': original_schedule['summary'],
            'optimized': optimized_schedule['summary'],
            'original_schedule': original_schedule['schedule'],
            'optimized_schedule': optimized_schedule['schedule'],
            'investment_analysis': investment_analysis,
            'savings': {
                'interest_saved': interest_saved,
                'years_saved': round((original_schedule['summary']['actual_tenure'] - optimized_schedule['summary']['actual_tenure']) / 12, 2),
                'months_saved': original_schedule['summary']['actual_tenure'] - optimized_schedule['summary']['actual_tenure']
            }
        }
    
    def _simulate_original(self) -> Dict:
        """Simulate original loan without any prepayments or adjustments"""
        schedule = []
        outstanding = self.loan_amount
        emi = self.calculate_standard_emi()
        total_interest = Decimal('0')
        current_date = self.loan_start_date
        month = 0
        
        while outstanding > Decimal('0.01') and month < self.total_months * 2:  # Safety limit
            month += 1
            
            interest = (outstanding * self.monthly_rate).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
            principal = emi - interest
            
            if principal > outstanding:
                principal = outstanding
                emi = principal + interest
            
            outstanding -= principal
            if outstanding < Decimal('0'):
                outstanding = Decimal('0')
            
            total_interest += interest
            
            schedule.append({
                'month': month,
                'date': current_date.strftime('%Y-%m-%d'),
                'opening_balance': float(outstanding + principal),
                'emi': float(emi),
                'principal': float(principal),
                'interest': float(interest),
                'closing_balance': float(outstanding)
            })
            
            current_date += timedelta(days=30)
        
        return {
            'summary': {
                'emi': float(emi),
                'actual_tenure': month,
                'total_interest': float(total_interest),
                'total_repayment': float(self.loan_amount + total_interest),
                'prepayment_charges': 0
            },
            'schedule': schedule
        }
    
    def _simulate_optimized(self, working_emi: Decimal) -> Dict:
        """Simulate optimized loan with prepayments and adjustments"""
        schedule = []
        outstanding = self.loan_amount
        total_interest = Decimal('0')
        total_prepayment_charges = Decimal('0')
        total_principal_paid = Decimal('0')
        total_extra_principal = Decimal('0')
        current_date = self.loan_start_date
        month = 0
        current_emi = working_emi
        
        while outstanding > Decimal('0.01') and month < self.total_months * 2:  # Safety limit
            month += 1
            
            # Calculate interest for this month
            interest = (outstanding * self.monthly_rate).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
            
            # Base principal from EMI
            emi_principal = current_emi - interest
            
            if emi_principal > outstanding:
                emi_principal = outstanding
                current_emi = emi_principal + interest
            
            # Get additional payments
            periodic_payment = self.get_periodic_payment(month)
            adhoc_payment = self.get_adhoc_payment(current_date)
            
            total_prepayment = periodic_payment + adhoc_payment
            prepayment_charge = Decimal('0')
            net_prepayment = total_prepayment
            
            if total_prepayment > Decimal('0'):
                if self.prepayment_inclusive:
                    # Payment includes charges
                    prepayment_charge = self.get_prepayment_charge(total_prepayment, month)
                    net_prepayment = total_prepayment - prepayment_charge
                else:
                    # Payment is pure principal, charge is separate
                    net_prepayment = total_prepayment
                    prepayment_charge = self.get_prepayment_charge(total_prepayment, month)
            
            total_prepayment_charges += prepayment_charge
            total_extra_principal += net_prepayment
            
            # Total principal reduction
            total_principal = emi_principal + net_prepayment
            
            if total_principal > outstanding:
                total_principal = outstanding
            
            outstanding -= total_principal
            if outstanding < Decimal('0'):
                outstanding = Decimal('0')
            
            total_interest += interest
            total_principal_paid += total_principal
            
            schedule.append({
                'month': month,
                'date': current_date.strftime('%Y-%m-%d'),
                'opening_balance': float(outstanding + total_principal),
                'emi': float(current_emi),
                'interest': float(interest),
                'emi_principal': float(emi_principal),
                'extra_principal': float(net_prepayment),
                'prepayment_charge': float(prepayment_charge),
                'total_principal': float(total_principal),
                'closing_balance': float(outstanding)
            })
            
            # Recalculate EMI if bank preference is to reduce EMI and there was prepayment
            if self.bank_preference == 'reduce_emi' and net_prepayment > Decimal('0') and outstanding > Decimal('0'):
                remaining_months = self.total_months - month
                if remaining_months > 0:
                    new_emi = self.calculate_emi(outstanding, self.monthly_rate, remaining_months)
                    if self.adjusted_emi:
                        # Keep adjusted EMI as minimum
                        current_emi = max(new_emi, self.adjusted_emi)
                    else:
                        current_emi = new_emi
            
            current_date += timedelta(days=30)
        
        return {
            'summary': {
                'emi': float(working_emi),
                'actual_tenure': month,
                'total_interest': float(total_interest),
                'total_repayment': float(self.loan_amount + total_interest + total_prepayment_charges),
                'prepayment_charges': float(total_prepayment_charges),
                'total_extra_principal': float(total_extra_principal)
            },
            'schedule': schedule
        }
    
    def _calculate_investment_comparison(self, optimized_schedule: Dict, original_tenure: int) -> Dict:
        """Calculate prepay vs invest comparison with detailed breakdown
        
        Breaks down FV by source:
        1. EMI Adjustment (extra EMI paid monthly)
        2. Periodic Payments (recurring prepayments)
        3. Adhoc Payments (one-time lump sums)
        """
        if self.investment_return == 0:
            return {
                'enabled': False
            }
        
        schedule = optimized_schedule['schedule']
        monthly_return = self.investment_return / Decimal('1200')
        
        # Track FV by source
        emi_adjustment_fv = Decimal('0')
        periodic_payments_fv = Decimal('0')
        adhoc_payments_fv = Decimal('0')
        
        emi_adjustment_total = Decimal('0')
        periodic_payments_total = Decimal('0')
        adhoc_payments_total = Decimal('0')
        
        # Standard EMI for comparison
        standard_emi = self.calculate_standard_emi()
        
        for entry in schedule:
            extra_principal = Decimal(str(entry.get('extra_principal', 0)))
            
            if extra_principal > Decimal('0'):
                remaining_months = original_tenure - entry['month']
                
                if remaining_months <= 0:
                    continue
                
                # Calculate FV for this payment
                if monthly_return > 0:
                    fv_multiplier = (1 + monthly_return) ** remaining_months
                else:
                    fv_multiplier = Decimal('1')
                
                # Determine the source of this prepayment
                current_emi = Decimal(str(entry.get('emi', standard_emi)))
                emi_principal = Decimal(str(entry.get('emi_principal', 0)))
                
                # EMI adjustment component (if EMI > standard EMI)
                if current_emi > standard_emi:
                    emi_adjustment_amount = emi_principal - (standard_emi - Decimal(str(entry.get('interest', 0))))
                    if emi_adjustment_amount > Decimal('0'):
                        # Cap at extra_principal to avoid double counting
                        emi_adjustment_amount = min(emi_adjustment_amount, extra_principal)
                        emi_adjustment_total += emi_adjustment_amount
                        emi_adjustment_fv += emi_adjustment_amount * fv_multiplier
                        extra_principal -= emi_adjustment_amount
                
                # Remaining extra_principal is from periodic or adhoc
                if extra_principal > Decimal('0'):
                    # Check if this month has adhoc payment
                    payment_date = entry.get('date', '')
                    has_adhoc = False
                    
                    if payment_date:
                        # Extract year-month from payment date
                        try:
                            from datetime import datetime
                            payment_dt = datetime.strptime(payment_date, '%Y-%m-%d')
                            payment_year_month = f"{payment_dt.year}-{payment_dt.month:02d}"
                            
                            for adhoc in self.adhoc_payments:
                                adhoc_date = adhoc['date']
                                adhoc_dt = datetime.strptime(adhoc_date, '%Y-%m-%d')
                                adhoc_year_month = f"{adhoc_dt.year}-{adhoc_dt.month:02d}"
                                
                                if payment_year_month == adhoc_year_month:
                                    # This is adhoc payment
                                    adhoc_payments_total += extra_principal
                                    adhoc_payments_fv += extra_principal * fv_multiplier
                                    has_adhoc = True
                                    break
                        except:
                            pass
                    
                    if not has_adhoc:
                        # This is periodic payment
                        periodic_payments_total += extra_principal
                        periodic_payments_fv += extra_principal * fv_multiplier
        
        total_investment_value = emi_adjustment_fv + periodic_payments_fv + adhoc_payments_fv
        total_prepayments = emi_adjustment_total + periodic_payments_total + adhoc_payments_total
        
        return {
            'enabled': True,
            'total_prepayments': float(total_prepayments),
            'investment_return_rate': float(self.investment_return),
            'investment_future_value': float(total_investment_value),
            'breakdown': {
                'emi_adjustment': {
                    'invested': float(emi_adjustment_total),
                    'future_value': float(emi_adjustment_fv),
                    'gain': float(emi_adjustment_fv - emi_adjustment_total)
                },
                'periodic_payments': {
                    'invested': float(periodic_payments_total),
                    'future_value': float(periodic_payments_fv),
                    'gain': float(periodic_payments_fv - periodic_payments_total)
                },
                'adhoc_payments': {
                    'invested': float(adhoc_payments_total),
                    'future_value': float(adhoc_payments_fv),
                    'gain': float(adhoc_payments_fv - adhoc_payments_total)
                }
            }
        }
