# Generated by Django 5.1.4 on 2025-01-13 11:20

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('sales', '0032_item_unique_item_per_business'),
    ]

    operations = [
        migrations.AlterField(
            model_name='sale',
            name='payment_mode',
            field=models.CharField(choices=[('MPesa', 'MPesa'), ('Cash', 'Cash'), ('Credit/Debit Card', 'Credit/Debit Card')], default='Cash', max_length=20),
        ),
    ]
