import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Label } from '../../../components/ui/label';

export default function PaymentDialog({ open, mode, remaining, onOpenChange, onSubmit }) {
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setAmount('');
  }, [open]);

  const isPayment = mode === 'payment';

  async function handleSubmit() {
    if (!amount) return;

    setSaving(true);
    await onSubmit(Number(amount));
    setSaving(false);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] p-6 gap-4">
        <DialogHeader>
          <DialogTitle>{isPayment ? 'Add Payment' : 'Add Increase'}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-1.5">
          <Label>Amount</Label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <p className="text-xs text-gray-400">Remaining: {remaining}</p>
        </div>

        <div className="flex justify-end gap-3 mt-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}