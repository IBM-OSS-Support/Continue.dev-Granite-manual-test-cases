from features.interest_calculator import InterestCalculator
from features.loan_manager import LoanManager

class BankAccount:
    def __init__(self, account_number, balance=0):
        self.account_number = account_number
        self.balance = balance
        self.transactions = []
        self.interest_calculator = InterestCalculator()  # Interest feature
        self.loan_manager = LoanManager()  # Loan feature

    def deposit(self, amount):
        self.balance += amount
        self.transactions.append(f"Deposited {amount}")

    def withdraw(self, amount):
        if amount > self.balance:
            print("Insufficient funds!")
            return False
        self.balance -= amount
        self.transactions.append(f"Withdrew {amount}")
        return True

    def check_balance(self):
        return self.balance

    def display_transactions(self):
        for transaction in self.transactions:
            print(transaction)

    def calculate_interest(self, years):
        """Calculate interest using the new feature."""
        interest = self.interest_calculator.calculate_interest(self.balance, years)
        print(f"Interest earned in {years} years: {interest}")

    def apply_loan(self, amount, interest_rate=10.0, tenure=12):
        """Apply for a loan using the LoanManager feature."""
        return self.loan_manager.apply_loan(self.account_number, amount, interest_rate, tenure)

    def repay_loan(self, amount):
        """Repay the loan using LoanManager."""
        return self.loan_manager.repay_loan(self.account_number, amount)

    def check_loan_status(self):
        """Check outstanding loan balance."""
        return self.loan_manager.check_loan_status(self.account_number)


class BankSystem:
    def __init__(self):
        self.accounts = {}

    def create_account(self, account_number):
        if account_number not in self.accounts:
            self.accounts[account_number] = BankAccount(account_number)
            return True
        else:
            print("Account already exists!")
            return False

    def get_account(self, account_number):
        return self.accounts.get(account_number)


def main():
    bank_system = BankSystem()

    while True:
        print("\nBank Account Management System")
        print("1. Create new account")
        print("2. Deposit funds")
        print("3. Withdraw funds")
        print("4. Check balance")
        print("5. Display transaction history")
        print("6. Calculate interest")
        print("7. Apply for a loan")
        print("8. Repay loan")
        print("9. Check loan balance")
        print("10. Exit")

        choice = input("Enter your choice: ")

        if choice == "1":
            account_number = input("Enter new account number: ")
            bank_system.create_account(account_number)
        elif choice == "2":
            account_number = input("Enter account number: ")
            amount = float(input("Enter deposit amount: "))
            account = bank_system.get_account(account_number)
            if account:
                account.deposit(amount)
        elif choice == "3":
            account_number = input("Enter account number: ")
            amount = float(input("Enter withdrawal amount: "))
            account = bank_system.get_account(account_number)
            if account and account.withdraw(amount):
                print("Withdrawal successful!")
        elif choice == "4":
            account_number = input("Enter account number: ")
            account = bank_system.get_account(account_number)
            if account:
                print(f"Account balance: {account.check_balance()}")
        elif choice == "5":
            account_number = input("Enter account number: ")
            account = bank_system.get_account(account_number)
            if account:
                account.display_transactions()
        elif choice == "6":
            account_number = input("Enter account number: ")
            years = int(input("Enter number of years: "))
            account = bank_system.get_account(account_number)
            if account:
                account.calculate_interest(years)
        elif choice == "7":
            account_number = input("Enter account number: ")
            amount = float(input("Enter loan amount: "))
            interest_rate = float(input("Enter interest rate (%): "))
            tenure = int(input("Enter tenure (months): "))
            account = bank_system.get_account(account_number)
            if account:
                account.apply_loan(amount, interest_rate, tenure)
        elif choice == "8":
            account_number = input("Enter account number: ")
            amount = float(input("Enter repayment amount: "))
            account = bank_system.get_account(account_number)
            if account:
                account.repay_loan(amount)
        elif choice == "9":
            account_number = input("Enter account number: ")
            account = bank_system.get_account(account_number)
            if account:
                loan_balance = account.check_loan_status()
                print(f"Outstanding loan balance: {loan_balance}")
        elif choice == "10":
            break
        else:
            print("Invalid choice. Please try again.")

if __name__ == "__main__":
    main()
