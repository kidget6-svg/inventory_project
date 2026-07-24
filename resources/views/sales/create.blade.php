<!DOCTYPE html>
<html>

<head>

<title>Create Sale</title>


<style>

body{

font-family:Arial;
background:#f5f7fb;
padding:40px;

}


.container{

background:white;
width:600px;
margin:auto;
padding:30px;
border-radius:15px;

}


input,select{

width:100%;
padding:10px;
margin:10px 0;

}


button{

background:#1f7a5a;
color:white;
padding:12px 20px;
border:none;
border-radius:5px;

}

</style>


</head>



<body>


<div class="container">


<h1>Create Sale</h1>



<form method="POST"
action="{{ route('sales.store') }}">


@csrf



<label>
Sale Date
</label>


<input type="date"
name="sale_date"
value="{{ date('Y-m-d') }}">





<label>
Medicine
</label>


<select name="medicine_id">


<option>
Select Medicine
</option>



@foreach($medicines as $medicine)


<option value="{{ $medicine->id }}">

{{ $medicine->name }}

(Stock: {{ $medicine->quantity }})

</option>


@endforeach



</select>





<label>
Quantity
</label>


<input type="number"
name="quantity"
min="1">





<label>
Unit Price
</label>


<input type="number"
name="unit_price"
step="0.01">





<button type="submit">

Save Sale

</button>




</form>



</div>



</body>


</html>