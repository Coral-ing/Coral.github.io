#Coral
import pandas as pd
import sqlite3
import matplotlib.pyplot as plt
import socket  # Added for getting computer name and IP address

# Read data
income_df = pd.read_excel('income.xlsx')
expenses_df = pd.read_csv('expenses.txt', sep=' ')

# Convert 'Month' column to datetime
income_df['Month'] = pd.to_datetime(income_df['Month'].str.strip(), format='%Y-%m-%d', errors='coerce')
expenses_df['Month'] = pd.to_datetime(expenses_df['Month'].str.strip(), format='%Y-%m-%d', errors='coerce')

# Check for invalid dates
if income_df['Month'].isna().any():
    print("Warning: Invalid dates found in income data.")
if expenses_df['Month'].isna().any():
    print("Warning: Invalid dates found in expenses data.")

# Merge the data on 'Month'
merged_df = pd.merge(income_df, expenses_df, on='Month', how='inner')

# Calculate savings
merged_df['Savings'] = merged_df['Income'] - merged_df['Expenses']

# Validation checks
if merged_df['Income'].sum() <= 0:
    raise ValueError("Total income must be greater than zero.")
if merged_df['Expenses'].sum() > merged_df['Income'].sum():
    raise ValueError("Total expenses cannot exceed total income.")

# Expense percentage
expense_percentage = merged_df['Expenses'].sum() / merged_df['Income'].sum() * 100
labels = ['Expenses', 'Savings']
sizes = [max(0, expense_percentage), max(0, 100 - expense_percentage)]

# Store data in SQLite database
conn = sqlite3.connect('finance_data.db')
merged_df.to_sql('FinanceData', conn, if_exists='replace', index=False)

# SQL Query to select data where Income > 7000 and Savings > 400, and order by Month
query = """
SELECT Month, Income, Expenses, Savings
FROM FinanceData
WHERE Income > 7000 AND Savings > 400
ORDER BY Month ASC;
"""

# Execute the SQL query and fetch results
filtered_df = pd.read_sql_query(query, conn)

# Display the filtered data (optional, if you want to check it)
print(filtered_df)

# Close the connection
conn.close()

# Data visualization
plt.figure(figsize=(12, 6))

# Pie chart for expense vs savings distribution
plt.subplot(1, 2, 1)
plt.pie(sizes, labels=labels, autopct='%1.1f%%', startangle=90)
plt.title('Expense vs Savings Distribution')

# Line chart for monthly savings trends
plt.subplot(1, 2, 2)
merged_df.sort_values('Month', inplace=True)
merged_df.set_index('Month')['Savings'].plot(kind='line', marker='o', color='green')
plt.title('Monthly Savings Trends')
plt.xlabel('Month')
plt.ylabel('Savings ($)')

plt.tight_layout()

# Add computer name and IP address to the chart
hostname = socket.gethostname()
ip_address = socket.gethostbyname(hostname)
plt.figtext(0.5, 0.01, f'Computer: {hostname}, IP: {ip_address}', ha='center', fontsize=10)

plt.show()
