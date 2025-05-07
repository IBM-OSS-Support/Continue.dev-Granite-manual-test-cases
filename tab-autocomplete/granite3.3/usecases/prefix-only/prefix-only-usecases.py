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

