from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.translation import gettext_lazy as _

from .forms import CustomUserCreationForm, CustomUserChangeForm
from .models import Employee, Department, Transaction, Audit


class CustomUserAdmin(UserAdmin):
    """Переопределяем стандартную форму пользователя"""
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm
    model = Employee
    list_display = ['username', 'first_name', "last_name", "date_joined"]
    list_display_links = ['username']

    fieldsets = (
        (None, {"fields": ("username", "password")}),
        # Добавлены пин-код и отделы
        (_("Personal info"), {"fields": (
            "first_name",
            "last_name",
            "email",
            'pin_code',
            'departments',
            'current_department')
        }),
        (
            _("Permissions"),
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                ),
            },
        ),
        (_("Important dates"), {"fields": ("last_login", "date_joined")}),
    )


admin.site.register(Employee, CustomUserAdmin)

admin.site.register(Department)

admin.site.register(Transaction)

admin.site.register(Audit)
