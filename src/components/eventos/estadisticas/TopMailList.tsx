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
  mails: {
    mail: string;
    ticketsPurchased: number;
  }[];
}

export const TopMailList = ({ mails }: EventsTableProps) => {
  return (
    <div className='h-36 overflow-auto'>
      <ScrollArea className='h-full'>
        <Table>
          <TableHeader className='bg-gray-100'>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Tickets comprados</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mails.map((mail, index) => (
              <TableRow key={index}>
                <TableCell>{mail.mail}</TableCell>
                <TableCell>{mail.ticketsPurchased}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
};
