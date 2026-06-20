import { useEffect } from 'react';
import { FolderOpen, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Label } from '../../../components/ui/label';
import { useFolders } from '../../../store/Folders/Folder';

interface Folder {
  id: string;
  user_id: string;
  name: string;
  color?: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (folder: Folder) => void;
}

interface FolderFormValues {
  name: string;
}

export default function AddFolderDialog({ open, onOpenChange, onCreate }: Props) {
  const { CreateFolderZustand } = useFolders();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FolderFormValues>({ defaultValues: { name: '' } });

  useEffect(() => {
    if (open) reset({ name: '' });
  }, [open, reset]);

  async function onSubmit(values: FolderFormValues) {
    try {
      const folder = await CreateFolderZustand(values.name.trim());
      onCreate(folder);
      onOpenChange(false);
    } catch (err) {
      setError('root', {
        type: 'server',
        message: err?.response?.data?.error || 'Could not create folder.',
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[380px] p-0 gap-0 overflow-hidden rounded-2xl">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-lg font-semibold text-gray-900">Add Folder</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="px-6 pb-6 flex flex-col gap-3">
            <Label className="text-sm font-medium text-gray-700">Folder Name</Label>
            <div className="relative">
              <FolderOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="e.g. Clients"
                autoFocus
                className="pl-9 h-10 text-sm border-gray-200 focus-visible:ring-1 focus-visible:ring-gray-300"
                {...register('name', { required: 'Please enter a folder name.' })}
              />
            </div>
            {(errors.name || errors.root) && (
              <p className="flex items-center gap-1.5 text-xs text-red-600">
                <AlertCircle className="h-3.5 w-3.5" />
                {errors.name?.message || errors.root?.message}
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
              {isSubmitting ? 'Saving...' : 'Save Folder'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}