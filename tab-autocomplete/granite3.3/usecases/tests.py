# --- 1. Nested Conditions with Edge Case Logic ---
# calculate tax with nested brackets and slab logic
def calculate_tax(income):
    if income <= 250000:
        return 0
    elif income <= 500000:
        return (income - 250000) * 0.05
    elif income <= 1000000:
        # <<< cursor here >>>

# ---------------------------------------------------------

# --- 2. Higher-Order Functions (Lambdas + Map/Filter) ---
# filter even numbers using lambda
numbers = [1, 2, 3, 4, 5, 6]
even_numbers = list(filter(lambda x:
# <<< cursor here >>>

# ---------------------------------------------------------

# --- 3. Function Chaining / Fluent APIs ---
# chaining pandas dataframe operations
import pandas as pd

df = pd.read_csv("data.csv")
result = df.dropna().groupby("category").agg({
# <<< cursor here >>>

# ---------------------------------------------------------

# --- 4. Exception Handling with Custom Messages ---
# withdraw amount from account
def withdraw(account, amount):
    if amount > account.balance:
        raise ValueError(
# <<< cursor here >>>

# ---------------------------------------------------------

# --- 5. Class Definitions with init, str, and Method Logic ---
# employee class with name, salary, and str representation
class Employee:
    def __init__(self, name, salary):
        self.name = name
        self.salary = salary

    def __str__(self):
# <<< cursor here >>>

# ---------------------------------------------------------

# --- 6. Recursive Logic ---
# factorial using recursion
def factorial(n):
    if n == 0:
        return 1
    else:
        return
# <<< cursor here >>>

# ---------------------------------------------------------

# --- 7. Nested Conditions with suffix ---
def calculate_tax(income):
    if income <= 250000:
        return 0
    elif income <= 500000:
        return (income - 250000) * 0.05

# <<< cursor here for FIM >>>

    else:
        return (income - 1000000) * 0.2 + (500000 - 1000000) * 0.1

# ---------------------------------------------------------

# --- 8. Lambda Filter with suffix ---
numbers = [1, 2, 3, 4, 5, 6]
even_numbers = list(filter(
# <<< cursor here >>>
, numbers))
print(even_numbers)

# ---------------------------------------------------------

# --- 9. Pandas Chain with suffix ---
import pandas as pd
df = pd.read_csv("data.csv")
result = df.dropna().groupby("category").agg({
# <<< cursor here >>>
})
print(result)

# ---------------------------------------------------------

# --- 10. Exception Handling with suffix ---
def withdraw(account, amount):
    if amount > account.balance:
# <<< cursor here >>>
    account.balance -= amount
    print("Withdrew", amount, "from account.")
    print("New balance:", account.balance)
    print("Transaction successful.")
    print("Thank you for banking with us!")
    print("Goodbye!")
    print("Have a nice day!")
    return "Transaction completed."

# ---------------------------------------------------------

# --- 11. Class Bonus Method with suffix ---
class Employee:
    def __init__(self, name, salary):
        self.name = name
        self.salary = salary
    def __str__(self):
        return f"Employee {self.name} earns ${self.salary}."
    def calculate_bonus(self):
# <<< cursor here >>>
employee = Employee("John Doe", 60000)
print(employee)
bonus = employee.calculate_bonus()
if bonus > 0:
    print(f"Bonus for {employee.name}: ${bonus}")
    print("Thank you for your hard work.")

# ---------------------------------------------------------

# --- 12. Recursive Logic with suffix ---
def factorial(n):
    if n == 0:
        return 1
    else:
        return # <<< cursor here >>>

