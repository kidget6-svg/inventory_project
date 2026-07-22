<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Pharmacy Inventory</title>

    <style>
        body { 
            font-family: Arial, sans-serif; 
            background: #f5f7fb; 
            margin: 0; 
            padding: 40px; 
        }

        .container { 
            max-width: 1100px; 
            margin: auto; 
            background: white; 
            padding: 30px; 
            border-radius: 10px; 
        }

        h1 { 
            color: #1f4f3d; 
        }

        .button { 
            background: #1f7a5a; 
            color: white; 
            padding: 10px 16px; 
            text-decoration: none; 
            border-radius: 6px; 
        }

        table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 25px; 
        }

        th, td { 
            padding: 12px; 
            border-bottom: 1px solid #ddd; 
            text-align: left; 
        }

        th { 
            background: #e9f5ef; 
        }

        .success { 
            background: #d1fae5; 
            padding: 12px; 
            margin: 16px 0; 
        }

        .low-stock { 
            color: #b91c1c; 
            font-weight: bold; 
        }

        .edit { 
            color: #1d4ed8; 
            text-decoration: none; 
            margin-right: 10px; 
        }

        .delete { 
            border: 0; 
            background: none; 
            color: #b91c1c; 
            cursor: pointer; 
            padding: 0; 
        }

        .inline-form { 
            display: inline; 
        }
    </style>
</head>

<body>

<div class="container">

    <h1>Pharmacy Inventory</h1>

    <a class="button" href="{{ route('medicines.create') }}">
        + Add Medicine
    </a>


    @if (session('success'))
        <p class="success">
            {{ session('success') }}
        </p>
    @endif


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

        @forelse ($medicines as $medicine)

            <tr>

                <td>
                    {{ $medicine->name }}
                </td>


                <td>
                    {{ $medicine->batch_number ?? '—' }}
                </td>


                <td>
                    {{ $medicine->category?->name ?? '—' }}
                </td>


                <td class="{{ $medicine->quantity <= $medicine->reorder_level ? 'low-stock' : '' }}">
                    {{ $medicine->quantity }}
                </td>


                <td>
                    {{ number_format($medicine->unit_price, 2) }}
                </td>


                <td>
                    {{ $medicine->expiry_date?->format('d M Y') ?? '—' }}
                </td>


                <td>

                    <a class="edit" href="{{ route('medicines.edit', $medicine) }}">
                        Edit
                    </a>


                    <form class="inline-form" 
                          method="POST" 
                          action="{{ route('medicines.destroy', $medicine) }}" 
                          onsubmit="return confirm('Delete this medicine?');">

                        @csrf
                        @method('DELETE')

                        <button class="delete" type="submit">
                            Delete
                        </button>

                    </form>

                </td>

            </tr>


        @empty

            <tr>
                <td colspan="7">
                    No medicines added yet.
                </td>
            </tr>

        @endforelse


        </tbody>

    </table>

</div>

</body>
</html>