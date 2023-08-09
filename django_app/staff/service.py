import re
from django.contrib.auth.models import Group
from django.core.exceptions import ValidationError


def is_user_in_group(user, group_name):
    group = Group.objects.get(name=group_name)
    return group in user.groups.all()


COLOR_RE = re.compile('^#[a-fA-F0-9]{6}([a-fA-F0-9]{2})?$')


def validate_color(value):
    if not COLOR_RE.match(value):
        raise ValidationError(
            'Invalid color code. Must be in the format #RRGGBB or #RRGGBBAA',
            params={'value': value},
        )
