from django.contrib.auth.forms import UserCreationForm, UserChangeForm

from .models import Employee


class CustomUserCreationForm(UserCreationForm):
    """Кастомная форма создания пользователя"""
    class Meta:
        model = Employee
        fields = ('username', 'email')


class CustomUserChangeForm(UserChangeForm):
    """Кастомная форма редактирования пользователя"""
    class Meta:
        model = Employee
        fields = ('username', 'email')
