# Generated by Django 5.1 on 2024-12-25 12:34

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('sales', '0022_category_item_last_stock_update_alter_item_business_and_more'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='sale',
            unique_together=set(),
        ),
    ]
