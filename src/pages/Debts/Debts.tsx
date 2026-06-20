import { ArrowDownRight, ArrowDownUp, ArrowUpRight, Landmark, Pencil, Search, SlidersHorizontal, Trash2 } from "lucide-react";
import { useEffect, useState } from 'react';
import { useSearchParams } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Button } from '../../components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { Input } from '../../components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../components/ui/select';
import { Skeleton } from "../../components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../../components/ui/table';
import { useContacts } from "../../store/Contacts/Contacts";
import { useDashboard } from "../../store/Dashboard/Dashboard";
import { useDebts } from "../../store/Debts/Debts";
import { useDialogStore } from "../../store/Dialog/DialogStore";
import { useFolders } from "../../store/Folders/Folder";
import AddDebtDialog from "./AddDebtDialog/AddDebtDialog";
import { useNavigate } from 'react-router-dom';

interface Debt {
    id: string;
    user_id: string;
    contact_id: string;
    amount: number;
    currency: string;
    description: string;
    due_date: string;
    status: string;
    created_at: string;
    updated_at: string;
    paid?: number;
}

interface Contact {
    id: string;
    user_id: string;
    folder_id: string;
    name: string;
    phone: string;
    email: string;
    notes: string;
}

interface Folder {
    id: string;
    user_id: string;
    name: string;
    color: string;
}

const Debts = () => {
    const navigate = useNavigate();

    const { summary, fetchDashboard } = useDashboard();
    const { GetDebtsZustand, DeleteDebtZustand, GetPaymentsZustand } = useDebts();
    const { GetContactsZustand } = useContacts();
    const { GetFoldersZustand } = useFolders();

    const [debts, setDebts] = useState<Debt[]>([]);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [loading, setLoading] = useState(true);

    const [searchParams] = useSearchParams();
    const [search, setSearch] = useState('');
    const [contactFilter, setContactFilter] = useState('all');
    const [folderFilter, setFolderFilter] = useState(searchParams.get('folder_id') ?? 'all');

    const { addDebtOpen, addDebtType, closeAddDebt } = useDialogStore();

    function goToDebtProfile(id) {
        navigate(`/debt-profile/${id}`);
    }


    function normalizeDebt(d) {
        return { ...d, amount: d.direction === 'i_owe_them' ? -Math.abs(d.amount) : Math.abs(d.amount) };
    }

    function handleDebtCreated(newDebt: Debt) {
        setDebts((prev) => [{ ...normalizeDebt(newDebt), paid: 0 }, ...prev]);
    }

    function handleContactCreated(newContact: Contact) {
        setContacts((prev) => [...prev, newContact]);
    }

    function handleFolderCreated(newFolder: Folder) {
        setFolders((prev) => [...prev, newFolder]);
    }

    useEffect(() => {
        GetFoldersZustand().then(setFolders);
        GetContactsZustand().then(setContacts);
    }, [GetFoldersZustand, GetContactsZustand]);

    useEffect(() => {
        const folderIdFromUrl = searchParams.get('folder_id');
        if (folderIdFromUrl) {
            setFolderFilter(folderIdFromUrl);
        }
    }, [searchParams]);

    useEffect(() => {
        if (!summary) {
            fetchDashboard();
        }
    }, []);

    useEffect(() => {
        async function loadDebts() {
            setLoading(true);

            const params = contactFilter !== 'all' ? { contact_id: contactFilter } : {};
            const debtsData: Debt[] = await GetDebtsZustand(params);

            const debtsWithPaid = await Promise.all(
                debtsData.map(async (debt) => {
                    const payments = await GetPaymentsZustand(debt.id);
                    const paid = payments.reduce((sum: number, p) => sum + Number(p.amount), 0);
                    return { ...normalizeDebt(debt), paid };
                })
            );

            setDebts(debtsWithPaid);
            setLoading(false);
        }

        loadDebts();
    }, [contactFilter]);

    const contactsById = Object.fromEntries(contacts.map((c) => [c.id, c]));

    const filtered = debts.filter((debt) => {
        const contact = contactsById[debt.contact_id];

        const name = contact?.name ?? "";
        const email = contact?.email ?? "";

        const matchesSearch =
            !search ||
            name.toLowerCase().includes(search.toLowerCase()) ||
            email.toLowerCase().includes(search.toLowerCase());

        const matchesFolder =
            folderFilter === 'all' || contact?.folder_id === folderFilter;

        return matchesSearch && matchesFolder;
    });

    async function handleDelete(id: string) {
        try {
            await DeleteDebtZustand(id);
            setDebts((prev) => prev.filter((d) => d.id !== id));
        } catch (error) {
            console.log(error);
        }
    }

    if (loading || !summary) {
        return (
            <section className="w-full bg-background text-foreground p-6 md:p-8">
                <div className="mb-4">
                    <Skeleton className="h-10 w-40" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map((item) => (
                        <div
                            key={item}
                            className="bg-card rounded-2xl border border-border p-5"
                        >
                            <div className="flex items-start justify-between">
                                <div className="space-y-3">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-8 w-32" />
                                </div>
                                <Skeleton className="h-10 w-10 rounded-full" />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6">
                    <div className="bg-card rounded-xl border border-border shadow-sm px-4 py-4 mb-4">
                        <Skeleton className="h-9 w-full mb-3" />

                        <div className="flex gap-2">
                            <Skeleton className="h-9 flex-1" />
                            <Skeleton className="h-9 flex-1" />
                            <Skeleton className="h-9 w-9" />
                            <Skeleton className="h-9 w-9" />
                        </div>
                    </div>

                    <div className="hidden sm:block bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                        <div className="p-4 space-y-4">
                            {[1, 2, 3, 4, 5].map((row) => (
                                <div
                                    key={row}
                                    className="flex items-center gap-4"
                                >
                                    <Skeleton className="h-10 w-10 rounded-full" />

                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-4 w-40" />
                                        <Skeleton className="h-3 w-56" />
                                    </div>

                                    <Skeleton className="h-4 w-24" />

                                    <div className="w-52">
                                        <Skeleton className="h-3 w-full mb-2" />
                                        <Skeleton className="h-2 w-full" />
                                    </div>

                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-3 w-16" />
                                    </div>

                                    <Skeleton className="h-8 w-8 rounded-full" />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="sm:hidden flex flex-col gap-3">
                        {[1, 2, 3].map((item) => (
                            <div
                                key={item}
                                className="bg-card rounded-xl border border-border shadow-sm p-4"
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <Skeleton className="h-10 w-10 rounded-full" />

                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-3 w-40" />
                                    </div>

                                    <Skeleton className="h-8 w-8 rounded-full" />
                                </div>

                                <div className="flex justify-between mb-3">
                                    <div className="space-y-2">
                                        <Skeleton className="h-3 w-12" />
                                        <Skeleton className="h-5 w-20" />
                                    </div>

                                    <div className="space-y-2">
                                        <Skeleton className="h-3 w-16" />
                                        <Skeleton className="h-4 w-24" />
                                    </div>
                                </div>

                                <Skeleton className="h-2 w-full" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    const fmt = (n: number | string) =>
        Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const net = Number(summary.outstanding.net_balance);

    function getProgressPct(debt: Debt) {
        const total = Math.abs(debt.amount);
        const paid = Math.abs(debt.paid ?? 0);
        return total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0;
    }

    function getProgressColor(debt: Debt, pct: number) {
        if (pct === 100) return 'bg-gray-400';
        if (debt.amount < 0) return 'bg-red-500';
        return 'bg-emerald-500';
    }

    function getProgressLabel(debt: Debt, pct: number) {
        if (pct === 100) return 'Fully Paid';
        const paid = Math.abs(debt.paid ?? 0);
        const total = Math.abs(debt.amount);
        return `Paid $${fmt(paid)} of $${fmt(total)}`;
    }

    function formatAmount(amount: number) {
        const abs = Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2 });
        if (amount >= 0) return { label: `+$${abs}`, color: 'text-emerald-600 dark:text-emerald-400' };
        return { label: `-$${abs}`, color: 'text-red-500 dark:text-red-400' };
    }

    function formatDueDate(dueDate: string) {
        const date = new Date(dueDate);
        const formatted = date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
        const diffDays = Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        let sub = '';
        if (diffDays < 0) sub = 'Closed';
        else if (diffDays === 0) sub = 'Due today';
        else sub = `In ${diffDays} days`;
        return { formatted, sub };
    }

    function getInitials(name: string) {
        return name?.split(' ').map((n) => n[0]).join('').toUpperCase() ?? '?';
    }

    function ActionsMenu({ onDelete }: { onDelete: () => void }) {
        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full cursor-pointer"
                    >
                        <span className="flex flex-col items-center justify-center gap-[3px]">
                            <span className="block h-[3px] w-[3px] rounded-full bg-current" />
                            <span className="block h-[3px] w-[3px] rounded-full bg-current" />
                            <span className="block h-[3px] w-[3px] rounded-full bg-current" />
                        </span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-36 bg-popover border border-border text-popover-foreground shadow-lg">
                    <DropdownMenuItem className="gap-2 cursor-pointer text-sm">
                        <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                        Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        className="gap-2 cursor-pointer text-sm text-red-500 focus:text-red-500 focus:bg-red-500/10"
                        onClick={onDelete}
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        );
    }
    console.log("DEBTS PAGE RENDERED");

    return (
        <>
            <section className="w-full bg-background text-foreground p-6 md:p-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-4xl font-semibold text-foreground">Debts</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <SummaryCard
                        label="Net Total"
                        value={`${net >= 0 ? "+" : ""}${fmt(net)}`}
                        unit="TJS"
                        valueColor="text-foreground"
                        icon={<Landmark className="w-5 h-5 text-muted-foreground" />}
                        iconBg="bg-muted"
                    />
                    <SummaryCard
                        label="Owes Me"
                        value={`+${fmt(summary.outstanding.they_owe_me)}`}
                        unit="TJS"
                        valueColor="text-emerald-600 dark:text-emerald-400"
                        icon={<ArrowDownRight className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
                        iconBg="bg-emerald-500/10"
                    />
                    <SummaryCard
                        label="I Owe"
                        value={`-${fmt(summary.outstanding.i_owe_them)}`}
                        unit="TJS"
                        valueColor="text-rose-600 dark:text-rose-400"
                        icon={<ArrowUpRight className="w-5 h-5 text-rose-600 dark:text-rose-400" />}
                        iconBg="bg-rose-500/10"
                    />
                </div>
                <div className="mt-6">
                    <div className="w-full">
                        <div className="bg-card rounded-xl border border-border shadow-sm px-4 sm:px-5 py-4 mb-4">
                            <div className="relative mb-3">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name"
                                    className="pl-9 h-9 text-sm bg-background border-border text-foreground focus-visible:ring-1 focus-visible:ring-primary/10 w-full"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <Select value={contactFilter} onValueChange={setContactFilter}>
                                    <SelectTrigger className="h-9 text-sm flex-1 min-w-[130px] bg-card border-border text-foreground">
                                        <SelectValue placeholder="All Contacts" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Contacts</SelectItem>
                                        {contacts.map((c) => (
                                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select value={folderFilter} onValueChange={setFolderFilter}>
                                    <SelectTrigger className="h-9 text-sm flex-1 min-w-[120px] bg-card border-border text-foreground">
                                        <SelectValue placeholder="All Folders" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Folders</SelectItem>
                                        {folders.map((f) => (
                                            <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <div className="flex items-center gap-2 ml-auto">
                                    <Button variant="outline" size="icon" className="h-9 w-9 border-border text-foreground hover:bg-muted shrink-0 cursor-pointer">
                                        <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                    <Button variant="outline" size="icon" className="h-9 w-9 border-border text-foreground hover:bg-muted shrink-0 cursor-pointer">
                                        <ArrowDownUp className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="hidden  overflow-y-auto sm:block bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                            <Table >
                                <TableHeader className="">
                                    <TableRow className="hover:bg-muted/50 border-b border-border bg-muted/30">
                                        <TableHead className="w-[240px] text-xs font-semibold text-muted-foreground uppercase tracking-wide pl-5">Full Name</TableHead>
                                        <TableHead className="w-[130px] text-xs font-semibold text-muted-foreground uppercase tracking-wide">Amount</TableHead>
                                        <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Progress</TableHead>
                                        <TableHead className="w-[150px] text-xs font-semibold text-muted-foreground uppercase tracking-wide">Due Date</TableHead>
                                        <TableHead className="w-[72px] text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right pr-5">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-12">
                                                Loading debts...
                                            </TableCell>
                                        </TableRow>
                                    ) : filtered.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-12">
                                                No data found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filtered.map((debt) => {
                                            const contact = contactsById[debt.contact_id];
                                            const { label, color } = formatAmount(debt.amount);
                                            const pct = getProgressPct(debt);
                                            const barColor = getProgressColor(debt, pct);
                                            const { formatted, sub } = formatDueDate(debt.due_date);
                                            return (
                                                <TableRow onClick={() => goToDebtProfile(debt.id)} key={debt.id} className="hover:bg-muted/50 transition-colors border-b border-border cursor-pointer">
                                                    <TableCell className="pl-5 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-9 w-9 border border-border shadow-sm shrink-0">
                                                                <AvatarImage src={undefined} alt={contact?.name} />
                                                                <AvatarFallback className="text-xs font-semibold bg-muted text-muted-foreground">
                                                                    {getInitials(contact?.name)}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="min-w-0">
                                                                <p className="text-sm font-semibold text-foreground leading-tight">{contact?.name ?? 'Unknown'}</p>
                                                                <p className="text-xs text-muted-foreground mt-0.5 truncate">{contact?.email}</p>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className={`text-sm font-bold ${color}`}>{label}</span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex-1 min-w-[80px]">
                                                                <p className="text-xs text-muted-foreground mb-1.5">{getProgressLabel(debt, pct)}</p>
                                                                <div className="h-1.5 rounded-full bg-muted overflow-hidden w-full">
                                                                    <div
                                                                        className={`h-full rounded-full transition-all duration-700 ease-out ${barColor}`}
                                                                        style={{ width: `${pct}%` }}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <span className="text-xs text-muted-foreground font-medium w-8 text-right">{pct}%</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <p className="text-sm font-medium text-foreground">{formatted}</p>
                                                        <p className={`text-xs mt-0.5 ${sub === 'Closed' ? 'text-muted-foreground/60' : 'text-muted-foreground'}`}>
                                                            {sub}
                                                        </p>
                                                    </TableCell>
                                                    <TableCell className="pr-5 text-right" onClick={(e) => e.stopPropagation()}>
                                                        <ActionsMenu onDelete={() => handleDelete(debt.id)} />
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        <div className="sm:hidden flex flex-col gap-3">
                            {loading ? (
                                <div className="bg-card rounded-xl border border-border shadow-sm text-center text-sm text-muted-foreground py-12">
                                    Loading debts...
                                </div>
                            ) : filtered.length === 0 ? (
                                <div className="bg-card rounded-xl border border-border shadow-sm text-center text-sm text-muted-foreground py-12">
                                    No data found.
                                </div>
                            ) : (
                                filtered.map((debt) => {
                                    const contact = contactsById[debt.contact_id];
                                    const { label, color } = formatAmount(debt.amount);
                                    const pct = getProgressPct(debt);
                                    const barColor = getProgressColor(debt, pct);
                                    const { formatted, sub } = formatDueDate(debt.due_date);
                                    return (
                                        <div key={debt.id} className="bg-card rounded-xl border border-border shadow-sm p-4 text-card-foreground">
                                            <div className="flex items-center gap-3 mb-3" onClick={() => goToDebtProfile(debt.id)}>
                                                <Avatar className="h-10 w-10 border border-border shadow-sm shrink-0">
                                                    <AvatarImage src={undefined} alt={contact?.name} />
                                                    <AvatarFallback className="text-xs font-semibold bg-muted text-muted-foreground">
                                                        {getInitials(contact?.name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-semibold text-foreground leading-tight">{contact?.name ?? 'Unknown'}</p>
                                                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{contact?.email}</p>
                                                </div>
                                                <div onClick={(e) => e.stopPropagation()}>
                                                    <ActionsMenu onDelete={() => handleDelete(debt.id)} />
                                                </div>
                                            </div>
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-0.5">Amount</p>
                                                    <span className={`text-base font-bold ${color}`}>{label}</span>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-0.5">Due Date</p>
                                                    <p className="text-sm font-medium text-foreground">{formatted}</p>
                                                    <p className={`text-xs ${sub === 'Closed' ? 'text-muted-foreground/60' : 'text-muted-foreground'}`}>{sub}</p>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <p className="text-xs text-muted-foreground">{getProgressLabel(debt, pct)}</p>
                                                    <span className="text-xs text-muted-foreground font-medium">{pct}%</span>
                                                </div>
                                                <div className="h-1.5 rounded-full bg-muted overflow-hidden w-full">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-700 ease-out ${barColor}`}
                                                        style={{ width: `${pct}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>

                <AddDebtDialog
                    open={addDebtOpen}
                    defaultType={addDebtType}
                    onOpenChange={closeAddDebt}
                    contacts={contacts}
                    folders={folders}
                    onContactCreated={handleContactCreated}
                    onFolderCreated={handleFolderCreated}
                    onDebtCreated={handleDebtCreated}
                />
            </section>
        </>
    )
}

const SummaryCard = ({
    label,
    value,
    unit,
    valueColor,
    icon,
    iconBg,
}: {
    label: string;
    value: string;
    unit: string;
    valueColor: string;
    icon: React.ReactNode;
    iconBg: string;
}) => (
    <div className="rounded-xl bg-card border p-6 flex items-start justify-between shadow-sm transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-xl">        <div>
        <p className="text-sm text-muted-foreground mb-2">{label}</p>
        <h2 className={`text-2xl font-bold ${valueColor}`}>
            {value} <span className="text-xs font-medium text-muted-foreground/60 ml-1">{unit}</span>
        </h2>
    </div>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${iconBg}`}>
            {icon}
        </div>
    </div>
);

export default Debts;