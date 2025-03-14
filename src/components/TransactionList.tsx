
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Transaction } from '@/hooks/useTransactions';

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  getCategoryName: (category: string) => string;
  getFrequencyName: (frequency: string, transaction: Transaction) => string;
  formatter: Intl.NumberFormat;
  dateFormatter: Intl.DateTimeFormat;
}

const TransactionList = ({
  transactions,
  onEdit,
  onDelete,
  getCategoryName,
  getFrequencyName,
  formatter,
  dateFormatter
}: TransactionListProps) => {
  if (transactions.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        Görüntülenecek işlem bulunamadı.
      </div>
    );
  }

  return (
    <div className="w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tarih</TableHead>
            <TableHead>Açıklama</TableHead>
            <TableHead>Kategori</TableHead>
            <TableHead>Sıklık</TableHead>
            <TableHead>Tutar</TableHead>
            <TableHead>İşlemler</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => {
            const date = new Date(transaction.date);
            const formattedDate = dateFormatter.format(date);
            const amountFormatted = formatter.format(transaction.amount);
            const categoryName = getCategoryName(transaction.category);
            const frequencyName = getFrequencyName(transaction.frequency, transaction);

            return (
              <TableRow key={transaction.id}>
                <TableCell>{formattedDate}</TableCell>
                <TableCell>{transaction.description}</TableCell>
                <TableCell>{categoryName}</TableCell>
                <TableCell>{frequencyName}</TableCell>
                <TableCell className={transaction.type === 'income' ? 'text-[var(--income-color)]' : 'text-[var(--expense-color)]'}>
                  {amountFormatted}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => onEdit(transaction)}>
                      Düzenle
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => {
                        if (confirm('Bu işlemi silmek istediğinizden emin misiniz?')) {
                          onDelete(transaction.id);
                        }
                      }}
                    >
                      Sil
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default TransactionList;
