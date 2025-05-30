import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface EventsTableProps {
  events: {
    id: string;
    name: string;
    price: number | null;
    purchasePercent: number;
    spectatorEventTicket: number | null;
    spectatorTicketsSold: number;
  }[];
}

export const EventStatsTable = ({ events }: EventsTableProps) => {
  return (
    <div className='h-64 w-full overflow-auto'>
      <ScrollArea className='h-full'>
        <Table>
          <TableHeader className='bg-gray-100'>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>%Venta</TableHead>
              <TableHead>Cupo</TableHead>
              <TableHead>Tickets Vendidos</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event, index) => (
              <TableRow key={index}>
                <TableCell>{event.name}</TableCell>
                <TableCell>
                  {event.price !== null ? `$${event.price}` : 'Gratis'}
                </TableCell>
                <TableCell className='font-bold'>
                  {event.purchasePercent}%
                </TableCell>
                <TableCell>{event.spectatorEventTicket}</TableCell>
                <TableCell>{event.spectatorTicketsSold}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
};
