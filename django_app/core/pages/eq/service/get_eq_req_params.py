"""Select params from request EQ Page. """
from staff.models import Department


def get_eq_req_params(request):
    """Get EQ params from request. """
    department = None
    department_pk = request.query_params.get("department_id")
    if department_pk:
        department = Department.objects.get(id=department_pk)

    return {
        'user': request.user,
        'view_mode_key': request.query_params.get("view_mode"),
        'project_filter': request.query_params.get("project"),
        'department': department,
        'week': request.query_params.get("week"),
        'year': request.query_params.get("year"),
        'assembled': request.query_params.get("assembled"),
    }
