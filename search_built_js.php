<?php

$content = file_get_contents(__DIR__ . '/public/build/assets/app-BqZNokHS.js');

$searchTerms = [
    'Failed to generate PDF preview',
    'Failed to approve',
    'Failed to send Purchase Order',
    'send-email',
    '/preview',
    '/approve',
    'purchase-orders',
    'Generate PDF',
    'Resend Purchase Order PDF',
    'Send Purchase Order PDF',
];

foreach ($searchTerms as $term) {
    $pos = strpos($content, $term);
    if ($pos !== false) {
        // Show context around the match
        $start = max(0, $pos - 50);
        $end = min(strlen($content), $pos + strlen($term) + 100);
        $context = substr($content, $start, $end - $start);
        echo "FOUND '$term' at position $pos\n";
        echo "Context: ..." . $context . "...\n\n";
    } else {
        echo "NOT FOUND: '$term'\n\n";
    }
}
