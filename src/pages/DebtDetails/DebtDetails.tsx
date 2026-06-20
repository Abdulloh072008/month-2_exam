import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Pencil, Trash2, Plus, Minus } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { useDebts } from '../../store/Debts/Debts';
import { useContacts } from '../../store/Contacts/Contacts';
import { useFolders } from '../../store/Folders/Folder';
import AddDebtDialog from '../Debts/AddDebtDialog/AddDebtDialog';
import PaymentDialog from '../Debts/PaymentDialog/PaymentDialog';

const DebtDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const { GetDebtByIdZustand, UpdateDebtZustand, DeleteDebtZustand, GetPaymentsZustand, AddPaymentZustand } = useDebts();
    const { GetContactByIdZustand } = useContacts();
    const { GetFolderByIdZustand } = useFolders();

    const [debt, setDebt] = useState(null);
    const [contact, setContact] = useState(null);
    const [folder, setFolder] = useState(null);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    const [editOpen, setEditOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState(null);

    async function loadData(silent = false) {
        if (!silent) setLoading(true);

        const debtData = await GetDebtByIdZustand(id);
        const contactData = await GetContactByIdZustand(debtData.contact_id);
        const paymentsData = await GetPaymentsZustand(id);

        let folderData = null;
        if (contactData.folder_id) {
            folderData = await GetFolderByIdZustand(contactData.folder_id);
        }

        setDebt(debtData);
        setContact(contactData);
        setPayments(paymentsData);
        setFolder(folderData);
        if (!silent) setLoading(false);
    }

    useEffect(() => {
        loadData();
    }, [id]);

    if (loading || !debt) {
        return <p className="p-8 text-muted-foreground bg-background min-h-screen">Loading...</p>;
    }

    const owesMe = debt.direction === 'they_owe_me';

    let paid = 0;
    for (const p of payments) {
        paid += p.amount;
    }

    const total = debt.amount;
    const remaining = total - paid;
    let pct = 0;
    if (total > 0) {
        pct = Math.round((paid / total) * 100);
    }
    if (pct > 100) pct = 100;

    let barColor = 'bg-red-500 dark:bg-red-600';
    if (owesMe) barColor = 'bg-emerald-500 dark:bg-emerald-600';
    if (pct === 100) barColor = 'bg-muted-foreground';

    async function handleDelete() {
        const sure = confirm('Delete this debt?');
        if (!sure) return;

        await DeleteDebtZustand(id);
        navigate('/debts');
    }

    async function handleAddEntry(amount) {
        if (dialogMode === 'payment') {
            await AddPaymentZustand(id, {
                amount: amount,
                paid_at: new Date().toISOString(),
            });
        } else {
            await UpdateDebtZustand(id, {
                amount: debt.amount + amount,
            });
        }
        await loadData(true);
    }

    async function handleDebtUpdated(updatedDebt) {
        setDebt(updatedDebt);
        setEditOpen(false);
        await loadData(true);
    }

    return (
        <div className="p-6 mx-auto text-foreground bg-background min-h-screen w-full">

            <div className="flex justify-between items-center mb-6 w-full">
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="icon" onClick={() => navigate('/debts')} className="cursor-pointer">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h2 className="text-xl font-semibold">Debt Details</h2>
                        <p className="text-sm text-muted-foreground">{contact.name}</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setEditOpen(true)} className="cursor-pointer">
                        <Pencil className="h-4 w-4 mr-1" /> Edit
                    </Button>
                    <Button variant="destructive" onClick={handleDelete} className="cursor-pointer">
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                </div>
            </div>
            <div className='flex gap-5'>

                <div className="bg-card w-full border border-border rounded-xl p-5 mb-6 text-card-foreground">
                    <p className="font-semibold">{contact.name}</p>
                    <p className="text-sm text-muted-foreground mb-3">{owesMe ? 'Owes Me' : 'I Owe'}</p>

                    <p className={`text-2xl font-bold ${owesMe ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                        {remaining} {debt.currency}
                    </p>

                    <div className="h-1.5 bg-muted rounded-full mt-3 overflow-hidden">
                        <div className={`h-full ${barColor}`} style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{paid} / {total} ({pct}%)</p>

                    <div className="grid grid-cols-2 gap-3 mt-4">
                        <div className="bg-emerald-500/10 rounded-lg p-3">
                            <p className="text-xs text-muted-foreground">Paid</p>
                            <p className="font-semibold text-emerald-600 dark:text-emerald-400">{paid}</p>
                        </div>
                        <div className="bg-amber-500/10 rounded-lg p-3">
                            <p className="text-xs text-muted-foreground">Total</p>
                            <p className="font-semibold text-amber-600 dark:text-amber-400">{total}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-card border w-130 border-border rounded-xl p-5 mb-6 text-card-foreground">
                    <div className="flex justify-between items-center mb-3">
                        <p className="font-semibold">Payments ({payments.length})</p>
                        <div className="flex gap-2">
                            <Button size="icon" className="bg-red-500/10 text-red-500 hover:bg-red-500/20 cursor-pointer" onClick={() => setDialogMode('payment')}>
                                <Minus className="h-4 w-4" />
                            </Button>
                            <Button size="icon" className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 cursor-pointer" onClick={() => setDialogMode('increase')}>
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {payments.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-8">No payments yet.</p>
                    )}

                    {payments.map((p) => (
                        <div key={p.id} className="flex justify-between text-sm border-b border-border py-2">
                            <span className="text-muted-foreground">{new Date(p.paid_at).toLocaleDateString()}</span>
                            <span className="text-red-500 dark:text-red-400">{p.amount}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-5 mb-6 text-card-foreground">
                <p className="text-sm"><span className="text-muted-foreground">Created: </span>{new Date(debt.created_at).toLocaleDateString()}</p>
                <p className="text-sm"><span className="text-muted-foreground">Due: </span>{debt.due_date ? new Date(debt.due_date).toLocaleDateString() : '-'}</p>
                <p className="text-sm"><span className="text-muted-foreground">Folder: </span>{folder ? folder.name : '-'}</p>
            </div>


            <AddDebtDialog
                open={editOpen}
                defaultType={owesMe ? 'owes-me' : 'i-owe'}
                onOpenChange={setEditOpen}
                contacts={[contact]}
                folders={folder ? [folder] : []}
                onContactCreated={() => { }}
                onFolderCreated={() => { }}
                onDebtCreated={() => { }}
                editingDebt={debt}
                onDebtUpdated={handleDebtUpdated}
            />

            <PaymentDialog
                open={dialogMode !== null}
                mode={dialogMode}
                remaining={remaining}
                onOpenChange={(isOpen) => { if (!isOpen) setDialogMode(null); }}
                onSubmit={handleAddEntry}
            />
        </div>
    );
};

export default DebtDetails;