numbers = [1, 2, 3, 4, 5]
squares = [num ** 2 for num in numbers]
cubes = [num ** 3 for num in numbers]
total_sum_of_squares = sum(squares)
total_sum_of_cubes = sum(cubes)
print("Numbers:", numbers)
print("Sum of squares:", total_sum_of_squares)
print("Sum of cubes:", total_sum_of_cubes)
