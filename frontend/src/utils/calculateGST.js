export const calculateGST = (amount, gstRate = 18) => {
  const gstAmount = (amount * gstRate) / 100;
  const cgst = gstAmount / 2;
  const sgst = gstAmount / 2;
  const grandTotal = amount + gstAmount;

  return {
    subtotal: parseFloat(amount.toFixed(2)),
    gstRate,
    gstAmount: parseFloat(gstAmount.toFixed(2)),
    cgst: parseFloat(cgst.toFixed(2)),
    sgst: parseFloat(sgst.toFixed(2)),
    grandTotal: parseFloat(grandTotal.toFixed(2)),
  };
};