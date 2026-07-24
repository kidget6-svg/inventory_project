<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Purchase Orders</title>

    <style>
        body{
            font-family:Arial, sans-serif;
            background:#f5f7fb;
            margin:0;
            padding:40px;
        }

        .container{
            max-width:1100px;
            margin:auto;
            background:#fff;
            padding:30px;
            border-radius:10px;
        }

        h1{
            color:#1f4f3d;
        }

        .button{
            background:#1f7a5a;
            color:white;
            padding:10px 18px;
            text-decoration:none;
            border-radius:6px;
        }

        table{
            width:100%;
            border-collapse:collapse;
            margin-top:20px;
        }

        th,td{
            border-bottom:1px solid #ddd;
            padding:12px;
            text-align:left;
        }

        th{
            background:#e9f5ef;
        }

        .empty{
            text-align:center;
            color:gray;
        }
    </style>

</head>
<body>

<div class="container">

    <h1>Purchase Orders</h1>

    <a href="{{ route('purchase-orders.create') }}" class="button">
        + New Purchase Order
    </a>

    <table>

        <thead>

        <tr>
            <th>ID</th>
            <th>Supplier</th>
            <th>Order Date</th>
            <th>Total Amount</th>
            <th>Status</th>
        </tr>

        </thead>

        <tbody>

        @forelse($purchaseOrders as $order)

            <tr>

                <td>{{ $order->id }}</td>

                <td>{{ $order->supplier->name ?? '-' }}</td>

                <td>{{ $order->order_date }}</td>

                <td>{{ number_format($order->total_amount,2) }}</td>

                <td>{{ $order->status }}</td>

            </tr>

        @empty

            <tr>

                <td colspan="5" class="empty">
                    No Purchase Orders Found.
                </td>

            </tr>

        @endforelse

        </tbody>

    </table>

</div>

</body>
</html>