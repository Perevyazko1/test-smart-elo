from attr import dataclass

from staff.models import Employee, Department


@dataclass
class RequestParams:
    user: Employee | None
    view_mode_key: str
    project_filter: str
    department: Department | None
    week: str
    year: str


def get_eq_req_params(request) -> RequestParams | None:
    department = None
    department_pk = request.query_params.get("department_id")
    if department_pk:
        department = Department.objects.get(id=department_pk)

    return RequestParams(
        user=request.user,
        view_mode_key=request.query_params.get("view_mode"),
        project_filter=request.query_params.get("project"),
        department=department,
        week=request.data.get("week"),
        year=request.data.get("year"),
    )
