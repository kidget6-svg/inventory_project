const fs = require('fs');
const filePath = 'resources/js/pages/CashierDashboard.jsx';
let content = fs.readFileSync(filePath, 'utf8');

const oldText = `{completedSale.change_amount > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-xs text-gray-500">Change Returned</span>
                                    <span className="text-sm font-medium text-green-600">${'{'}parseFloat(completedSale.change_amount).toFixed(2){'}'}</span>
                                </div>
                            )}`;

const newText = `<div className="flex justify-between">
                                <span className="text-xs text-gray-500">Change</span>
                                <span className="text-sm font-medium text-green-600">${'{'}parseFloat(completedSale.change_amount || 0).toFixed(2){'}'}</span>
                            </div>`;

if (content.includes(oldText)) {
    content = content.replace(oldText, newText);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Change applied successfully');
} else {
    console.log('Old text not found');
    if (content.includes('Change Returned')) {
        console.log('Change Returned still in file');
    } else {
        console.log('Change Returned not found - may already be changed');
    }
}
