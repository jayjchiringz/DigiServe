# Generated by Django 5.1.4 on 2025-01-13 13:15

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('sales', '0034_remove_expenditure_category_business_category'),
    ]

    operations = [
        migrations.AddField(
            model_name='expenditure',
            name='expense_type',
            field=models.CharField(choices=[('operational', 'Operational Cost'), ('fixed', 'Fixed Expense'), ('variable', 'Variable Expense'), ('capital', 'Capital Expenditure'), ('other', 'Other Expenses')], default='operational', max_length=50),
        ),
    ]
