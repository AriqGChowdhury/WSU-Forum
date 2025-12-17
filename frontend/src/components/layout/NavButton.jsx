import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function NavButton({ icon: Icon, label, active, onClick, badge }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-center justify-between gap-3',
        'rounded-xl px-3 py-2.5 text-sm font-medium',
        'transition-all duration-200',
        'hover:bg-white hover:shadow-sm',
        active && 'bg-white shadow-sm text-[var(--wsu-green)]'
      )}
    >
      <div className="flex items-center gap-3">
        <Icon className={cn('h-5 w-5', active && 'text-[var(--wsu-green)]')} />
        <span>{label}</span>
      </div>
      {badge ? (
        <Badge 
          variant="secondary" 
          className="h-5 min-w-5 px-1.5 bg-[var(--wsu-green)]/10 text-[var(--wsu-green)]"
        >
          {badge}
        </Badge>
      ) : null}
    </button>
  );
}

export default NavButton;
