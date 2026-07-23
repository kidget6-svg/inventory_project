<!DOCTYPE html>
<html>

<head>

<title>Reports</title>

<style>

body{
    font-family:Arial;
    background:#f5f7fb;
    padding:40px;
}

.container{
    width:90%;
    margin:auto;
    background:white;
    padding:30px;
    border-radius:15px;
}

h1{
    color:#14532d;
}

h2{
    margin-top:40px;
    color:#14532d;
}

table{
    width:100%;
    border-collapse:collapse;
    margin-top:15px;
}

th{
    background:#e8f5ef;
    padding:12px;
    text-align:left;
}

td{
    padding:12px;
    border-bottom:1px solid #ddd;
}

.empty{
    color:#777;
    font-style:italic;
}

</style>

</head>

<body>

<div class="container">

<h1>Pharmacy Reports</h1>

<h2>Inventory Report</h2>

<table>

<tr>
<th>Medicine</th>
<th>Category</th>
<th>Quantity</th>
<th>Unit Price</th>
</tr>

@forelse($medicines as $medicine)

<tr>

<td>{{ $medicine->name }}</td>

<td>{{ $medicine->category->name ?? 'No Category' }}</td>

<td>{{ $medicine->quantity }}</td>

<td>{{ number_format($medicine->unit_price,2) }}</td>

</tr>

@empty

<tr>

<td colspan="4" class="empty">
No medicines found.
</td>

</tr>

@endforelse

</table>


<h2>Sales Report</h2>

<table>

<tr>
<th>ID</th>
<th>Date</th>
<th>Total Amount</th>
</tr>

@forelse($sales as $sale)

<tr>

<td>{{ $sale->id }}</td>

<td>{{ $sale->sale_date }}</td>

<td>{{ number_format($sale->total_amount,2) }}</td>

</tr>

@empty

<tr>

<td colspan="3" class="empty">
No sales found.
</td>

</tr>

@endforelse

</table>


<h2>Purchase Orders Report</h2>

<table>

<tr>
<th>ID</th>
<th>Date</th>
</tr>

@forelse($purchases as $purchase)

<tr>

<td>{{ $purchase->id }}</td>

<td>{{ $purchase->created_at }}</td>

</tr>

@empty

<tr>

<td colspan="2" class="empty">
No purchase orders found.
</td>

</tr>

@endforelse

</table>


<h2>Low Stock Report</h2>

<table>

<tr>
<th>Medicine</th>
<th>Quantity</th>
<th>Reorder Level</th>
</tr>

@forelse($lowStock as $medicine)

<tr>

<td>{{ $medicine->name }}</td>

<td>{{ $medicine->quantity }}</td>

<td>{{ $medicine->reorder_level }}</td>

</tr>

@empty

<tr>

<td colspan="3" class="empty">
No low-stock medicines.
</td>

</tr>

@endforelse

</table>


<h2>Expiring Medicines Report</h2>

<table>

<tr>
<th>Medicine</th>
<th>Expiry Date</th>
</tr>

@forelse($expiring as $medicine)

<tr>

<td>{{ $medicine->name }}</td>

<td>{{ $medicine->expiry_date->format('d M Y') }}</td>

</tr>

@empty

<tr>

<td colspan="2" class="empty">
No medicines expiring soon.
</td>

</tr>

@endforelse

</table>

</div>

</body>

</html>