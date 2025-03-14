import { useEventModalData } from '@/components/eventos/modal/eventmodal';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { iconsAndTexts } from '@/components/ui/ticket/iconsAndTexts';

const TicketsTable = () => {
  const tickets = useEventModalData((s) => s.tickets);

  return (
    <Table className='border-collapse overflow-visible rounded-lg border-2 border-neutral-300'>
      <TableHeader>
        <TableRow className='[&>*]:h-fit [&>*]:border-2 [&>*]:border-neutral-300 [&>*]:p-2 [&>*]:text-center [&>*]:text-sm [&>*]:font-medium [&>*]:text-black'>
          <TableHead>Tipo de Entrada</TableHead>
          <TableHead className='max-w-16'>Cantidad</TableHead>
          <TableHead>¿Es paga?</TableHead>
          <TableHead className='max-w-16'>Precio</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tickets.map((ticket, index) => {
          const { icon, text } = iconsAndTexts[ticket.type];
          if (ticket.amount === null) return null;
          return (
            <TableRow
              key={ticket.type}
              className='[&>*]:border-2 [&>*]:border-neutral-300 [&>*]:px-2 [&>*]:py-2 [&>*]:text-center'
            >
              <TableCell>
                <div className='flex items-center justify-center gap-2 text-sm'>
                  {icon}
                  <span>{text}</span>
                </div>
              </TableCell>
              <TableCell className='max-w-16'>
                <Input
                  type='number'
                  min='0'
                  className='w-full text-center'
                  value={ticket.amount}
                  onChange={(e) => {
                    const value = parseInt(e.target.value, 10);

                    if (value >= 0) {
                      tickets[index].amount = value;
                    }

                    useEventModalData.setState({ tickets: tickets });
                  }}
                />
              </TableCell>
              <TableCell>
                <Switch
                  checked={!ticket.isFree}
                  onCheckedChange={(checked) => {
                    tickets[index].isFree = !checked;
                    if (tickets[index].isFree) {
                      tickets[index].price = null;
                    }
                    useEventModalData.setState({ tickets: tickets });
                  }}
                />
              </TableCell>
              <TableCell className='max-w-16'>
                <Input
                  type='number'
                  min='0'
                  className='w-full text-center'
                  value={ticket.price ?? 0}
                  disabled={ticket.isFree}
                  onChange={(e) => {
                    const value = parseInt(e.target.value, 10);

                    if (value >= 0 && !ticket.isFree) {
                      tickets[index].price = value;
                    }
                    if (value === 0) {
                      tickets[index].price = null;
                    }

                    useEventModalData.setState({ tickets: tickets });
                  }}
                />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default TicketsTable;
