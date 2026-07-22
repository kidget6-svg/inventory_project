<!DOCTYPE html>
<html>
<head>
    <title>Add Medicine</title>
</head>

<body>

<h1>Add Medicine</h1>

@if ($errors->any())
    <div>
        <strong>Errors:</strong>
        <ul>
            @foreach ($errors->all() as $error)
                <li>{{ $error }}</li>
            @endforeach
        </ul>
    </div>
@endif


<form action="{{ route('medicines.store') }}" method="POST">

    @csrf

    <!-- Medicine Name -->
    <div>
        <label>Name:</label>
        <input 
            type="text" 
            name="name" 
            value="{{ old('name') }}"
        >
    </div>

    <br>


    <!-- Generic Name -->
    <div>
        <label>Generic Name:</label>
        <input 
            type="text" 
            name="generic_name" 
            value="{{ old('generic_name') }}"
        >
    </div>

    <br>


    <!-- Batch Number -->
    <div>
        <label>Batch Number:</label>
        <input 
            type="text" 
            name="batch_number" 
            value="{{ old('batch_number') }}"
        >
    </div>

    <br>


    <!-- Category -->
    <div>
        <label>Category:</label>

        <select name="category_id">

            <option value="">
                Select Category
            </option>

            @foreach($categories as $category)

                <option value="{{ $category->id }}">
                    {{ $category->name }}
                </option>

            @endforeach

        </select>

    </div>

    <br>


    <!-- Quantity -->
    <div>
        <label>Quantity:</label>
        <input 
            type="number" 
            name="quantity"
            value="{{ old('quantity') }}"
        >
    </div>

    <br>


    <!-- Unit Price -->
    <div>
        <label>Unit Price:</label>
        <input 
            type="number" 
            step="0.01"
            name="unit_price"
            value="{{ old('unit_price') }}"
        >
    </div>

    <br>


    <!-- Reorder Level -->
    <div>
        <label>Reorder Level:</label>
        <input 
            type="number" 
            name="reorder_level"
            value="{{ old('reorder_level') }}"
        >
    </div>

    <br>


    <!-- Expiry Date -->
    <div>
        <label>Expiry Date:</label>
        <input 
            type="date" 
            name="expiry_date"
            value="{{ old('expiry_date') }}"
        >
    </div>

    <br>


    <button type="submit">
        Save Medicine
    </button>

</form>


<br>

<a href="{{ route('medicines.index') }}">
    Back to Medicines
</a>


</body>
</html>