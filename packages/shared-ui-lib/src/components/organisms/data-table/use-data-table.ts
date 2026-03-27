import { useState, useCallback } from 'react';
import type { GridPaginationModel, GridSortModel, GridFilterModel } from '@mui/x-data-grid';

interface UseDataTableOptions {
  defaultPageSize?: number;
  defaultSortField?: string;
  defaultSortDir?: 'asc' | 'desc';
}

export function useDataTable(options: UseDataTableOptions = {}) {
  const { defaultPageSize = 25, defaultSortField, defaultSortDir = 'asc' } = options;

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: defaultPageSize,
  });

  const [sortModel, setSortModel] = useState<GridSortModel>(
    defaultSortField ? [{ field: defaultSortField, sort: defaultSortDir }] : [],
  );

  const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [] });

  const resetPagination = useCallback(() => {
    setPaginationModel((prev: GridPaginationModel) => ({ ...prev, page: 0 }));
  }, []);

  return {
    paginationModel,
    setPaginationModel,
    sortModel,
    setSortModel,
    filterModel,
    setFilterModel,
    resetPagination,
    page: paginationModel.page,
    pageSize: paginationModel.pageSize,
  };
}
