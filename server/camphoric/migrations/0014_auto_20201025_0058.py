# Generated by Django 3.0.3 on 2020-10-25 00:58

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('camphoric', '0013_auto_20201024_2353'),
    ]

    operations = [
        migrations.AlterField(
            model_name='invitation',
            name='registration_type',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='camphoric.RegistrationType'),
        ),
    ]
