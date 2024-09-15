import { PrimeReactProvider } from 'primereact/api';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Paginator } from 'primereact/paginator';
import './App.css'; // Import the updated dark theme CSS
import { GoChevronDown } from "react-icons/go"
import { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { OverlayPanel } from 'primereact/overlaypanel';

interface Product {
  title?: string;
  place_of_origin?: string;
  artist_display?: string;
  inscriptions?: string;
  date_start?: Date;
  date_end?: Date;
}

function App() {
  const primeReactConfig = {
    ripple: true,
    autoZIndex: true,
  };

  const op = useRef<OverlayPanel>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState(12);
  const [selectedProductTitles, setSelectedProductTitles] = useState<Set<string>>(new Set());
  const [newRows, setNewRows] = useState(rows);

  const fetchData = (page: number) => {
    setLoading(true);
    fetch(`https://api.artic.edu/api/v1/artworks?page=${page}`)
      .then((response) => response.json())
      .then((data) => {
        const extractedData = data.data.map((product: any) => ({
          title: product.title,
          place_of_origin: product.place_of_origin,
          artist_display: product.artist_display,
          inscriptions: product.inscriptions,
          date_start: product.date_start,
          date_end: product.date_end,
        }));

        setProducts(extractedData);
        setTotalRecords(data.pagination.total);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData(page);
  }, [page, rows]);

  const onPageChange = (event: any) => {
    setPage(event.page + 1);
  };

  const onSelectionChange = (e: any) => {
    const selectedTitles = new Set(e.value.map((product: Product) => product.title || ''));

    setSelectedProductTitles(prevSelectedTitles => {
      const updatedSelected = new Set(prevSelectedTitles);
      selectedTitles.forEach(title => updatedSelected.add(title));
      return updatedSelected;
    });
  };

  const isSelected = (product: Product) => {
    return selectedProductTitles.has(product.title || '');
  };

  const handleRowsChange = () => {
    if (newRows > 0) {
      setRows(newRows);
      setPage(1); // Reset to the first page after changing the rows
      op.current?.hide();
    }
  };

  return (
    <PrimeReactProvider value={primeReactConfig}>
      <div className="p-d-flex p-ai-center p-jc-between p-mb-3">
        <DataTable
          value={products}
          selection={products.filter(isSelected)}
          selectionMode="multiple"
          onSelectionChange={onSelectionChange}
          dataKey="title"
          loading={loading}
          style={{
            width: '1595px',
            height: '600px', // Fixed height for the table
            border: '1px solid black', // Add outer border
            overflowY: 'scroll', // Enable scrolling for large data
            overflowX: 'scroll', // Enable scrolling for large data
          }}
          tableStyle={{
            minWidth: '50rem',
            borderCollapse: 'collapse', // Ensure table borders are collapsed
          }}
          headerStyle={{ border: '1px solid black' }} // Borders for header
          className="custom-table"
          onRowSelect={({ data }) => {
            setSelectedProductTitles(prev => {
              const updated = new Set(prev);
              updated.add(data.title || '');
              return updated;
            });
          }}
          onRowUnselect={({ data }) => {
            setSelectedProductTitles(prev => {
              const updated = new Set(prev);
              updated.delete(data.title || '');
              return updated;
            });
          }}
        >
          <Column
            selectionMode="multiple"
            header={
              <div className="bg-black p-d-flex p-ai-center p-jc-between">
                <GoChevronDown
                  className="p-ml-2"
                  type='button'
                  onClick={(e) => op.current?.toggle(e)}
                  size={24} style={{ color: 'black' }} 
                />
              </div>
            }
            headerStyle={{ width: '3rem', border: '1px solid black' }} // Add border to the selection column
          />
          <Column field="title" header="Title" style={{ border: '1px solid black' }}></Column>
          <Column field="place_of_origin" header="Place Of Origin" style={{ border: '1px solid black' }}></Column>
          <Column field="artist_display" header="Artist Display" style={{ border: '1px solid black' }}></Column>
          <Column field="inscriptions" header="Inscriptions" style={{ border: '1px solid black' }}></Column>
          <Column field="date_start" header="Start Date" style={{ border: '1px solid black' }}></Column>
          <Column field="date_end" header="End Date" style={{ border: '1px solid black' }}></Column>
        </DataTable>

        <OverlayPanel ref={op} showCloseIcon>
          <div className="p-d-flex p-flex-column p-mt-2">
            <label htmlFor="rowsInput">Number of records per page:</label>
            <input
              id="rowsInput"
              type="number"
              value={newRows}
              onChange={(e) => setNewRows(Number(e.target.value))}
              min="1"
            />
            <Button label="Apply" onClick={handleRowsChange} className="p-mt-2" />
          </div>
        </OverlayPanel>
      </div>

      <Paginator
        first={(page - 1) * rows}
        rows={rows}
        totalRecords={totalRecords}
        onPageChange={onPageChange}
        template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} records"
        style={{ backgroundColor: '#1e1e1e', color: '#e0e0e0' }}
        className="mt-3 custom-paginator"
      />
    </PrimeReactProvider>
  );
}

export default App;
