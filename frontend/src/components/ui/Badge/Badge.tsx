// Статусы + роли
import React from 'react';
import styles from './Badge.module.css';

export type BadgeVariant =
  | 'new'
  | 'progress'
  | 'accepted'
  | 'rejected'
  | 'admin'
  | 'member';

interface BadgeProps {
  variant: BadgeVariant;
  children?: React.ReactNode;
}

const variantLabels: Record<BadgeVariant, string> = {
  new: 'New',
  progress: 'InProgress',
  accepted: 'Accepted',
  rejected: 'Rejected',
  admin: 'Admin',
  member: 'Member',
};

export const Badge: React.FC<BadgeProps> = ({ variant, children }) => {
  return (
    <span className={`${styles.badge} ${styles[variant]}`}>
      {children || variantLabels[variant]}
    </span>
  );
};
