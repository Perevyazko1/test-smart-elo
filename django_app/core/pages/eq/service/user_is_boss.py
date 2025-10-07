def get_user_is_boss(user, employee):
    while True:
        if employee.boss == user:
            return True
        elif employee.boss is None:
            return False
        employee = employee.boss
