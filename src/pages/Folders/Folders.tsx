import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Folder, FolderPlus, Plus, MoreVertical, ArrowRight, Pencil, Trash2, X } from "lucide-react"
import { useContacts } from "../../store/Contacts/Contacts"
import { useDebts } from "../../store/Debts/Debts"
import { useFolders } from "../../store/Folders/Folder"

export default function Folders() {
  const navigate = useNavigate()

  const { GetFoldersZustand, CreateFolderZustand, UpdateFolderZustand, DeleteFolderZustand } = useFolders()
  const { GetContactsZustand } = useContacts()
  const { GetDebtsZustand } = useDebts()

  const [folders, setFolders] = useState([])
  const [loading, setLoading] = useState(false)

  const [isCreating, setIsCreating] = useState(false)
  const [newName, setNewName] = useState("")

  const [editingFolder, setEditingFolder] = useState(null)
  const [editName, setEditName] = useState("")

  const [deletingFolder, setDeletingFolder] = useState(null)
  const [openMenuId, setOpenMenuId] = useState(null)

  const loadFolders = async () => {
    setLoading(true)
    const rawFolders = await GetFoldersZustand()
    const allDebts = await GetDebtsZustand({})

    const withTotals = await Promise.all(
      rawFolders.map(async (folder) => {
        const contacts = await GetContactsZustand(folder.id)
        const contactIds = contacts.map((c) => c.id)
        const folderDebts = allDebts.filter((d) => contactIds.includes(d.contact_id))

        const owesMe = folderDebts
          .filter((d) => d.direction === "they_owe_me")
          .reduce((sum, d) => sum + d.amount, 0)

        const iOwe = folderDebts
          .filter((d) => d.direction === "i_owe_them")
          .reduce((sum, d) => sum + d.amount, 0)

        return { ...folder, owesMe, iOwe, netTotal: owesMe - iOwe }
      })
    )

    setFolders(withTotals)
    setLoading(false)
  }

  useEffect(() => { loadFolders() }, [])

  const createFolder = async (name) => { await CreateFolderZustand(name); loadFolders() }
  const updateFolder = async (id, name) => { await UpdateFolderZustand(id, name); loadFolders() }
  const deleteFolder = async (id) => { await DeleteFolderZustand(id); loadFolders() }
  const openFolder = (folder) => { navigate(`/debts?folder_id=${folder.id}`) }

  const handleCreateSubmit = async () => {
    if (!newName.trim()) return
    await createFolder(newName.trim())
    setNewName("")
    setIsCreating(false)
  }

  const handleEditSubmit = async () => {
    if (!editName.trim() || !editingFolder) return
    await updateFolder(editingFolder.id, editName.trim())
    setEditingFolder(null)
    setEditName("")
  }

  const handleDeleteConfirm = async () => {
    if (!deletingFolder) return
    await deleteFolder(deletingFolder.id)
    setDeletingFolder(null)
  }

  const formatAmount = (n, { signed = false } = {}) => {
    const abs = Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    if (!signed) return `$${abs}`
    if (n > 0) return `+$${abs}`
    if (n < 0) return `-$${abs}`
    return `$${abs}`
  }

  return (
    <div className="min-h-screen w-full bg-background text-foreground p-6 sm:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Folders</h1>
            <p className="text-sm text-muted-foreground mt-1">Organize and manage your financial records.</p>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Add Folder
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 rounded-xl bg-card border border-border animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {folders.map((folder) => (
              <div
                key={folder.id}
                className="group relative rounded-xl bg-card border border-border p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"                            >
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      <Folder className="h-5 w-5 text-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground truncate">{folder.name}</h3>
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === folder.id ? null : folder.id)}
                      className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                    {openMenuId === folder.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                        <div className="absolute right-0 top-9 z-20 w-36 rounded-lg bg-popover border border-border shadow-lg py-1 text-popover-foreground">
                          <button
                            onClick={() => { setEditingFolder(folder); setEditName(folder.name); setOpenMenuId(null) }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted cursor-pointer"
                          >
                            <Pencil className="h-3.5 w-3.5" /> Edit
                          </button>
                          <button
                            onClick={() => { setDeletingFolder(folder); setOpenMenuId(null) }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Net Total</span>
                    <span className={`font-semibold tabular-nums ${folder.netTotal > 0 ? "text-emerald-600 dark:text-emerald-400" : folder.netTotal < 0 ? "text-red-500 dark:text-red-400" : "text-foreground"}`}>
                      {formatAmount(folder.netTotal, { signed: true })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Owes Me</span>
                    <span className="font-medium tabular-nums text-emerald-600 dark:text-emerald-400">
                      {folder.owesMe > 0 ? `+${formatAmount(folder.owesMe)}` : formatAmount(folder.owesMe)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">I Owe</span>
                    <span className={`font-medium tabular-nums ${folder.iOwe > 0 ? "text-red-500 dark:text-red-400" : "text-foreground"}`}>
                      {folder.iOwe > 0 ? `-${formatAmount(folder.iOwe)}` : formatAmount(folder.iOwe)}
                    </span>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-border">
                  <button
                    onClick={() => openFolder(folder)}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-foreground/80 transition-colors cursor-pointer"
                  >
                    View contents <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}

            <button
              onClick={() => setIsCreating(true)}
              className="flex flex-col items-center justify-center min-h-[200px] rounded-xl border-2 border-dashed border-border bg-transparent hover:border-muted-foreground/30 hover:bg-card transition-colors p-5 cursor-pointer"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
                <FolderPlus className="h-5 w-5 text-muted-foreground" />
              </div>
              <span className="text-base font-semibold text-foreground">Create Folder</span>
              <span className="text-xs text-muted-foreground mt-1">Organize new debts</span>
            </button>
          </div>
        )}
      </div>

      {isCreating && (
        <Modal onClose={() => { setIsCreating(false); setNewName("") }} title="New Folder">
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreateSubmit()}
            placeholder="Folder name"
            className="w-full bg-background text-foreground rounded-lg border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-muted-foreground"
          />
          <ModalActions
            onCancel={() => { setIsCreating(false); setNewName("") }}
            onConfirm={handleCreateSubmit}
            confirmLabel="Create"
          />
        </Modal>
      )}

      {editingFolder && (
        <Modal onClose={() => { setEditingFolder(null); setEditName("") }} title="Edit Folder">
          <input
            autoFocus
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleEditSubmit()}
            placeholder="Folder name"
            className="w-full bg-background text-foreground rounded-lg border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-muted-foreground"
          />
          <ModalActions
            onCancel={() => { setEditingFolder(null); setEditName("") }}
            onConfirm={handleEditSubmit}
            confirmLabel="Save"
          />
        </Modal>
      )}

      {deletingFolder && (
        <Modal onClose={() => setDeletingFolder(null)} title="Delete Folder">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete <span className="font-semibold text-foreground">"{deletingFolder.name}"</span>? This action cannot be undone.
          </p>
          <div className="mt-5 flex justify-end gap-2">
            <button
              onClick={() => setDeletingFolder(null)}
              className="rounded-lg px-4 py-2 text-sm font-medium text-foreground hover:bg-muted cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              className="rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
            >
              Delete
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md rounded-xl bg-card text-card-foreground border border-border shadow-xl p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-muted text-muted-foreground cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

function ModalActions({ onCancel, onConfirm, confirmLabel }) {
  return (
    <div className="mt-5 flex justify-end gap-2">
      <button onClick={onCancel} className="rounded-lg px-4 py-2 text-sm font-medium text-foreground hover:bg-muted cursor-pointer">
        Cancel
      </button>
      <button onClick={onConfirm} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 cursor-pointer">
        {confirmLabel}
      </button>
    </div>
  )
}
