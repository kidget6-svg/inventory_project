const fs = require('fs');
const filePath = 'resources/js/pages/CashierDashboard.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// Find the conditional block and replace it
// The block starts with {completedSale.change_amount > 0 && (
// and ends with )}
const startMarker = '{completedSale.change_amount > 0 && (';
const endMarker = ')}';

let startIndex = content.indexOf(startMarker);
if (startIndex === -1) {
    console.log('Start marker not found');
    process.exit(1);
}

// Find the end of the conditional block
// We need to find the matching )} after the start marker
let searchFrom = startIndex + startMarker.length;
let endIndex = content.indexOf(endMarker, searchFrom);
if (endIndex === -1) {
    console.log('End marker not found');
    process.exit(1);
}

// Include the )} in the replacement
endIndex += endMarker.length;

const oldBlock = content.substring(startIndex, endIndex);
console.log('Found block:');
console.log(oldBlock);

const newBlock = '<div className="flex justify-between">\n                                <span className="text-xs text-gray-500">Change</span>\n                                <span className="text-sm font-medium text-green-600">${parseFloat(completedSale.change_amount || 0).toFixed(2)}</span>\n                            </div>';

content = content.substring(0, startIndex) + newBlock + content.substring(endIndex);
fs.writeFileSync(filePath, content, 'utf8');
console.log('Change applied successfully');
