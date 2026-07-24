<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>Create Purchase Order</title>

    <style>
        body {
            font-family: Arial, sans-serif;
            background: #f5f7fb;
            margin: 0;
            padding: 40px;
        }

        .container {
            max-width: 700px;
            margin: auto;
            background: #fff;
            padding: 30px;
            border-radius: 10px;
        }

        h1 {
            color: #1f4f3d;
            margin-bottom: 20px;
        }

        label {
            display: block;
            margin-top: 15px;
            font-weight: bold;
        }

        input,
        select {
            width: 100%;
            padding: 10px;
            margin-top: 5px;
            box-sizing: border-box;
        }

        button {
            background: #1f7a5a;
            color: white;
            border: none;
            padding: 12px 20px;
            margin-top: 25px;
            cursor: pointer;
            border-radius: 5px;
        }

        button:hover {
            background: #166647;
        }

        .back {
            display: inline-block;
            margin-top: 20px;
            text-decoration: none;
            color: #1d4ed8;
        }

        .error {
            background: #fee2e2;
            color: #991b1b;
            padding: 10px;
            margin-bottom: 20px;
            border-radius: 5px;
        }

        hr {
            margin: 30px 0;
        }
    </style>

</head>

<body>

<div class="container">

    <h1>Create Purchase Order</h1>

    @if ($errors->any())
        <div class="error">
            <strong>Please fix the following errors:</strong>
            <ul>
                @foreach ($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    <form method="POST" action="{{ route('purchase-orders.store') }}">

        @csrf

        <label>Supplier</label>

        <select name="supplier_id" required>

            <option value="">-- Select Supplier --</option>

            @foreach($suppliers as $supplier)

                <option value="{{ $supplier->id }}">
                    {{ $supplier->name }}
                </option>

            @endforeach

        </select>

        <label>Order Date</label>

        <input
            type="date"
            name="order_date"
            value="{{ date('Y-m-d') }}"
            required
        >

        <label>Status</label>

        <select name="status">

            <option value="Pending">Pending</option>

            <option value="Completed">Completed</option>

            <option value="Cancelled">Cancelled</option>

        </select>

        <label>Total Amount</label>

        <input
            type="number"
            name="total_amount"
            step="0.01"
            min="0"
            required
        >

        <hr>

        <h2>Purchase Item</h2>

        <label>Medicine</label>

        <select name="medicine_id">

            <option value="">-- Select Medicine --</option>

            @foreach($medicines as $medicine)

                <option value="{{ $medicine->id }}">
                    {{ $medicine->name }}
                </option>

            @endforeach

        </select>

        <label>Quantity</label>

        <input
            type="number"
            name="quantity"
            min="1"
        >

        <label>Unit Price</label>

        <input
            type="number"
            name="unit_price"
            step="0.01"
            min="0"
        >

        <button type="submit">
            Save Purchase Order
        </button>

    </form>

    <a class="back" href="{{ route('purchase-orders.index') }}">
        ← Back to Purchase Orders
    </a>

</div>

</body>

</html>