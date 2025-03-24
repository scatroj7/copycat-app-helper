import { useState } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { useForecast } from '@/hooks/useForecast';
import TransactionModal from '@/components/TransactionModal';
import TransactionList from '@/components/TransactionList';
import ForecastChart from '@/components/ForecastChart';
import BackupActions from '@/components/BackupActions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';

const Index = () => {
  const {
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    filteredTransactions,
    getIncome,
    getExpense,
    getBalance,
    getCategoryName,
    getFrequencyName,
    formatter,
    dateFormatter,
    exportTransactions,
    importTransactions,
    generateSharingLink
  } = useTransactions();

  const { forecastMonths, setForecastMonths, calculateForecast } = useForecast();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<null | any>(null);

  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  
  const [startDate, setStartDate] = useState<Date>(firstDayOfMonth);
  const [endDate, setEndDate] = useState<Date>(lastDayOfMonth);
  
  const [monthFilter, setMonthFilter] = useState('current');

  const dashboardTransactions = filteredTransactions(startDate, endDate);
  
  let transactionsTabData = [...transactions];
  
  if (monthFilter === 'current') {
    transactionsTabData = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === today.getMonth() && 
             transactionDate.getFullYear() === today.getFullYear();
    });
  } else if (monthFilter === 'last') {
    const lastMonth = today.getMonth() === 0 ? 11 : today.getMonth() - 1;
    const lastMonthYear = today.getMonth() === 0 ? today.getFullYear() - 1 : today.getFullYear();
    
    transactionsTabData = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === lastMonth && 
             transactionDate.getFullYear() === lastMonthYear;
    });
  }
  
  transactionsTabData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const { monthlyData, totalIncome, totalExpense, totalBalance } = calculateForecast(transactions);

  const openTransactionModal = (transaction = null) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleSaveTransaction = (formData: any) => {
    try {
      if (formData.id) {
        updateTransaction(formData);
        toast({
          title: "İşlem güncellendi",
          description: "İşlem başarıyla güncellendi.",
        });
      } else {
        addTransaction(formData);
        toast({
          title: "İşlem eklendi",
          description: "Yeni işlem başarıyla eklendi.",
        });
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('İşlem kaydedilirken hata:', error);
      toast({
        variant: "destructive",
        title: "Hata",
        description: "İşlem kaydedilirken bir sorun oluştu.",
      });
    }
  };

  const handleDeleteTransaction = (id: string) => {
    try {
      deleteTransaction(id);
      toast({
        title: "İşlem silindi",
        description: "İşlem başarıyla silindi.",
      });
    } catch (error) {
      console.error('İşlem silinirken hata:', error);
      toast({
        variant: "destructive",
        title: "Hata",
        description: "İşlem silinirken bir sorun oluştu.",
      });
    }
  };

  const handleApplyDateFilter = () => {
    toast({
      title: "Filtre uygulandı",
      description: "Tarih aralığı filtresi uygulandı.",
    });
  };

  return (
    <div className="container py-8">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Bütçe Takip Uygulaması</h1>
        <p className="text-muted-foreground">Gelir ve giderlerinizi kolayca takip edin</p>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="dashboard">Kontrol Paneli</TabsTrigger>
          <TabsTrigger value="transactions">İşlemler</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="flex flex-wrap gap-4 mb-6">
            <Card className="flex-1 min-w-[240px]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Mevcut Dönem Gelir
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[var(--income-color)]">
                  {formatter.format(getIncome(dashboardTransactions))}
                </div>
              </CardContent>
            </Card>

            <Card className="flex-1 min-w-[240px]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Mevcut Dönem Gider
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[var(--expense-color)]">
                  {formatter.format(getExpense(dashboardTransactions))}
                </div>
              </CardContent>
            </Card>

            <Card className="flex-1 min-w-[240px]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Mevcut Dönem Bakiye
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getBalance(dashboardTransactions) >= 0 ? 'text-[var(--income-color)]' : 'text-[var(--expense-color)]'}`}>
                  {formatter.format(getBalance(dashboardTransactions))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="md:col-span-1">
              <BackupActions 
                exportTransactions={exportTransactions}
                importTransactions={importTransactions}
                generateSharingLink={generateSharingLink}
              />
            </div>
            <div className="md:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Tarih Aralığı</CardTitle>
                    <Button variant="outline" size="sm" onClick={handleApplyDateFilter}>
                      Uygula
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Başlangıç Tarihi</Label>
                      <Input 
                        id="startDate" 
                        type="date" 
                        value={startDate.toISOString().split('T')[0]}
                        onChange={(e) => setStartDate(new Date(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">Bitiş Tarihi</Label>
                      <Input 
                        id="endDate" 
                        type="date" 
                        value={endDate.toISOString().split('T')[0]}
                        onChange={(e) => setEndDate(new Date(e.target.value))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Yeni İşlem</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button 
                onClick={() => openTransactionModal()}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" /> İşlem Ekle
              </Button>
            </CardContent>
          </Card>

          <TransactionList 
            transactions={dashboardTransactions}
            onEdit={openTransactionModal}
            onDelete={handleDeleteTransaction}
            getCategoryName={getCategoryName}
            getFrequencyName={getFrequencyName}
            formatter={formatter}
            dateFormatter={dateFormatter}
          />

          <div className="mt-12 space-y-6">
            <div className="flex flex-wrap gap-4 mb-6">
              <Card className="flex-1 min-w-[240px]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Tahmini Gelir ({forecastMonths} ay)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[var(--income-color)]">
                    {formatter.format(totalIncome)}
                  </div>
                </CardContent>
              </Card>

              <Card className="flex-1 min-w-[240px]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Tahmini Gider ({forecastMonths} ay)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[var(--expense-color)]">
                    {formatter.format(totalExpense)}
                  </div>
                </CardContent>
              </Card>

              <Card className="flex-1 min-w-[240px]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Tahmini Bakiye ({forecastMonths} ay)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${totalBalance >= 0 ? 'text-[var(--income-color)]' : 'text-[var(--expense-color)]'}`}>
                    {formatter.format(totalBalance)}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-2 w-full max-w-xs mx-auto mb-6">
              <Label htmlFor="forecastRange">Tahmin Aralığı: {forecastMonths} ay</Label>
              <Input 
                id="forecastRange" 
                type="range" 
                min="1" 
                max="24" 
                value={forecastMonths}
                onChange={(e) => setForecastMonths(parseInt(e.target.value))}
              />
            </div>

            <ForecastChart 
              monthlyData={monthlyData}
              formatter={formatter}
            />
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <div className="flex justify-between items-center mb-6">
            <div className="space-y-2">
              <Label htmlFor="monthSelector">Dönem Filtresi</Label>
              <select 
                id="monthSelector" 
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="p-2 bg-secondary rounded-md border border-border"
              >
                <option value="all">Tüm Zamanlar</option>
                <option value="current">Bu Ay</option>
                <option value="last">Geçen Ay</option>
              </select>
            </div>

            <Button onClick={() => openTransactionModal()}>
              <Plus className="mr-2 h-4 w-4" /> İşlem Ekle
            </Button>
          </div>

          <TransactionList 
            transactions={transactionsTabData}
            onEdit={openTransactionModal}
            onDelete={handleDeleteTransaction}
            getCategoryName={getCategoryName}
            getFrequencyName={getFrequencyName}
            formatter={formatter}
            dateFormatter={dateFormatter}
          />
        </TabsContent>
      </Tabs>

      <TransactionModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTransaction}
        editingTransaction={editingTransaction}
      />
    </div>
  );
};

export default Index;
