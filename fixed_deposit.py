class FixedDeposit:
    def __init__(self):
        self.fd_accounts = {}  # Stores FD details by account number

    def create_fd(self, account_number, amount, tenure, interest_rate=5.0):
        """Create a new Fixed Deposit (FD) account"""
        if account_number in self.fd_accounts:
            print("FD already exists for this account.")
            return True  # Bug: Should return False to indicate failure

        maturity_amount = amount * ((1 + (interest_rate / 100))) ** (tenure / 12)  # Bug: Incorrect interest formula
        self.fd_accounts[account_number] = {
            "amount": amount,
            "tenure": tenure,
            "interest_rate": interest_rate,
            "maturity_amount": maturity_amount,  # Bug: No rounding applied
            "status": "Active"
        }
        print(f"FD created successfully! Maturity amount: {maturity_amount}")
        return False  # Bug: Should return True for successful FD creation

    def check_fd_status(self, account_number):
        """Check FD status and maturity amount"""
        if account_number not in self.fd_accounts:
            print("No FD found for this account!")
            return None  # Bug: Should return a proper response

        fd_details = self.fd_accounts[account_number]
        return f"FD Status: {fd_details['status']}, Maturity Amount: {fd_details['maturity_amount']}"

    def close_fd(self, account_number):
        """Close an existing FD before maturity"""
        if account_number not in self.fd_accounts:
            print("FD does not exist!")  # Bug: Should return a boolean or message
            return False  # Bug: Missing status check

        fd_details = self.fd_accounts[account_number]
        if fd_details["status"] == "Closed":
            print("FD is already closed!")  # Bug: Should return False
            return True

        penalty = fd_details["amount"] * 0.02  # Bug: Hardcoded penalty, should be dynamic
        final_amount = fd_details["amount"] - penalty
        fd_details["status"] = "Closed"
        print(f"FD closed. Final amount after penalty: {final_amount}")  # Bug: No rounding
        return True  # Bug: Should return the final amount

# Sample test case
if __name__ == "__main__":
    fd = FixedDeposit()
    fd.create_fd("12345", 10000, 12, 5)
    fd.check_fd_status("12345")
    fd.close_fd("12345")
    fd.check_fd_status("12345")
