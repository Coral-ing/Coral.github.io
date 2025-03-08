# Import necessary libraries
# pandas is used for data processing and analysis
import pandas as pd
# sqlite3 is used to interact with SQLite databases
import sqlite3

# Read data from CSV files
# Read customer information data and store it in the customers_df DataFrame
customers_df = pd.read_csv('customer.csv')
# Read order information data and store it in the orders_df DataFrame
orders_df = pd.read_csv('orders.csv')

# Merge the two DataFrames
# Perform an inner join based on the 'CustomerID' column to combine order information and customer information into one DataFrame
merged_df = pd.merge(orders_df, customers_df, on='CustomerID', how='inner')

# Calculate the total amount for each order
# Add a new column 'TotalAmount' to the merged DataFrame, where its value is the product of the 'Quantity' column and the 'Price' column
merged_df['TotalAmount'] = merged_df['Quantity'] * merged_df['Price']

# Determine the order status based on the order date
# Add a new column 'Status' to the merged DataFrame
# If the order date starts with '2025-03', the order status is 'New'; otherwise, it is 'Old'
merged_df['Status'] = merged_df['OrderDate'].apply(lambda d: 'New' if d.startswith('2025-03') else 'Old')

# Filter out high - value orders with a total amount greater than 4500
# Filter rows from the merged DataFrame where the 'TotalAmount' is greater than 4500 and store them in the high_value_orders DataFrame
high_value_orders = merged_df[merged_df['TotalAmount'] > 4500]

# Connect to the SQLite database
# If the database file 'ecommerce.db' does not exist, a new database file will be created
conn = sqlite3.connect('ecommerce.db')

# Create a table named HighValueOrders
# If the table does not exist, create the table and define the column names and data types
create_table_query = '''
CREATE TABLE IF NOT EXISTS HighValueOrders (
    OrderID INTEGER,
    CustomerID INTEGER,
    Name TEXT,
    Email TEXT,
    Product TEXT,
    Quantity INTEGER,
    Price REAL,
    OrderDate TEXT,
    TotalAmount REAL,
    Status TEXT
)
'''
# Execute the SQL statement to create the table
conn.execute(create_table_query)

# Write high - value order data to the database table
# Write the data in the high_value_orders DataFrame to the 'HighValueOrders' table
# If the table already exists, replace the existing data
# Do not write the index of the DataFrame to the table
high_value_orders.to_sql('HighValueOrders', conn, if_exists='replace', index=False)

# Query all high - value order data from the database
result = conn.execute('SELECT * FROM HighValueOrders')
# Iterate through the query results and print each row of data
for row in result.fetchall():
    print(row)

# Close the database connection
conn.close()

# Print a prompt message indicating that the ETL process is completed
print("ETL process completed successfully!")
