<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Edit Medicine</title>
    <style>
        body { font-family: Arial, sans-serif; background: #f5f7fb; margin: 0; padding: 40px; }
        .container { max-width: 750px; margin: auto; background: white; padding: 30px; border-radius: 10px; }
        h1 { color: #1f4f3d; }
        label { display: block; margin-top: 15px; font-weight: bold; }
        input { width: 100%; padding: 10px; margin-top: 5px; box-sizing: border-box; }
        .button { border: 0; background: #1f7a5a; color: white; padding: 11px 16px; margin-top: 22px; border-radius: 6px; cursor: pointer; }
        .back { margin-left: 10px; color: #1f4f3d; }
        .errors { background: #fee2e2; color: #991b1b; padding: 12px; margin-bottom: 16px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Edit Medicine</h1>

        @if ($errors->any())
            <div class="errors">
                <ul>
                    @foreach ($errors->all() as $error)
                        <li>{{ $error }}</li>
                    @endforeach
                </ul>
            </div>
        @endif

        <form method="POST" action="{{ route('medicines.update', $medicine) }}">
            @csrf
            @method('PUT')

            <label>Medicine Name *</label>
            <input type="text" name="name" value="{{ old('name', $medicine->name) }}" required>

            <label>Generic Name</label>
            <input type="text" name="generic_name" value="{{ old('generic_name', $medicine->generic_name) }}">

            <label>Batch Number</label>
            <input type="text" name="batch_number" value="{{ old('batch_number', $medicine->batch_number) }}">

            <label>Category</label>
            <input type="text" name="category" value="{{ old('category', $medicine->category) }}">

            <label>Quantity *</label>
            <input type="number" name="quantity" min="0" value="{{ old('quantity', $medicine->quantity) }}" required>

            <label>Unit Price *</label>
            <input type="number" name="unit_price" min="0" step="0.01" value="{{ old('unit_price', $medicine->unit_price) }}" required>

            <label>Low-Stock Warning Level *</label>
            <input type="number" name="reorder_level" min="0" value="{{ old('reorder_level', $medicine->reorder_level) }}" required>

            <label>Expiry Date</label>
            <input type="date" name="expiry_date" value="{{ old('expiry_date', $medicine->expiry_date?->format('Y-m-d')) }}">

            <button class="button" type="submit">Update Medicine</button>
            <a class="back" href="{{ route('medicines.index') }}">Cancel</a>
        </form>
    </div>
</body>
</html>