import { useEffect, useState, useMemo } from 'react';
import {
  User, Phone, MoreVertical, Plus, Search, Trash2, Edit3, CreditCard,
  Loader2, X, FolderOpen
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useContacts } from '../../store/Contacts/Contacts';
import { useDebts } from '../../store/Debts/Debts';

import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '../../components/ui/table';
import {
  Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious
} from '../../components/ui/pagination';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '../../components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { useFolders } from '../../store/Folders/Folder';
import AddDebtDialog from '../Debts/AddDebtDialog/AddDebtDialog';

export default function ContactsPage() {
  // --- Stores ---
  const { GetContactsZustand, CreateContactZustand, UpdateContactZustand, DeleteContactZustand } = useContacts();
  const { GetDebtsZustand } = useDebts();
  const { GetFoldersZustand } = useFolders();

  // --- Data ---
  const [contacts, setContacts] = useState([]);
  const [debts, setDebts] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const perPage = 10;

  // --- Filters ---
  const [search, setSearch] = useState('');
  const [folderFilter, setFolderFilter] = useState('');

  // --- Dialogs ---
  const [debtDialogOpen, setDebtDialogOpen] = useState(false);
  const [debtType, setDebtType] = useState('owes-me');
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);

  // --- React Hook Form ---
  const editForm = useForm();
  const addForm = useForm();

  // --- Load data ---
  async function loadData() {
    setLoading(true);
    try {
      const [contactsRes, debtsRes, foldersRes] = await Promise.all([
        GetContactsZustand(folderFilter || undefined),
        GetDebtsZustand({ per_page: 1000 }),
        GetFoldersZustand(),
      ]);
      setContacts(contactsRes.data || contactsRes || []);
      setDebts(debtsRes.data || debtsRes || []);
      setFolders(foldersRes.data || foldersRes || []);
    } catch (err) {
      toast.error('Failed to load contacts');
    }
    setLoading(false);
  }

  useEffect(() => { loadData(); }, [folderFilter]);

  // --- Calculate net total ---
  const contactsWithNet = useMemo(() => {
    return contacts.map((contact) => {
      const contactDebts = debts.filter((d) => d.contact_id === contact.id && d.status !== 'paid');
      let net = 0;
      for (const debt of contactDebts) {
        if (debt.direction === 'they_owe_me') net += debt.amount;
        else net -= debt.amount;
      }
      return { ...contact, net_total: net };
    });
  }, [contacts, debts]);

  // --- Filter by search ---
  const filtered = useMemo(() => {
    if (!search.trim()) return contactsWithNet;
    const q = search.toLowerCase();
    return contactsWithNet.filter((c) =>
      c.name.toLowerCase().includes(q) ||
      (c.phone && c.phone.toLowerCase().includes(q)) ||
      (c.notes && c.notes.toLowerCase().includes(q))
    );
  }, [contactsWithNet, search]);

  // --- Pagination ---
  const totalPages = Math.ceil(filtered.length / perPage);
  const pageContacts = useMemo(() => {
    const start = (page - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, page]);

  // --- Helpers ---
  function getInitials(name) {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  }

  function getAvatarColor(name) {
    const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500', 'bg-orange-500', 'bg-indigo-500'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  }

  function formatMoney(amount) {
    const abs = Math.abs(amount).toFixed(2);
    if (amount > 0) return `+$${abs}`;
    if (amount < 0) return `-$${abs}`;
    return '$0.00';
  }

  function getMoneyClass(amount) {
    if (amount > 0) return 'bg-emerald-100 text-emerald-700';
    if (amount < 0) return 'bg-rose-100 text-rose-700';
    return 'bg-gray-100 text-gray-600';
  }

  function getFolderName(id) {
    return folders.find((f) => f.id === id)?.name || 'Unknown';
  }

  // --- Actions ---
  function openAddDebt(contact, type) {
    setSelectedContact(contact);
    setDebtType(type);
    setDebtDialogOpen(true);
  }

  function onDebtCreated(debt) {
    setDebts((prev) => [...prev, debt]);
  }

  function onDebtUpdated(debt) {
    setDebts((prev) => prev.map((d) => (d.id === debt.id ? debt : d)));
  }

  function onContactCreated(contact) {
    setContacts((prev) => [...prev, contact]);
  }

  function onFolderCreated(folder) {
    setFolders((prev) => [...prev, folder]);
  }

  function openEdit(contact) {
    setSelectedContact(contact);
    editForm.reset({
      name: contact.name,
      phone: contact.phone || '',
      email: contact.email || '',
      notes: contact.notes || '',
      folder_id: contact.folder_id,
    });
    setEditOpen(true);
  }

  async function onEditSubmit(data) {
    if (!selectedContact) return;
    try {
      const updated = await UpdateContactZustand(selectedContact.id, {
        name: data.name.trim(),
        phone: data.phone || undefined,
        email: data.email || undefined,
        notes: data.notes || undefined,
        folder_id: data.folder_id || undefined,
      });
      setContacts((prev) => prev.map((c) => (c.id === selectedContact.id ? { ...c, ...updated } : c)));
      setEditOpen(false);
    } catch (err) {
      console.error(err);
      
    }
  }

  function openDelete(contact) {
    setSelectedContact(contact);
    setDeleteOpen(true);
  }

  async function confirmDelete() {
    if (!selectedContact) return;
    try {
      await DeleteContactZustand(selectedContact.id);
      setContacts((prev) => prev.filter((c) => c.id !== selectedContact.id));
      setDeleteOpen(false);
    } catch (err) {
      console.error(err);
      
    }
  }

  function openAdd() {
    addForm.reset({ name: '', phone: '', email: '', notes: '', folder_id: '' });
    setAddOpen(true);
  }

  async function onAddSubmit(data) {
    try {
      const newContact = await CreateContactZustand({
        name: data.name.trim(),
        folder_id: data.folder_id,
        phone: data.phone || undefined,
        email: data.email || undefined,
        notes: data.notes || undefined,
      });
      setContacts((prev) => [...prev, newContact]);
      setAddOpen(false);
    } catch (error) {
      console.error(error);
      
    }
  }

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
              <p className="text-sm text-gray-500 mt-1">Manage your financial relationships and obligations.</p>
            </div>
            <Button onClick={openAdd} className="bg-gray-900 hover:bg-gray-800 text-white">
              <Plus className="h-4 w-4 mr-2" /> Add Contact
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, phone, or notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="h-4 w-4 text-gray-400" />
              </button>
            )}
          </div>
          <Select value={folderFilter} onValueChange={setFolderFilter}>
            <SelectTrigger className="w-48">
              <FolderOpen className="h-4 w-4 text-gray-400 mr-2" />
              <SelectValue placeholder="All folders" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All folders</SelectItem>
              {folders.map((f) => (
                <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="max-w-7xl mx-auto px-6 pb-8">
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
              <span className="ml-3 text-sm text-gray-500">Loading...</span>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase">Full Name</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase">Phone</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase">Net Total</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase">Notes</TableHead>
                    <TableHead className="text-right text-xs font-semibold text-gray-500 uppercase">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageContacts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-16">
                        <User className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm text-gray-500 font-medium">No contacts found</p>
                        <p className="text-xs text-gray-400 mt-1">{search ? 'Try adjusting your search' : 'Add your first contact'}</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    pageContacts.map((contact) => (
                      <TableRow key={contact.id} className="hover:bg-gray-50/50 group">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className={`h-9 w-9 rounded-full flex items-center justify-center text-white text-xs font-semibold ${getAvatarColor(contact.name)}`}>
                              {getInitials(contact.name)}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{contact.name}</p>
                              <p className="text-xs text-gray-400">{getFolderName(contact.folder_id)}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Phone className="h-3.5 w-3.5 text-gray-400" />
                            <span className="text-sm text-gray-600">{contact.phone || '—'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getMoneyClass(contact.net_total)}`}>
                            {formatMoney(contact.net_total)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm text-gray-500 truncate max-w-xs">{contact.notes || '—'}</p>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="p-1.5 rounded-md hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreVertical className="h-4 w-4 text-gray-500" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                              <DropdownMenuItem onClick={() => openAddDebt(contact, 'owes-me')} className="cursor-pointer">
                                <CreditCard className="h-4 w-4 mr-2 text-emerald-500" /> Add Debt
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openEdit(contact)} className="cursor-pointer">
                                <Edit3 className="h-4 w-4 mr-2 text-gray-500" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openDelete(contact)} className="cursor-pointer text-red-600 focus:text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500">{filtered.length} contacts total</p>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <PaginationItem key={p}>
                          <PaginationLink
                            onClick={() => setPage(p)}
                            isActive={page === p}
                            className="cursor-pointer"
                          >
                            {p}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                          className={page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add Debt Dialog */}
      <AddDebtDialog
        open={debtDialogOpen}
        defaultType={debtType}
        onOpenChange={setDebtDialogOpen}
        contacts={contacts}
        folders={folders}
        onContactCreated={onContactCreated}
        onFolderCreated={onFolderCreated}
        onDebtCreated={onDebtCreated}
        onDebtUpdated={onDebtUpdated}
      />

      {/* Edit Contact Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[480px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Edit Contact</DialogTitle>
          </DialogHeader>
          <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="flex flex-col gap-4 py-4">
            <Input
              label="Name"
              placeholder="Enter name..."
              {...editForm.register('name', { required: 'Name is required' })}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Phone"
                placeholder="+1 (555) 000-0000"
                {...editForm.register('phone')}
              />
              <Input
                label="Email"
                placeholder="email@example.com"
                {...editForm.register('email')}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Folder</Label>
              <Select value={editForm.watch('folder_id')} onValueChange={(v) => editForm.setValue('folder_id', v)}>
                <SelectTrigger><SelectValue placeholder="Select folder..." /></SelectTrigger>
                <SelectContent>
                  {folders.map((f) => (<SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Notes</Label>
              <Textarea {...editForm.register('notes')} placeholder="Add notes..." className="min-h-[80px] resize-none" />
            </div>
            <DialogFooter className="gap-2">
              <Button type="button" variant="ghost" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={editForm.formState.isSubmitting} className="bg-gray-900 hover:bg-gray-800 text-white">
                {editForm.formState.isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Delete Contact</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{selectedContact?.name}</strong>? This will also remove all associated debts.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 mt-4">
            <Button variant="ghost" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Contact Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-[480px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Add Contact</DialogTitle>
          </DialogHeader>
          <form onSubmit={addForm.handleSubmit(onAddSubmit)} className="flex flex-col gap-4 py-4">
            <Input
              label="Name *"
              placeholder="Enter full name..."
              {...addForm.register('name', { required: 'Name is required' })}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Phone"
                placeholder="+1 (555) 000-0000"
                {...addForm.register('phone')}
              />
              <Input
                label="Email"
                placeholder="email@example.com"
                {...addForm.register('email')}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Folder *</Label>
              <Select onValueChange={(v) => addForm.setValue('folder_id', v)}>
                <SelectTrigger><SelectValue placeholder="Select folder..." /></SelectTrigger>
                <SelectContent>
                  {folders.map((f) => (<SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>))}
                </SelectContent>
              </Select>
              {addForm.formState.errors.folder_id && <p className="text-xs text-red-600">Folder is required</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Notes</Label>
              <Textarea {...addForm.register('notes')} placeholder="Add notes..." className="min-h-[80px] resize-none" />
            </div>
            <DialogFooter className="gap-2">
              <Button type="button" variant="ghost" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={addForm.formState.isSubmitting} className="bg-gray-900 hover:bg-gray-800 text-white">
                {addForm.formState.isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</> : 'Create Contact'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}