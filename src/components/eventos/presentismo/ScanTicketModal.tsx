import { BarcodeScanner } from '@/components/icons/BarcodeScanner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { trpc } from '@/lib/trpc';

const ScanTicketModal = () => {
  const scanMutation = trpc.ticket.scan.useMutation();
  const utils = trpc.useContext();

  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) {
          scanMutation.reset();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button className='flex gap-x-5'>
          Escanear ticket
          <BarcodeScanner className='size-5' />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle className='text-lg font-semibold'>
          Escanear ticket
        </DialogTitle>
        <div>
          <form
            className='flex'
            onSubmit={async (e: React.FormEvent<HTMLFormElement>) => {
              const inputValue = e.currentTarget.barcode.value as string;
              e.preventDefault();
              await scanMutation.mutateAsync({
                type: 'barcode',
                value: inputValue,
              });
              e.currentTarget.reset();
              await utils.ticket.getByEventId.invalidate();
            }}
          >
            <Input name='barcode' className='rounded-r-none' />
            <Button
              className='rounded-l-none'
              type='submit'
              disabled={scanMutation.isLoading}
            >
              Escanear
            </Button>
          </form>
          {scanMutation.isError && (
            <p className='font-semibold text-red-500'>
              {scanMutation.error.message}
            </p>
          )}
          {scanMutation.isSuccess && (
            <p className='font-semibold text-green-500'>
              Escaneado! {scanMutation.data?.fullName}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScanTicketModal;
