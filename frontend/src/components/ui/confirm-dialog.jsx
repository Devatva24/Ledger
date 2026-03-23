import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export function ConfirmDialog({ open, onOpenChange, title, message, onConfirm }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface border border-border rounded-none max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-white">{title}</DialogTitle>
        </DialogHeader>
        <p className="text-muted-foreground text-sm">{message}</p>
        <div className="flex gap-3 mt-2">
          <Button
            onClick={() => onOpenChange(false)}
            className="flex-1 bg-muted text-white hover:bg-muted/80 rounded-none"
          >
            Cancel
          </Button>
          <Button
            onClick={() => { onConfirm(); onOpenChange(false); }}
            className="flex-1 bg-destructive text-white hover:bg-destructive/90 rounded-none"
          >
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}