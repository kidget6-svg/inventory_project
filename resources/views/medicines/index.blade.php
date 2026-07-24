<!DOCTYPE html>
<html>

<head>

<title>Pharmacy Inventory</title>

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

    display:inline-block;
    padding:10px 18px;
    background:#1f7a5a;
    color:white;
    text-decoration:none;
    border-radius:6px;
    margin-bottom:20px;

}


table{

    width:100%;
    border-collapse:collapse;

}


th{

    background:#e8f5ef;
    padding:15px;
    text-align:left;

}


td{

    padding:15px;
    border-bottom:1px solid #ddd;

}


/* Edit Button */

.edit-btn{

    background:#2563eb;
    color:white;
    padding:8px 15px;
    border-radius:5px;
    text-decoration:none;
    margin-right:8px;
    display:inline-block;

}


.edit-btn:hover{

    background:#1d4ed8;

}



/* Delete Button */

.delete-btn{

    background:#dc2626;
    color:white;
    padding:8px 15px;
    border:none;
    border-radius:5px;
    cursor:pointer;

}


.delete-btn:hover{

    background:#b91c1c;

}


</style>

</head>


<body>


<div class="container">


<h1>Pharmacy Inventory</h1>
@if(session('success'))

<div style="
background:#dcfce7;
color:#166534;
padding:12px;
border-radius:6px;
margin-bottom:20px;
">
{{ session('success') }}
</div>

@endif

<a href="{{ route('medicines.create') }}" class="btn">
+ Add Medicine
</a>



<table>


<thead>

<tr>

<th>Medicine</th>
<th>Batch No.</th>
<th>Category</th>
<th>Quantity</th>
<th>Unit Price</th>
<th>Expiry Date</th>
<th>Actions</th>

</tr>

</thead>



<tbody>


@foreach($medicines as $medicine)


<tr>


<td>
{{ $medicine->name }}
</td>



<td>
{{ $medicine->batch_number }}
</td>



<td>
{{ $medicine->category->name ?? 'No Category' }}
</td>



<td>
{{ $medicine->quantity }}
</td>



<td>
{{ number_format($medicine->unit_price,2) }}
</td>



<td>
{{ $medicine->expiry_date->format('d M Y') }}
</td>



<td>


<a href="{{ route('medicines.edit',$medicine->id) }}"
class="edit-btn">

Edit

</a>



<form action="{{ route('medicines.destroy',$medicine->id) }}"
method="POST"
style="display:inline;">


@csrf

@method('DELETE')


<button type="submit"
class="delete-btn"
onclick="return confirm('Are you sure you want to delete this medicine?')">

Delete

</button>


</form>


</td>



</tr>


@endforeach



</tbody>


</table>



</div>


</body>

</html>