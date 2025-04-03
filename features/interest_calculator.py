class InterestCalculator:
    def __init__(self, rate=5.0):
        """Initialize with a default interest rate of 5%."""
        self.rate = rate

    def calculate_interest(self, balance, years):
        """Calculate simple interest."""
        if balance <= 0 or years <= 0:
            return 0
        interest = (balance * self.rate * years) / 100
        return interest
