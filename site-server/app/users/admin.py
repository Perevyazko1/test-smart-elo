from sqladmin import ModelView

from app.users.models import User


class UserAdmin(ModelView, model=User):
    column_list = [User.id, User.first_name, User.last_name, User.patronymic, User.email, User.password_hash]
    column_details_exclude_list = [User.password_hash]
    form_widget_args = {
        'roles': {'readonly': True, 'disabled': True},
    }

    can_create = True
    can_edit = True
    can_delete = False
    can_view_details = True

    icon = "fa-solid fa-user"

    form_create_rules = ["first_name", "last_name", "password_hash"]

    async def on_model_change(self, data, model: User, is_created, request) -> None:
        if is_created:
            data['password_hash'] = model.set_password(data['password_hash'])