#!/usr/bin/env python3
"""
Comprehensive Backend Testing for Loan Freedom Planner
Tests all API endpoints: simulation, export functionality, and status checks
"""

import requests
import sys
import json
import time
from datetime import datetime, timedelta
from typing import Dict, Any

class LoanPlannerAPITester:
    def __init__(self):
        self.base_url = "https://loan-strategy-engine.preview.emergentagent.com"
        self.api_base = f"{self.base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.errors = []
        
    def log_test(self, name: str, passed: bool, details: str = ""):
        self.tests_run += 1
        if passed:
            self.tests_passed += 1
            print(f"✅ {name}")
            if details:
                print(f"   {details}")
        else:
            print(f"❌ {name}")
            if details:
                print(f"   Error: {details}")
                self.errors.append(f"{name}: {details}")
    
    def test_api_health(self):
        """Test basic API connectivity"""
        try:
            response = requests.get(f"{self.api_base}/", timeout=10)
            success = response.status_code == 200
            data = response.json() if success else {}
            
            self.log_test(
                "API Health Check",
                success,
                f"Status: {response.status_code}, Response: {data}"
            )
            return success
        except Exception as e:
            self.log_test("API Health Check", False, str(e))
            return False
    
    def test_status_endpoints(self):
        """Test status check CRUD operations"""
        # Create status check
        try:
            payload = {"client_name": f"test_client_{int(time.time())}"}
            response = requests.post(f"{self.api_base}/status", json=payload, timeout=10)
            
            create_success = response.status_code == 200
            status_data = response.json() if create_success else {}
            
            self.log_test(
                "Create Status Check",
                create_success,
                f"Status: {response.status_code}, ID: {status_data.get('id', 'None')}"
            )
        except Exception as e:
            self.log_test("Create Status Check", False, str(e))
        
        # Get status checks
        try:
            response = requests.get(f"{self.api_base}/status", timeout=10)
            get_success = response.status_code == 200
            status_list = response.json() if get_success else []
            
            self.log_test(
                "Get Status Checks",
                get_success,
                f"Status: {response.status_code}, Count: {len(status_list) if isinstance(status_list, list) else 0}"
            )
        except Exception as e:
            self.log_test("Get Status Checks", False, str(e))
    
    def get_default_loan_payload(self) -> Dict[str, Any]:
        """Get default loan configuration for testing"""
        today = datetime.now().strftime('%Y-%m-%d')
        
        return {
            "loan_amount": 5000000,  # ₹50 lakh
            "interest_rate": 8.5,    # 8.5% p.a.
            "tenure_years": 20,      # 20 years
            "loan_start_date": today,
            "loan_type": "Home",
            "processing_fee": 0,
            "adjusted_emi": None,
            "periodic_payments": [],
            "adhoc_payments": [],
            "prepayment_charge_percent": 2.0,
            "prepayment_fixed_fee": 0,
            "prepayment_charge_years": 3,
            "prepayment_inclusive": True,
            "bank_preference": "reduce_tenure",
            "tax_slab": 0,
            "investment_return": 12.0
        }
    
    def get_advanced_loan_payload(self) -> Dict[str, Any]:
        """Get advanced loan configuration with payments"""
        payload = self.get_default_loan_payload()
        
        # Add periodic payment: ₹10,000 monthly starting from period 12 for 24 occurrences
        payload["periodic_payments"] = [{
            "amount": 10000,
            "frequency": "monthly",
            "start_period": 12,
            "occurrences": 24
        }]
        
        # Add adhoc payment: ₹100,000 after 2 years
        future_date = (datetime.now() + timedelta(days=730)).strftime('%Y-%m-%d')
        payload["adhoc_payments"] = [{
            "amount": 100000,
            "date": future_date
        }]
        
        # Set adjusted EMI (higher than standard)
        payload["adjusted_emi"] = 45000
        
        return payload
    
    def test_loan_simulation_basic(self):
        """Test basic loan simulation with default values"""
        try:
            payload = self.get_default_loan_payload()
            response = requests.post(f"{self.api_base}/simulate", json=payload, timeout=15)
            
            success = response.status_code == 200
            if success:
                data = response.json()
                
                # Validate response structure
                required_keys = ['standard_emi', 'original', 'optimized', 'savings']
                has_required = all(key in data for key in required_keys)
                
                # Basic validation of calculations
                valid_calculations = (
                    data.get('standard_emi', 0) > 0 and
                    data.get('original', {}).get('total_interest', 0) > 0 and
                    data.get('optimized', {}).get('total_interest', 0) > 0
                )
                
                detail_msg = f"EMI: ₹{data.get('standard_emi', 0):,.0f}, Interest: ₹{data.get('original', {}).get('total_interest', 0):,.0f}"
                
                self.log_test(
                    "Basic Loan Simulation",
                    success and has_required and valid_calculations,
                    detail_msg
                )
                
                return data if (success and has_required and valid_calculations) else None
            else:
                error_msg = response.text[:200] if response.text else "No error details"
                self.log_test("Basic Loan Simulation", False, f"Status: {response.status_code}, Error: {error_msg}")
                return None
                
        except Exception as e:
            self.log_test("Basic Loan Simulation", False, str(e))
            return None
    
    def test_loan_simulation_advanced(self):
        """Test advanced loan simulation with payments"""
        try:
            payload = self.get_advanced_loan_payload()
            response = requests.post(f"{self.api_base}/simulate", json=payload, timeout=15)
            
            success = response.status_code == 200
            if success:
                data = response.json()
                
                # Validate response structure
                required_keys = ['standard_emi', 'original', 'optimized', 'savings']
                has_required = all(key in data for key in required_keys)
                
                # Validate that optimized scenario shows savings
                has_savings = (
                    data.get('savings', {}).get('interest_saved', 0) > 0 and
                    data.get('savings', {}).get('months_saved', 0) > 0
                )
                
                # Check if periodic payments are processed
                optimized_summary = data.get('optimized', {})
                has_extra_principal = optimized_summary.get('total_extra_principal', 0) > 0
                
                detail_msg = f"Interest Saved: ₹{data.get('savings', {}).get('interest_saved', 0):,.0f}, Months Saved: {data.get('savings', {}).get('months_saved', 0)}"
                
                self.log_test(
                    "Advanced Loan Simulation (with payments)",
                    success and has_required and has_savings and has_extra_principal,
                    detail_msg
                )
                
                return data if success else None
            else:
                error_msg = response.text[:200] if response.text else "No error details"
                self.log_test("Advanced Loan Simulation", False, f"Status: {response.status_code}, Error: {error_msg}")
                return None
                
        except Exception as e:
            self.log_test("Advanced Loan Simulation", False, str(e))
            return None
    
    def test_investment_comparison(self):
        """Test investment comparison calculation"""
        try:
            payload = self.get_advanced_loan_payload()
            payload["investment_return"] = 15.0  # Higher return to test comparison
            
            response = requests.post(f"{self.api_base}/simulate", json=payload, timeout=15)
            
            success = response.status_code == 200
            if success:
                data = response.json()
                investment_analysis = data.get('investment_analysis', {})
                
                is_enabled = investment_analysis.get('enabled', False)
                has_recommendation = 'recommendation' in investment_analysis
                has_values = (
                    investment_analysis.get('investment_future_value', 0) > 0 and
                    investment_analysis.get('total_prepayments', 0) > 0
                )
                
                recommendation = investment_analysis.get('recommendation', 'None')
                
                self.log_test(
                    "Investment Comparison Analysis",
                    success and is_enabled and has_recommendation and has_values,
                    f"Recommendation: {recommendation}, Enabled: {is_enabled}"
                )
                
            else:
                self.log_test("Investment Comparison", False, f"Status: {response.status_code}")
                
        except Exception as e:
            self.log_test("Investment Comparison", False, str(e))
    
    def test_excel_export(self):
        """Test Excel export functionality"""
        try:
            payload = self.get_default_loan_payload()
            response = requests.post(f"{self.api_base}/export/excel", json=payload, timeout=20)
            
            success = response.status_code == 200
            is_excel = 'excel' in response.headers.get('content-type', '').lower() or \
                      'spreadsheet' in response.headers.get('content-type', '').lower()
            
            file_size = len(response.content) if success else 0
            
            self.log_test(
                "Excel Export",
                success and is_excel and file_size > 1000,  # Should be substantial file
                f"Content-Type: {response.headers.get('content-type', 'Unknown')}, Size: {file_size} bytes"
            )
            
        except Exception as e:
            self.log_test("Excel Export", False, str(e))
    
    def test_pdf_export(self):
        """Test PDF export functionality"""
        try:
            payload = self.get_default_loan_payload()
            response = requests.post(f"{self.api_base}/export/pdf", json=payload, timeout=20)
            
            success = response.status_code == 200
            is_pdf = 'pdf' in response.headers.get('content-type', '').lower()
            
            file_size = len(response.content) if success else 0
            
            self.log_test(
                "PDF Export",
                success and is_pdf and file_size > 1000,  # Should be substantial file
                f"Content-Type: {response.headers.get('content-type', 'Unknown')}, Size: {file_size} bytes"
            )
            
        except Exception as e:
            self.log_test("PDF Export", False, str(e))
    
    def test_error_handling(self):
        """Test API error handling with invalid data"""
        # Test with invalid loan amount
        try:
            payload = self.get_default_loan_payload()
            payload["loan_amount"] = -1000  # Invalid negative amount
            
            response = requests.post(f"{self.api_base}/simulate", json=payload, timeout=10)
            
            # Should return 400 or 422 for invalid data
            handles_error = response.status_code in [400, 422, 500]
            
            self.log_test(
                "Error Handling (Invalid Data)",
                handles_error,
                f"Status: {response.status_code} for negative loan amount"
            )
            
        except Exception as e:
            self.log_test("Error Handling", False, str(e))
    
    def run_all_tests(self):
        """Run comprehensive backend test suite"""
        print("🚀 Starting Loan Freedom Planner Backend Tests")
        print(f"🌐 API Base URL: {self.api_base}")
        print("=" * 60)
        
        # Test API connectivity first
        if not self.test_api_health():
            print("\n❌ API is not accessible. Stopping tests.")
            return False
        
        # Test basic CRUD operations
        self.test_status_endpoints()
        
        # Test core loan simulation functionality
        basic_result = self.test_loan_simulation_basic()
        if basic_result:
            print(f"   📊 Standard EMI calculated: ₹{basic_result.get('standard_emi', 0):,.0f}")
        
        # Test advanced simulation features
        advanced_result = self.test_loan_simulation_advanced()
        
        # Test investment comparison
        self.test_investment_comparison()
        
        # Test export functionality
        self.test_excel_export()
        self.test_pdf_export()
        
        # Test error handling
        self.test_error_handling()
        
        # Print summary
        print("\n" + "=" * 60)
        print(f"📈 Test Results: {self.tests_passed}/{self.tests_run} passed")
        
        if self.errors:
            print(f"\n❌ Failed Tests:")
            for error in self.errors:
                print(f"   - {error}")
        
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        
        if success_rate >= 80:
            print(f"\n✅ Backend testing completed successfully! ({success_rate:.1f}% success rate)")
            return True
        else:
            print(f"\n⚠️  Backend has issues that need attention. ({success_rate:.1f}% success rate)")
            return False

def main():
    tester = LoanPlannerAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())