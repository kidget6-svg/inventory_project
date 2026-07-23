<!DOCTYPE html>
<html>

<head>

<title>Sales</title>

<style>

body{
    font-family: Arial;
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
    color:#14532d;
}


.btn{

    background:#1f7a5a;
    color:white;
    padding:10px 18px;
    text-decoration:none;
    border-radius:6px;

}


table{

    width:100%;
    margin-top:25px;
    border-collapse:collapse;

}


th{

    background:#e8f5ef;
    padding:15px;
}


td{

    padding:15px;
    border-bottom:1px solid #ddd;

}


.delete-btn{

    background:red;
    color:white;
    border:none;
    padding:8px;
    border-radius:5px;

}

</style>

</head>


<body>


<div class="container">


<h1>Sales Management</h1>


<a href="{{ route('sales.create') }}" class="btn">
+ Create Sale
</a>



<table>


<tr>

<th>ID</th>
<th>Date</th>
<th>Total Amount</th>
<th>Action</th>

</tr>



@foreach($sales as $sale)


<tr>


<td>
{{ $sale->id }}
</td>


<td>
{{ $sale->sale_date }}
</td>


<td>
{{ number_format($sale->total_amount,2) }}
</td>


<td>


<form action="{{ route('sales.destroy',$sale->id) }}"
method="POST">


@csrf

@method('DELETE')


<button class="delete-btn"
onclick="return confirm('Delete this sale?')">

Delete

</button>


</form>


</td>


</tr>


@endforeach



</table>



</div>


</body>

</html>