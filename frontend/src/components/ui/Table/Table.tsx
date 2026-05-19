// Таблица с сортировкой
import React from 'react';
import styles from './Table.module.css';

export interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
  rowKey: keyof T;
  isLoading?: boolean;
  emptyText?: string;
}

export const Table = <T extends Record<string, unknown>>({
  columns,
  data,
  onRowClick,
  rowKey,
  isLoading = false,
  emptyText = 'Нет данных',
}: TableProps<T>) => {
  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <span>Загрузка...</span>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={styles.empty}>
        <span>{emptyText}</span>
      </div>
    );
  }

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.key)}
                style={{ width: col.width, textAlign: col.align || 'left' }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr
              key={String(item[rowKey])}
              onClick={() => onRowClick?.(item)}
              className={onRowClick ? styles.clickableRow : ''}
            >
              {columns.map((col) => (
                <td
                  key={String(col.key)}
                  style={{ textAlign: col.align || 'left' }}
                >
                  {col.render
                    ? col.render(item)
                    : (item[col.key] as React.ReactNode)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
