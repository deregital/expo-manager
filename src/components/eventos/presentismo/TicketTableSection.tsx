import { DataTable } from '@/components/modelos/table/dataTable';
import { type RouterOutputs } from '@/server';
import { generateTicketColumns } from '@/components/eventos/table/columnsEvento';

interface TicketTableSection {
  tickets: RouterOutputs['ticket']['getByEventId'];
}

const TicketTableSection = ({ tickets }: TicketTableSection) => {
  return (
    <DataTable
      columns={generateTicketColumns()}
      data={tickets ?? []}
      initialSortingColumn={{ id: 'type', desc: true }}
    />
  );
};

export default TicketTableSection;
