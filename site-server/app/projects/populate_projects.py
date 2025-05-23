import random
from datetime import datetime
from faker import Faker
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.db import connection
from app.projects.models import Project, ProjectImage

fake = Faker()


@connection
async def create_project(session: AsyncSession):
    project = Project(
        name=fake.sentence(nb_words=4),
        about=fake.paragraph(nb_sentences=5),
        public=fake.boolean(chance_of_getting_true=70),
        published_at=datetime.now()
    )
    session.add(project)
    await session.flush()

    images = []
    num_images = random.randint(1, 20)
    for i in range(num_images):
        image = ProjectImage(
            project_id=project.id,
            image="1920x1080.png",
            thumbnail="thumb_1920x1080.png",
            description=fake.sentence(nb_words=6),
            is_published=fake.boolean(chance_of_getting_true=80),
            is_preview=fake.boolean(chance_of_getting_true=20),
        )
        images.append(image)

    session.add_all(images)
    await session.flush()

    await session.commit()
    print("Project with images and potential preview created.")


async def populate_projects(count=10):
    for _ in range(count):
        await create_project()
