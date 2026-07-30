
   <?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Shelf extends Model
{
    protected $fillable = [
        'shelf_code',
        'location'
    ];

    public function medicines()
    {
        return $this->hasMany(Medicine::class);
    }
} //
