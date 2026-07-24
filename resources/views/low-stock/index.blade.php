<!DOCTYPE html>
<html>

<head>

<title>Low Stock Alert</title>

<style>

body{
    font-family:Arial;
    background:#f5f7fb;
    padding:40px;
}


.container{

    background:white;
    padding:30px;
    border-radius:15px;
    width:90%;
    margin:auto;

}


h1{

color:#b91c1c;

}


table{

width:100%;
border-collapse:collapse;

}


th{

background:#fee2e2;
padding:15px;
text-align:left;

}


td{

padding:15px;
border-bottom:1px solid #ddd;

}


</style>

</head>


<body>


<div class="container">


<h1>Low Stock Alert</h1>


<table>


<tr>

<th>Medicine</th>
<th>Batch No</th>
<th>Quantity</th>
<th>Reorder Level</th>

</tr>


@forelse($medicines as $medicine)


<tr>

<td>{{ $medicine->name }}</td>

<td>{{ $medicine->batch_number }}</td>

<td>{{ $medicine->quantity }}</td>

<td>{{ $medicine->reorder_level }}</td>


</tr>


@empty

<tr>

<td colspan="4">
No low-stock medicines found.
</td>

</tr>

@endforelse


</table>


</div>


</body>

</html>