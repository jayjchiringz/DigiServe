# Generated by Django 5.1 on 2024-08-19 19:55

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('sales', '0001_initial'),
    ]

    operations = [
        migrations.RenameField(
            model_name='item',
            old_name='price',
            new_name='price_per_package',
        ),
        migrations.AddField(
            model_name='item',
            name='package_type',
            field=models.CharField(default='bottle', max_length=100),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='item',
            name='units_per_package',
            field=models.PositiveIntegerField(default=1),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='item',
            name='name',
            field=models.CharField(max_length=200),
        ),
        migrations.AlterField(
            model_name='item',
            name='stock',
            field=models.PositiveIntegerField(default=0),
        ),
    ]
