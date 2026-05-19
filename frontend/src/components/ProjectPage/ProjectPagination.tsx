import styles from '../../assets/ProjectPage.module.css';

interface ProjectPaginationProps {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function ProjectPagination({
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
}: ProjectPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className={styles.pagination}>
      <button disabled={page === 1} onClick={() => onPageChange(page - 1)}>
        ←
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
        <button
          key={pageNumber}
          className={pageNumber === page ? styles.active : ''}
          onClick={() => onPageChange(pageNumber)}
        >
          {pageNumber}
        </button>
      ))}
      <button
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        →
      </button>
      <span>
        {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, total)} из{' '}
        {total}
      </span>
    </div>
  );
}
