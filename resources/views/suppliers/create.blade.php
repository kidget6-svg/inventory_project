<h1>Add Supplier</h1>


<form method="POST" action="/suppliers">

@csrf


Name:
<input type="text" name="name">


<br>


Phone:
<input type="text" name="phone">


<br>


Email:
<input type="email" name="email">


<br>


Address:
<input type="text" name="address">


<br>


<button type="submit">
Save Supplier
</button>


</form>