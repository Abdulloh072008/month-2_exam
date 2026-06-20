import { useEffect, useMemo, useState } from 'react';
import { User, DollarSign, FolderOpen, CalendarDays, Plus, Check, AlertCircle } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { useContacts } from '../../../store/Contacts/Contacts';
import { useDebts } from '../../../store/Debts/Debts';
import AddFolderDialog from '../../../store/Folders/AddFolderDialog/AddFolderDialog';

type DebtType = 'i-owe' | 'owes-me';

interface Contact {
  id: string;
  user_id: string;
  folder_id: string;
  name: string;
  phone?: string;
  email?: string;
  notes?: string;
}

interface Folder {
  id: string;
  user_id: string;
  name: string;
  color?: string;
}

interface Debt {
  id: string;
  user_id: string;
  contact_id: string;
  direction: 'i_owe_them' | 'they_owe_me';
  amount: number;
  currency: string;
  description: string;
  due_date: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface Props {
  open: boolean;
  defaultType: DebtType;
  onOpenChange: (open: boolean) => void;
  contacts: Contact[];
  folders: Folder[];
  onContactCreated: (contact: Contact) => void;
  onFolderCreated: (folder: Folder) => void;
  onDebtCreated: (debt: Debt) => void;
  editingDebt?: Debt | null;
  onDebtUpdated?: (debt: Debt) => void;
}

interface DebtFormValues {
  name: string;
  amount: string;
  type: DebtType;
  folderId: string;
  dueDate: string;
  description: string;
}

function evaluateExpression(raw: string): number | null {
  const expr = raw.replace(/=/g, '').trim();
  if (!expr) return null;
  if (!/^[0-9+\-*/().\s]+$/.test(expr)) return null;
  try {
    const result = Function(`"use strict"; return (${expr})`)();
    if (typeof result !== 'number' || !isFinite(result)) return null;
    return Math.round(result * 100) / 100;
  } catch {
    return null;
  }
}

export default function AddDebtDialog({
  open,
  defaultType,
  onOpenChange,
  contacts,
  folders,
  onContactCreated,
  onFolderCreated,
  onDebtCreated,
  editingDebt,
  onDebtUpdated,
}: Props) {
  const { CreateContactZustand } = useContacts();
  const { CreateDebtZustand, UpdateDebtZustand } = useDebts();

  const [addFolderOpen, setAddFolderOpen] = useState(false);
  const [amountPreview, setAmountPreview] = useState<number | null>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    setError,
    clearErrors,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DebtFormValues>({
    defaultValues: {
      name: '',
      amount: '',
      type: defaultType,
      folderId: '',
      dueDate: '',
      description: '',
    },
  });

  useEffect(() => {
    if (open) {
      if (editingDebt) {
        const contact = contacts.find((c) => c.id === editingDebt.contact_id);
        const formattedDate = editingDebt.due_date 
          ? new Date(editingDebt.due_date).toISOString().split('T')[0] 
          : '';
        reset({
          name: contact?.name || '',
          amount: String(Math.abs(editingDebt.amount)),
          type: editingDebt.direction === 'i_owe_them' ? 'i-owe' : 'owes-me',
          folderId: contact?.folder_id || '',
          dueDate: formattedDate,
          description: editingDebt.description || '',
        });
      } else {
        reset({
          name: '',
          amount: '',
          type: defaultType,
          folderId: '',
          dueDate: '',
          description: '',
        });
      }
      setAmountPreview(null);
    }
  }, [open, defaultType, reset, editingDebt, contacts]);

  const name = watch('name');

  const existingContact = useMemo(() => {
    const trimmed = name.trim().toLowerCase();
    if (!trimmed) return null;
    return contacts.find((c) => c.name.trim().toLowerCase() === trimmed) ?? null;
  }, [name, contacts]);

  const suggestions = useMemo(() => {
    const trimmed = name.trim().toLowerCase();
    if (!trimmed || existingContact) return [];
    return contacts.filter((c) => c.name.toLowerCase().includes(trimmed)).slice(0, 5);
  }, [name, contacts, existingContact]);

  useEffect(() => {
    if (existingContact) {
      setValue('folderId', existingContact.folder_id);
      clearErrors('folderId');
    }
  }, [existingContact, setValue, clearErrors]);

  async function onSubmit(values: DebtFormValues) {
    const finalAmount = evaluateExpression(values.amount);
    if (finalAmount === null || finalAmount <= 0) {
      setError('amount', { type: 'validate', message: 'Please enter a valid amount.' });
      return;
    }

    try {
      const direction: Debt['direction'] = values.type === 'i-owe' ? 'i_owe_them' : 'they_owe_me';

      if (editingDebt) {
        const updatedDebt = await UpdateDebtZustand(editingDebt.id, {
          direction,
          amount: finalAmount,
          description: values.description.trim(),
          due_date: values.dueDate || undefined,
        });
        if (onDebtUpdated) {
          onDebtUpdated(updatedDebt);
        }
        onOpenChange(false);
        return;
      }

      if (!existingContact && !values.folderId) {
        setError('folderId', { type: 'validate', message: 'Please select a folder for the new contact.' });
        return;
      }

      let contactId = existingContact?.id;

      if (!contactId) {
        const newContact = await CreateContactZustand({
          name: values.name.trim(),
          folder_id: values.folderId,
        });
        contactId = newContact.id;
        onContactCreated(newContact);
      }

      const newDebt = await CreateDebtZustand({
        contact_id: contactId!,
        direction,
        amount: finalAmount,
        currency: 'TJS',
        description: values.description.trim(),
        due_date: values.dueDate || undefined,
      });

      onDebtCreated(newDebt);
      onOpenChange(false);
    } catch (err) {
      setError('root', {
        type: 'server',
        message: err?.response?.data?.error || 'Something went wrong. Please try again.',
      });
    }
  }

  function handleFolderCreated(folder: Folder) {
    onFolderCreated(folder);
    setValue('folderId', folder.id);
    clearErrors('folderId');
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent 
          className="sm:max-w-[520px] p-0 gap-0 overflow-hidden rounded-2xl"
          onPointerDownOutside={(e) => {
            const target = e.target as HTMLElement;
            if (target && (
              target.closest('[role="listbox"]') || 
              target.closest('[data-radix-select-viewport]') ||
              target.closest('[data-radix-popper-content-wrapper]')
            )) {
              e.preventDefault();
            }
          }}
        >
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle className="text-xl font-semibold text-gray-900">{editingDebt ? 'Edit Debt' : 'Add Debt'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="px-6 pb-6 flex flex-col gap-5">
              <div className="flex flex-col gap-1.5 relative">
                <Label className="text-sm font-medium text-gray-700">Person Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Type a name..."
                    disabled={!!editingDebt}
                    className="pl-9 h-10 text-sm border-gray-200 focus-visible:ring-1 focus-visible:ring-gray-300"
                    {...register('name', { required: 'Please enter a person name.' })}
                  />
                </div>

                {errors.name && (
                  <p className="flex items-center gap-1.5 text-xs text-red-600 mt-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.name.message}
                  </p>
                )}

                {!errors.name && existingContact && (
                  <p className="flex items-center gap-1.5 text-xs text-emerald-600 mt-1">
                    <Check className="h-3.5 w-3.5" />
                    Existing contact — this debt will be linked to {existingContact.name}.
                  </p>
                )}

                {!existingContact && suggestions.length > 0 && (
                  <div className="absolute z-10 top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden">
                    {suggestions.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setValue('name', c.name)}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-sm font-medium text-gray-700">Amount</Label>
                  <Controller
                    name="amount"
                    control={control}
                    rules={{
                      required: 'Please enter an amount.',
                      validate: (value) => {
                        const evaluated = evaluateExpression(value);
                        return (evaluated !== null && evaluated > 0) || 'Please enter a valid amount.';
                      },
                    }}
                    render={({ field }) => (
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">
                          <DollarSign className="h-4 w-4" />
                        </span>
                        <Input
                          placeholder="0.00 or 20+30="
                          value={field.value}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value);

                            const hasEquals = value.includes('=');
                            const evaluated = evaluateExpression(value);
                            if (hasEquals) {
                              if (evaluated !== null) {
                                field.onChange(String(evaluated));
                                setAmountPreview(null);
                              }
                            } else {
                              const hasOperator = /[+\-*/]/.test(value);
                              setAmountPreview(hasOperator ? evaluated : null);
                            }
                          }}
                          onBlur={() => {
                            field.onBlur();
                            const evaluated = evaluateExpression(field.value);
                            if (evaluated !== null) {
                              field.onChange(String(evaluated));
                              setAmountPreview(null);
                            }
                          }}
                          className="pl-9 h-10 text-sm border-gray-200 focus-visible:ring-1 focus-visible:ring-gray-300"
                        />
                      </div>
                    )}
                  />
                  {amountPreview !== null && (
                    <p className="text-xs text-gray-500 mt-0.5">= {amountPreview.toFixed(2)}</p>
                  )}
                  {errors.amount && (
                    <p className="flex items-center gap-1.5 text-xs text-red-600">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {errors.amount.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label className="text-sm font-medium text-gray-700">Type</Label>
                  <Controller
                    name="type"
                    control={control}
                    render={({ field }) => (
                      <div className="flex h-10 rounded-md border border-gray-200 overflow-hidden">
                        <button
                          type="button"
                          onClick={() => field.onChange('i-owe')}
                          className={`flex-1 text-sm font-medium transition-colors ${
                            field.value === 'i-owe'
                              ? 'bg-red-500 text-white'
                              : 'bg-white text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          I Owe
                        </button>
                        <button
                          type="button"
                          onClick={() => field.onChange('owes-me')}
                          className={`flex-1 text-sm font-medium transition-colors border-l border-gray-200 ${
                            field.value === 'owes-me'
                              ? 'bg-emerald-500 text-white'
                              : 'bg-white text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          Owes Me
                        </button>
                      </div>
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-sm font-medium text-gray-700">Folder</Label>
                  <div className="flex gap-2">
                    <Controller
                      name="folderId"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={!!existingContact}
                        >
                          <SelectTrigger className="h-10 text-sm border-gray-200 flex-1 min-w-0">
                            <FolderOpen className="h-4 w-4 text-gray-400 mr-1.5 shrink-0" />
                            <SelectValue placeholder="Select folder..." />
                          </SelectTrigger>
                          <SelectContent>
                            {folders.map((f) => (
                              <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      disabled={!!existingContact}
                      onClick={() => setAddFolderOpen(true)}
                      className="h-10 w-10 border-gray-200 shrink-0"
                    >
                      <Plus className="h-4 w-4 text-gray-500" />
                    </Button>
                  </div>
                  {existingContact && (
                    <p className="text-xs text-gray-400">Folder locked to existing contact's folder.</p>
                  )}
                  {errors.folderId && (
                    <p className="flex items-center gap-1.5 text-xs text-red-600">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {errors.folderId.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label className="text-sm font-medium text-gray-700">Due Date (Optional)</Label>
                  <div className="relative">
                    <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    <Input
                      type="date"
                      className="pl-9 h-10 text-sm border-gray-200 focus-visible:ring-1 focus-visible:ring-gray-300 text-gray-500"
                      {...register('dueDate')}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-medium text-gray-700">Description</Label>
                <Textarea
                  placeholder="Add notes or context..."
                  className="min-h-[100px] text-sm border-gray-200 focus-visible:ring-1 focus-visible:ring-gray-300 resize-none"
                  {...register('description')}
                />
              </div>

              {errors.root && (
                <p className="flex items-center gap-1.5 text-xs text-red-600">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errors.root.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/60">
              <Button
                type="button"
                variant="ghost"
                className="text-sm text-gray-600 hover:text-gray-900"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="text-sm bg-gray-900 hover:bg-gray-800 text-white px-5"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Debt'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AddFolderDialog open={addFolderOpen} onOpenChange={setAddFolderOpen} onCreate={handleFolderCreated} />
    </>
  );
}