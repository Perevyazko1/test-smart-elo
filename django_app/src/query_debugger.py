from django.db import connection, reset_queries
import time


def query_debugger(func):
    def wrapper(*args, **kwargs):
        reset_queries()

        start = time.time()
        result = func(*args, **kwargs)
        end = time.time()

        print(f"Function: {func.__name__}")
        print(f"Number of Queries: {len(connection.queries)}")
        print(f"Finished in: {(end - start):.2f}s")

        return result

    return wrapper


def query_debugger_class(cls):
    for attr_name, attr_value in cls.__dict__.items():
        if callable(attr_value) and attr_name.startswith(('get', 'post', 'put', 'delete')):
            setattr(cls, attr_name, query_debugger(attr_value))
    return cls
