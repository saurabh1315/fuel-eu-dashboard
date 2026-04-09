import requests
import sys
import json
from datetime import datetime

class DashboardAPITester:
    def __init__(self, base_url="https://dashboard-hub-181.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
                except:
                    print(f"   Response: {response.text[:100]}...")
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}")
                self.failed_tests.append({
                    "test": name,
                    "endpoint": endpoint,
                    "expected": expected_status,
                    "actual": response.status_code,
                    "error": response.text[:200]
                })

            return success, response.json() if success and response.text else {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                "test": name,
                "endpoint": endpoint,
                "error": str(e)
            })
            return False, {}

    def test_routes_endpoints(self):
        """Test all routes-related endpoints"""
        print("\n" + "="*50)
        print("TESTING ROUTES ENDPOINTS")
        print("="*50)
        
        # Test GET /api/routes
        success, routes_data = self.run_test(
            "Get Routes",
            "GET",
            "routes",
            200
        )
        
        if success and routes_data:
            # Test setting baseline for first route
            first_route_id = routes_data[0].get('id', '1')
            self.run_test(
                f"Set Baseline for Route {first_route_id}",
                "POST",
                f"routes/{first_route_id}/baseline",
                200
            )
        
        # Test GET /api/routes/comparison
        self.run_test(
            "Get Route Comparison",
            "GET",
            "routes/comparison",
            200
        )

    def test_compliance_endpoints(self):
        """Test compliance-related endpoints"""
        print("\n" + "="*50)
        print("TESTING COMPLIANCE ENDPOINTS")
        print("="*50)
        
        # Test GET /api/compliance/cb
        self.run_test(
            "Get Compliance CB Data",
            "GET",
            "compliance/cb",
            200
        )

    def test_banking_endpoints(self):
        """Test banking-related endpoints"""
        print("\n" + "="*50)
        print("TESTING BANKING ENDPOINTS")
        print("="*50)
        
        # Test GET /api/banking
        success, banking_data = self.run_test(
            "Get Banking Data",
            "GET",
            "banking",
            200
        )
        
        # Test POST /api/banking/bank
        self.run_test(
            "Bank Funds",
            "POST",
            "banking/bank",
            200,
            data={"amount": 1000.0}
        )
        
        # Test POST /api/banking/apply
        self.run_test(
            "Apply Funds",
            "POST",
            "banking/apply",
            200,
            data={"route_id": "1", "amount": 500.0}
        )

    def test_pools_endpoints(self):
        """Test pools-related endpoints"""
        print("\n" + "="*50)
        print("TESTING POOLS ENDPOINTS")
        print("="*50)
        
        # Test GET /api/pools
        self.run_test(
            "Get Pools",
            "GET",
            "pools",
            200
        )
        
        # Test POST /api/pools
        self.run_test(
            "Create Pool",
            "POST",
            "pools",
            200,
            data={
                "name": f"Test Pool {datetime.now().strftime('%H%M%S')}",
                "routes_count": 5,
                "total_volume": 10000
            }
        )

    def test_root_endpoint(self):
        """Test root API endpoint"""
        print("\n" + "="*50)
        print("TESTING ROOT ENDPOINT")
        print("="*50)
        
        self.run_test(
            "API Root",
            "GET",
            "",
            200
        )

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting Dashboard API Tests")
        print(f"Base URL: {self.base_url}")
        print(f"API URL: {self.api_url}")
        
        # Test all endpoints
        self.test_root_endpoint()
        self.test_routes_endpoints()
        self.test_compliance_endpoints()
        self.test_banking_endpoints()
        self.test_pools_endpoints()
        
        # Print summary
        print("\n" + "="*50)
        print("TEST SUMMARY")
        print("="*50)
        print(f"📊 Tests passed: {self.tests_passed}/{self.tests_run}")
        print(f"📊 Success rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        if self.failed_tests:
            print(f"\n❌ Failed tests ({len(self.failed_tests)}):")
            for test in self.failed_tests:
                print(f"   - {test['test']}: {test.get('error', 'Status code mismatch')}")
        
        return self.tests_passed == self.tests_run

def main():
    tester = DashboardAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())