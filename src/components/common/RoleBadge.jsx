import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ROLE_COLORS } from '@/constants';
import { 
  GraduationCap, 
  BookOpen, 
  Briefcase, 
  Award, 
  Shield 
} from 'lucide-react';

// Role icons mapping
const ROLE_ICONS = {
  Student: GraduationCap,
  Faculty: BookOpen,
  Staff: Briefcase,
  Alumni: Award,
  Admin: Shield,
};

export function RoleBadge({ role, size = 'default', showIcon = true }) {
  const colors = ROLE_COLORS[role] || ROLE_COLORS.Student;
  const IconComponent = ROLE_ICONS[role] || GraduationCap;

  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0 h-4',
    default: 'text-xs px-2 py-0.5',
    lg: 'text-sm px-2.5 py-1',
  };

  const iconSizes = {
    sm: 'h-2.5 w-2.5',
    default: 'h-3 w-3',
    lg: 'h-3.5 w-3.5',
  };

  return (
    <Badge
      variant="outline"
      className={`
        font-medium border
        ${sizeClasses[size]}
      `}
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        borderColor: colors.border,
      }}
    >
      {showIcon && (
        <IconComponent className={`${iconSizes[size]} mr-1`} />
      )}
      {role}
    </Badge>
  );
}

// Compact role indicator (just icon with tooltip)
export function RoleIndicator({ role }) {
  const colors = ROLE_COLORS[role] || ROLE_COLORS.Student;
  const IconComponent = ROLE_ICONS[role] || GraduationCap;

  return (
    <div
      className="w-5 h-5 rounded-full flex items-center justify-center"
      style={{ backgroundColor: colors.bg }}
      title={role}
    >
      <IconComponent className="h-3 w-3" style={{ color: colors.text }} />
    </div>
  );
}

export default RoleBadge;