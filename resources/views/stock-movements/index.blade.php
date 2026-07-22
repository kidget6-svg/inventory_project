<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Stock In / Stock Out</title>
    <style>
        body { font-family: Arial, sans-serif; background: #f5f7fb; margin: 0; padding: 40px; }
        .container { max-width: 1100px; margin: auto; }
        .box { background: white; padding: 25px; border-radius: 10px; margin-bottom: 25px; }
        h1, h2 { color: #1f4f3d; }
        label { display: block; margin-top: 14px; font-weight: bold; }
        select, input, textarea { width: 100%; padding: 10px; margin-top: 5px; box-sizing: border-box; }
        textarea { min-height: 80px; }
        .button { border: 0; background: #1f7a5a; color: white; padding: 11px 16px; border-radius: 6px; cursor: pointer; margin-top: 20px; }
        .link { color: #1f4f3d; text-decoration: none; margin-right: 15px; }
        .success { background: #d1fae5; padding: 12px; color: #065f46; margin-bottom: 15px; }
        .errors { background: #fee2e2; color: #991b1b; padding: 12px; margin-bottom: 15px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 12px; border-bottom: 1px solid #ddd; text-align: left; }
        th { background: #e9f5ef; }
        .in { color: #15803d; font-weight: bold; }
        .out { color: #b91c1c; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Stock In / Stock Out</h1>

        <a class="link" href="{{ route('dashboard') }}">Dashboard</a>
        <a class="link" href="{{ route('medicines.index') }}">Medicines</a>

        <div class="box">
            <h2>Record Stock Movement</h2>

            @if (session('success'))
                <div class="success">{{ session('success') }}</div>
            @endif

            @if ($errors->any())
                <div class="errors">
                    <ul>
                        @foreach ($errors->all() as $error)
                            <li>{{ $error }}</li>
                        @endforeach
                    </ul>
                </div>
            @endif

            <form method="POST" action="{{ route('stock-movements.store') }}">
                @csrf

                <label>Medicine *</label>
                <select name="medicine_id" required>
                    <option value="">Select a medicine</option>
                    @foreach ($medicines as $medicine)
                        <option value="{{ $medicine->id }}" @selected(old('medicine_id') == $medicine->id)>
                            {{ $medicine->name }} (Current stock: {{ $medicine->quantity }})
                        </option>
                    @endforeach
                </select>

                <label>Movement Type *</label>
                <select name="type" required>
                    <option value="in" @selected(old('type') === 'in')>Stock In (delivery received)</option>
                    <option value="out" @selected(old('type') === 'out')>Stock Out (sold or issued)</option>
                </select>

                <label>Quantity *</label>
                <input type="number" name="quantity" min="1" value="{{ old('quantity') }}" required>

                <label>Reference</label>
                <input type="text" name="reference" placeholder="e.g. Invoice No. 001" value="{{ old('reference') }}">

                <label>Notes</label>
                <textarea name="notes" placeholder="Optional notes">{{ old('notes') }}</textarea>

                <button class="button" type="submit">Save Movement</button>
            </form>
        </div>

        <div class="box">
            <h2>Stock Movement History</h2>

            @if ($movements->isEmpty())
                <p>No stock movements recorded yet.</p>
            @else
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Medicine</th>
                            <th>Type</th>
                            <th>Quantity</th>
                            <th>Reference</th>
                            <th>Notes</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($movements as $movement)
                            <tr>
                                <td>{{ $movement->created_at->format('d M Y, H:i') }}</td>
                                <td>{{ $movement->medicine->name }}</td>
                                <td class="{{ $movement->type }}">
                                    {{ $movement->type === 'in' ? 'Stock In' : 'Stock Out' }}
                                </td>
                                <td>{{ $movement->quantity }}</td>
                                <td>{{ $movement->reference ?? '—' }}</td>
                                <td>{{ $movement->notes ?? '—' }}</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            @endif
        </div>
    </div>
</body>
</html>