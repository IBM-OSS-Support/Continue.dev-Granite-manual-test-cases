class LoanManager:
    def __init__(self):
        """Initialize loan data."""
        self.loans = {}

    def apply_loan(self, account_number, amount, interest_rate=10.0, tenure=12):
        """Apply for a new loan."""
        if amount <= 0 or tenure <= 0:
            print("Invalid loan amount or tenure!")
            return False

        if account_number in self.loans:
            print("You already have an active loan!")
            return False

        total_payable = amount + (amount * interest_rate * tenure / 100)
        self.loans[account_number] = {
            "amount": amount,
            "interest_rate": interest_rate,
            "tenure": tenure,
            "remaining_balance": total_payable,
        }
        print(f"Loan of {amount} approved at {interest_rate}% interest for {tenure} months!")
        return True

    def repay_loan(self, account_number, amount):
        """Repay loan amount."""
        if account_number not in self.loans:
            print("No active loan found!")
            return False

        loan = self.loans[account_number]
        if amount >= loan["remaining_balance"]:
            print(f"Loan fully repaid! Total paid: {loan['remaining_balance']}")
            del self.loans[account_number]
        else:
            loan["remaining_balance"] -= amount
            print(f"Payment of {amount} accepted! Remaining balance: {loan['remaining_balance']}")
        return True

    def check_loan_status(self, account_number):
        """Check outstanding loan balance."""
        if account_number in self.loans:
            return self.loans[account_number]["remaining_balance"]
        return 0
