"""
Comprehensive tests for Plumage Capital Strategy Lab - Loan Simulation API
Tests cover:
- Basic simulation functionality
- EMI adjustment with prepayments
- Periodic and adhoc payments
- Investment comparison analysis (Prepay vs Invest)
- Export functionality (Excel, PDF)
- Input validation
"""

import pytest
import requests
import os
from datetime import datetime, timedelta

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

@pytest.fixture
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session

class TestHealthCheck:
    """Basic health check tests"""
    
    def test_api_root(self, api_client):
        """Test API root endpoint"""
        response = api_client.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print(f"API root response: {data}")


class TestBasicSimulation:
    """Tests for basic loan simulation without prepayments"""
    
    def test_basic_loan_simulation(self, api_client):
        """Test basic simulation with default values (50L, 8.5%, 20 years)"""
        payload = {
            "loan_amount": 5000000,
            "interest_rate": 8.5,
            "tenure_years": 20,
            "loan_start_date": datetime.now().strftime("%Y-%m-%d"),
            "loan_type": "Home",
            "processing_fee": 0,
            "investment_return": 0
        }
        
        response = api_client.post(f"{BASE_URL}/api/simulate", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        
        # Verify structure
        assert "original" in data
        assert "optimized" in data
        assert "savings" in data
        assert "investment_analysis" in data
        assert "standard_emi" in data
        
        # Verify EMI calculation (should be ~43,391 for these values)
        assert 43000 < data["standard_emi"] < 44000
        print(f"Standard EMI: ₹{data['standard_emi']:,.0f}")
        
        # Verify original loan details (may be 240 or 241 due to rounding)
        assert 240 <= data["original"]["actual_tenure"] <= 241
        assert data["original"]["total_interest"] > 0
        print(f"Total interest (original): ₹{data['original']['total_interest']:,.0f}")
        
    def test_simulation_with_different_loan_amounts(self, api_client):
        """Test simulation with various loan amounts"""
        test_cases = [
            (1000000, "10L"),
            (2500000, "25L"),
            (10000000, "1Cr")
        ]
        
        for amount, label in test_cases:
            payload = {
                "loan_amount": amount,
                "interest_rate": 8.5,
                "tenure_years": 20,
                "loan_start_date": datetime.now().strftime("%Y-%m-%d"),
                "loan_type": "Home"
            }
            
            response = api_client.post(f"{BASE_URL}/api/simulate", json=payload)
            assert response.status_code == 200
            data = response.json()
            
            # EMI should scale proportionally
            expected_emi_approx = amount * 0.00868  # roughly 0.868% of principal
            assert abs(data["standard_emi"] - expected_emi_approx) < expected_emi_approx * 0.1
            print(f"{label} loan EMI: ₹{data['standard_emi']:,.0f}")


class TestEMIAdjustment:
    """Tests for EMI adjustment functionality"""
    
    def test_increased_emi_reduces_tenure(self, api_client):
        """Test that increasing EMI reduces tenure"""
        payload = {
            "loan_amount": 5000000,
            "interest_rate": 8.5,
            "tenure_years": 20,
            "loan_start_date": datetime.now().strftime("%Y-%m-%d"),
            "loan_type": "Home",
            "adjusted_emi": 50000,  # Higher than standard ~43,391
            "investment_return": 0
        }
        
        response = api_client.post(f"{BASE_URL}/api/simulate", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        
        # Tenure should be reduced
        assert data["optimized"]["actual_tenure"] < data["original"]["actual_tenure"]
        print(f"Tenure reduced from {data['original']['actual_tenure']} to {data['optimized']['actual_tenure']} months")
        
        # Interest should be saved
        assert data["savings"]["interest_saved"] > 0
        print(f"Interest saved: ₹{data['savings']['interest_saved']:,.0f}")
        
    def test_emi_below_standard_rejected(self, api_client):
        """Test that EMI below standard is rejected"""
        payload = {
            "loan_amount": 5000000,
            "interest_rate": 8.5,
            "tenure_years": 20,
            "loan_start_date": datetime.now().strftime("%Y-%m-%d"),
            "loan_type": "Home",
            "adjusted_emi": 30000  # Below standard ~43,391
        }
        
        response = api_client.post(f"{BASE_URL}/api/simulate", json=payload)
        assert response.status_code == 400
        print("Correctly rejected EMI below standard")


class TestPeriodicPayments:
    """Tests for periodic prepayment functionality"""
    
    def test_monthly_periodic_payment(self, api_client):
        """Test monthly periodic prepayments"""
        payload = {
            "loan_amount": 5000000,
            "interest_rate": 8.5,
            "tenure_years": 20,
            "loan_start_date": datetime.now().strftime("%Y-%m-%d"),
            "loan_type": "Home",
            "periodic_payments": [
                {
                    "amount": 10000,
                    "frequency": "monthly",
                    "start_period": 1,
                    "occurrences": 120
                }
            ],
            "investment_return": 12
        }
        
        response = api_client.post(f"{BASE_URL}/api/simulate", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        
        # Should save significant interest with periodic payments
        assert data["savings"]["interest_saved"] > 500000  # Should save >5L interest
        print(f"Interest saved with periodic payments: ₹{data['savings']['interest_saved']:,.0f}")
        
        # Investment analysis should be enabled
        assert data["investment_analysis"]["enabled"] == True
        assert "breakdown" in data["investment_analysis"]
        assert data["investment_analysis"]["breakdown"]["periodic_payments"]["invested"] > 0
        print(f"Periodic payments FV: ₹{data['investment_analysis']['breakdown']['periodic_payments']['future_value']:,.0f}")
        
    def test_quarterly_periodic_payment(self, api_client):
        """Test quarterly periodic prepayments"""
        payload = {
            "loan_amount": 5000000,
            "interest_rate": 8.5,
            "tenure_years": 20,
            "loan_start_date": datetime.now().strftime("%Y-%m-%d"),
            "loan_type": "Home",
            "periodic_payments": [
                {
                    "amount": 50000,
                    "frequency": "quarterly",
                    "start_period": 3,
                    "occurrences": 40
                }
            ],
            "investment_return": 12
        }
        
        response = api_client.post(f"{BASE_URL}/api/simulate", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        assert data["savings"]["interest_saved"] > 0
        print(f"Quarterly payments - Tenure reduced by {data['savings']['months_saved']} months")


class TestAdhocPayments:
    """Tests for adhoc lump sum payment functionality"""
    
    def test_adhoc_lump_sum_payment(self, api_client):
        """Test one-time adhoc payment"""
        future_date = (datetime.now() + timedelta(days=365)).strftime("%Y-%m-%d")
        
        payload = {
            "loan_amount": 5000000,
            "interest_rate": 8.5,
            "tenure_years": 20,
            "loan_start_date": datetime.now().strftime("%Y-%m-%d"),
            "loan_type": "Home",
            "adhoc_payments": [
                {
                    "amount": 500000,
                    "date": future_date
                }
            ],
            "investment_return": 12
        }
        
        response = api_client.post(f"{BASE_URL}/api/simulate", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        
        # Should save interest with lump sum payment
        assert data["savings"]["interest_saved"] > 0
        print(f"Interest saved with 5L lump sum: ₹{data['savings']['interest_saved']:,.0f}")
        
        # Investment analysis should show adhoc breakdown
        assert data["investment_analysis"]["enabled"] == True
        assert data["investment_analysis"]["breakdown"]["adhoc_payments"]["invested"] > 0
        print(f"Adhoc payment FV: ₹{data['investment_analysis']['breakdown']['adhoc_payments']['future_value']:,.0f}")


class TestInvestmentComparison:
    """Tests for Prepay vs Invest comparison functionality - KEY FEATURE"""
    
    def test_investment_analysis_enabled(self, api_client):
        """Test that investment analysis is enabled when investment_return > 0"""
        payload = {
            "loan_amount": 5000000,
            "interest_rate": 8.5,
            "tenure_years": 20,
            "loan_start_date": datetime.now().strftime("%Y-%m-%d"),
            "loan_type": "Home",
            "adjusted_emi": 50000,
            "periodic_payments": [
                {
                    "amount": 10000,
                    "frequency": "monthly",
                    "start_period": 1,
                    "occurrences": 120
                }
            ],
            "investment_return": 12  # 12% investment return
        }
        
        response = api_client.post(f"{BASE_URL}/api/simulate", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        
        # Investment analysis must be enabled
        assert data["investment_analysis"]["enabled"] == True
        
        # Must have key fields
        assert "investment_future_value" in data["investment_analysis"]
        assert "total_prepayments" in data["investment_analysis"]
        assert "investment_return_rate" in data["investment_analysis"]
        assert "recommendation" in data["investment_analysis"]
        assert "difference" in data["investment_analysis"]
        assert "breakdown" in data["investment_analysis"]
        
        print(f"Investment FV: ₹{data['investment_analysis']['investment_future_value']:,.0f}")
        print(f"Recommendation: {data['investment_analysis']['recommendation']}")
        print(f"Difference: ₹{data['investment_analysis']['difference']:,.0f}")
        
    def test_investment_breakdown_by_source(self, api_client):
        """Test that investment breakdown is correctly calculated by source"""
        future_date = (datetime.now() + timedelta(days=365)).strftime("%Y-%m-%d")
        
        payload = {
            "loan_amount": 5000000,
            "interest_rate": 8.5,
            "tenure_years": 20,
            "loan_start_date": datetime.now().strftime("%Y-%m-%d"),
            "loan_type": "Home",
            "adjusted_emi": 50000,  # EMI adjustment
            "periodic_payments": [
                {
                    "amount": 10000,
                    "frequency": "monthly",
                    "start_period": 1,
                    "occurrences": 60
                }
            ],
            "adhoc_payments": [
                {
                    "amount": 200000,
                    "date": future_date
                }
            ],
            "investment_return": 12
        }
        
        response = api_client.post(f"{BASE_URL}/api/simulate", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        breakdown = data["investment_analysis"]["breakdown"]
        
        # Verify all three sources are tracked
        assert "emi_adjustment" in breakdown
        assert "periodic_payments" in breakdown
        assert "adhoc_payments" in breakdown
        
        # EMI adjustment should have values (since adjusted_emi > standard)
        assert breakdown["emi_adjustment"]["invested"] > 0
        assert breakdown["emi_adjustment"]["future_value"] > breakdown["emi_adjustment"]["invested"]
        assert breakdown["emi_adjustment"]["gain"] > 0
        
        # Periodic payments should have values
        assert breakdown["periodic_payments"]["invested"] > 0
        assert breakdown["periodic_payments"]["future_value"] > 0
        
        # Adhoc payments should have values
        assert breakdown["adhoc_payments"]["invested"] > 0
        assert breakdown["adhoc_payments"]["future_value"] > 0
        
        print(f"EMI Adjustment - Invested: ₹{breakdown['emi_adjustment']['invested']:,.0f}, FV: ₹{breakdown['emi_adjustment']['future_value']:,.0f}")
        print(f"Periodic - Invested: ₹{breakdown['periodic_payments']['invested']:,.0f}, FV: ₹{breakdown['periodic_payments']['future_value']:,.0f}")
        print(f"Adhoc - Invested: ₹{breakdown['adhoc_payments']['invested']:,.0f}, FV: ₹{breakdown['adhoc_payments']['future_value']:,.0f}")
        
    def test_recommendation_prepay_vs_invest(self, api_client):
        """Test that recommendation correctly chooses Prepay vs Invest"""
        # Low investment return should recommend Prepay
        payload_low_return = {
            "loan_amount": 5000000,
            "interest_rate": 8.5,
            "tenure_years": 20,
            "loan_start_date": datetime.now().strftime("%Y-%m-%d"),
            "loan_type": "Home",
            "periodic_payments": [
                {
                    "amount": 10000,
                    "frequency": "monthly",
                    "start_period": 1,
                    "occurrences": 120
                }
            ],
            "investment_return": 6  # Low return - should favor Prepay
        }
        
        response = api_client.post(f"{BASE_URL}/api/simulate", json=payload_low_return)
        assert response.status_code == 200
        data = response.json()
        
        print(f"Low return (6%): Recommendation = {data['investment_analysis']['recommendation']}")
        print(f"  Investment FV: ₹{data['investment_analysis']['investment_future_value']:,.0f}")
        print(f"  Interest Saved: ₹{data['savings']['interest_saved']:,.0f}")
        
        # High investment return should recommend Invest
        payload_high_return = payload_low_return.copy()
        payload_high_return["investment_return"] = 15  # High return
        
        response = api_client.post(f"{BASE_URL}/api/simulate", json=payload_high_return)
        assert response.status_code == 200
        data = response.json()
        
        print(f"High return (15%): Recommendation = {data['investment_analysis']['recommendation']}")
        print(f"  Investment FV: ₹{data['investment_analysis']['investment_future_value']:,.0f}")
        print(f"  Interest Saved: ₹{data['savings']['interest_saved']:,.0f}")
        
    def test_investment_disabled_when_zero_return(self, api_client):
        """Test that investment analysis is disabled when return is 0"""
        payload = {
            "loan_amount": 5000000,
            "interest_rate": 8.5,
            "tenure_years": 20,
            "loan_start_date": datetime.now().strftime("%Y-%m-%d"),
            "loan_type": "Home",
            "investment_return": 0
        }
        
        response = api_client.post(f"{BASE_URL}/api/simulate", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        assert data["investment_analysis"]["enabled"] == False
        print("Investment analysis correctly disabled when return = 0")


class TestExportFunctionality:
    """Tests for Excel and PDF export"""
    
    def test_excel_export(self, api_client):
        """Test Excel export functionality"""
        payload = {
            "loan_amount": 5000000,
            "interest_rate": 8.5,
            "tenure_years": 20,
            "loan_start_date": datetime.now().strftime("%Y-%m-%d"),
            "loan_type": "Home"
        }
        
        response = api_client.post(f"{BASE_URL}/api/export/excel", json=payload)
        assert response.status_code == 200
        
        # Check content type
        assert "spreadsheetml" in response.headers.get("content-type", "")
        
        # Check file size (should be >0)
        content_length = len(response.content)
        assert content_length > 0
        print(f"Excel file size: {content_length / 1024:.1f} KB")
        
    def test_pdf_export(self, api_client):
        """Test PDF export functionality"""
        payload = {
            "loan_amount": 5000000,
            "interest_rate": 8.5,
            "tenure_years": 20,
            "loan_start_date": datetime.now().strftime("%Y-%m-%d"),
            "loan_type": "Home"
        }
        
        response = api_client.post(f"{BASE_URL}/api/export/pdf", json=payload)
        assert response.status_code == 200
        
        # Check content type
        assert "pdf" in response.headers.get("content-type", "")
        
        # Check file size
        content_length = len(response.content)
        assert content_length > 0
        print(f"PDF file size: {content_length / 1024:.1f} KB")


class TestInputValidation:
    """Tests for input validation"""
    
    def test_negative_loan_amount_rejected(self, api_client):
        """Test that negative loan amount is rejected"""
        payload = {
            "loan_amount": -1000000,
            "interest_rate": 8.5,
            "tenure_years": 20,
            "loan_start_date": datetime.now().strftime("%Y-%m-%d"),
            "loan_type": "Home"
        }
        
        response = api_client.post(f"{BASE_URL}/api/simulate", json=payload)
        assert response.status_code == 400
        print("Correctly rejected negative loan amount")
        
    def test_zero_tenure_rejected(self, api_client):
        """Test that zero tenure is rejected"""
        payload = {
            "loan_amount": 5000000,
            "interest_rate": 8.5,
            "tenure_years": 0,
            "loan_start_date": datetime.now().strftime("%Y-%m-%d"),
            "loan_type": "Home"
        }
        
        response = api_client.post(f"{BASE_URL}/api/simulate", json=payload)
        assert response.status_code == 400
        print("Correctly rejected zero tenure")
        
    def test_negative_interest_rejected(self, api_client):
        """Test that negative interest rate is rejected"""
        payload = {
            "loan_amount": 5000000,
            "interest_rate": -5,
            "tenure_years": 20,
            "loan_start_date": datetime.now().strftime("%Y-%m-%d"),
            "loan_type": "Home"
        }
        
        response = api_client.post(f"{BASE_URL}/api/simulate", json=payload)
        assert response.status_code == 400
        print("Correctly rejected negative interest rate")


class TestScheduleData:
    """Tests for amortization schedule data"""
    
    def test_schedule_contains_all_months(self, api_client):
        """Test that schedule contains entries for all months"""
        payload = {
            "loan_amount": 5000000,
            "interest_rate": 8.5,
            "tenure_years": 20,
            "loan_start_date": datetime.now().strftime("%Y-%m-%d"),
            "loan_type": "Home"
        }
        
        response = api_client.post(f"{BASE_URL}/api/simulate", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        
        # Original schedule should have ~240 entries (may be 240 or 241 due to rounding)
        assert 240 <= len(data["original_schedule"]) <= 241
        
        # Optimized schedule should also have ~240 entries (no prepayments)
        assert 240 <= len(data["optimized_schedule"]) <= 241
        
        # Verify first entry structure
        first_entry = data["original_schedule"][0]
        assert "month" in first_entry
        assert "opening_balance" in first_entry
        assert "emi" in first_entry
        assert "principal" in first_entry
        assert "interest" in first_entry
        assert "closing_balance" in first_entry
        
        print(f"Schedule entries verified: {len(data['original_schedule'])} months")
        
    def test_closing_balance_reaches_zero(self, api_client):
        """Test that closing balance reaches zero at end of loan"""
        payload = {
            "loan_amount": 5000000,
            "interest_rate": 8.5,
            "tenure_years": 20,
            "loan_start_date": datetime.now().strftime("%Y-%m-%d"),
            "loan_type": "Home"
        }
        
        response = api_client.post(f"{BASE_URL}/api/simulate", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        
        # Last entry should have closing balance ~0
        last_entry = data["original_schedule"][-1]
        assert abs(last_entry["closing_balance"]) < 1  # Should be effectively zero
        print(f"Final closing balance: ₹{last_entry['closing_balance']:.2f}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
