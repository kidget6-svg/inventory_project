<h1>Suppliers</h1>

<a href="/suppliers/create">
    + Add Supplier
</a>


<table border="1">

<tr>
    <th>ID</th>
    <th>Name</th>
    <th>Phone</th>
    <th>Email</th>
    <th>Address</th>
</tr>


@foreach($suppliers as $supplier)

<tr>

<td>{{ $supplier->id }}</td>

<td>{{ $supplier->name }}</td>

<td>{{ $supplier->phone }}</td>

<td>{{ $supplier->email }}</td>

<td>{{ $supplier->address }}</td>

</tr>

@endforeach


</table>