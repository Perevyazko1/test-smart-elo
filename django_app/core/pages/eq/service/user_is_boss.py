def get_user_is_boss(user, employee):
    iteration_count = 0
    max_iterations = 10

    while iteration_count < max_iterations:
        if employee.boss == user:
            return True
        elif employee.boss is None:
            return False
        employee = employee.boss
        iteration_count += 1

    return False  # Return False if we exceed maximum iterations to prevent infinite loops
