<?php

namespace App\Jobs;

use App\Services\PurchaseOrderService;
use App\Models\PurchaseOrder;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendPurchaseOrderEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public PurchaseOrder $purchaseOrder,
    ) {}

    public function handle(PurchaseOrderService $service): void
    {
        $service->sendToSupplier($this->purchaseOrder);
    }
}
