from core.models import Order


def get_project_filters(mode: str) -> list[str]:
    if mode == 'all':
        projects = list(Order.objects.all().distinct('project').values_list('project', flat=True))
    else:
        projects = list(
            Order.objects
            .filter(order_products__status=0)
            .distinct('project')
            .values_list('project', flat=True)
        )

    result = ['Все проекты']

    result += projects

    return result
