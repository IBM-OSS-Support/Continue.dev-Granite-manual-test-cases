# --- 1. Nested Conditions with Edge Case Logic ---
def calculate_tax(income):
    if income <= 250000:
        return 0
    elif income <= 500000:
        return (income - 250000) * 0.05

# <<< cursor here for FIM >>>

    else:
        return (income - 1000000) * 0.2 + (500000 - 1000000) * 0.1

# -------------------------------------------------

# --- 2. Higher-Order Functions (Lambdas + Filter) ---
numbers = [1, 2, 3, 4, 5, 6]
even_numbers = list(filter(
# <<< cursor here for FIM >>>
, numbers))
print(even_numbers)

# ------------------------------------------------------

# --- 3. Function Chaining / Pandas API ---
import pandas as pd
df = pd.read_csv("data.csv")
result = df.dropna().groupby("category").agg({
# <<< cursor here for FIM >>>
})
print(result)

# -----------------------------------------

# --- 4. Exception Handling with Custom Messages ---
def withdraw(account, amount):
    if amount > account.balance:
# <<< cursor here for FIM >>>
    account.balance -= amount
    print("Withdrew", amount, "from account.")
    print("New balance:", account.balance)
    print("Transaction successful.")
    print("Thank you for banking with us!")
    print("Goodbye!")
    print("Have a nice day!")
    return "Transaction completed."

# ------------------------------------------------------

# --- 5. Class Definitions with __init__, __str__, and Method Logic ---
class Employee:
    def __init__(self, name, salary):
        self.name = name
        self.salary = salary
    def __str__(self):
        return f"Employee {self.name} earns ${self.salary}."
    def calculate_bonus(self):
# <<< cursor here for FIM >>>
employee = Employee("John Doe", 60000)
print(employee)
bonus = employee.calculate_bonus()
if bonus > 0:
    print(f"Bonus for {employee.name}: ${bonus}")
    print("Thank you for your hard work.")

# ------------------------------------------------------

# --- 6. Recursive Logic ---
def factorial(n):
    if n == 0:
        return 1
    else:
        return # <<< cursor here for FIM >>>

