import pandas as pd

# Create customer data
customer_data = {
    'CustomerID': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    'Name': ['Alice', 'Bob', 'Charlie', 'David', 'Eve', 'Frank', 'Grace', 'Heidi', 'Ivan', 'Judy'],
    'Email': ['alice@example.com', 'bob@example.com', 'charlie@example.com', 'david@example.com', 'eve@example.com',
              'frank@example.com', 'grace@example.com', 'heidi@example.com', 'ivan@example.com', 'judy@example.com']
}
customers_df = pd.DataFrame(customer_data)
customers_df.to_csv('customer.csv', index=False)

# Create orders data
orders_data = {
    'OrderID': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    'CustomerID': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    'Product': ['Laptop', 'Smartphone', 'Tablet', 'Headphones', 'Camera', 'Monitor', 'Keyboard', 'Mouse', 'Printer','Speaker'],
    'Quantity': [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
    'Price': [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000],
    'OrderDate': ['2024-09-01', '2024-11-01', '2025-01-01', '2024-08-01', '2025-02-01', '2024-12-01', '2024-07-01', '2025-03-01', '2024-10-01', '2025-04-01']
}
orders_df = pd.DataFrame(orders_data)
orders_df.to_csv('orders.csv', index=False)

# Print your name (assuming you are one of the customers)
your_name = "Coral"  # Replace with your actual name
print(f"My name is {your_name}.")