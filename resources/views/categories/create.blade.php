<!DOCTYPE html>
<html>
<head>
    <title>Add Category</title>
</head>

<body>

<h1>Add Category</h1>

<form action="{{ route('categories.store') }}" method="POST">

    @csrf

    <label>Name:</label>
    <input type="text" name="name">

    <br><br>

    <label>Description:</label>
    <textarea name="description"></textarea>

    <br><br>

    <button type="submit">
        Save Category
    </button>

</form>

<br>

<a href="{{ route('categories.index') }}">
    Back to Categories
</a>

</body>
</html>