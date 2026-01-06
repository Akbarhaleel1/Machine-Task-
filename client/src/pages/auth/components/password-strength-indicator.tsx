import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PasswordStrengthIndicatorProps {
  password: string;
}

type StrengthLevel = 'weak' | 'medium' | 'strong';

interface StrengthResult {
  score: number;
  label: StrengthLevel;
  color: string;
  textColor: string;
}

function calculatePasswordStrength(password: string): StrengthResult {
  let score = 0;

  // Length check
  if (password.length >= 8) score++;

  // Mixed case check
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;

  // Number check
  if (/\d/.test(password)) score++;

  // Special character check
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

  // Determine strength level
  let label: StrengthLevel;
  let color: string;
  let textColor: string;

  if (score <= 1) {
    label = 'weak';
    color = 'bg-red-500';
    textColor = 'text-red-600';
  } else if (score === 2) {
    label = 'medium';
    color = 'bg-yellow-500';
    textColor = 'text-yellow-600';
  } else {
    label = 'strong';
    color = 'bg-green-500';
    textColor = 'text-green-600';
  }

  return { score, label, color, textColor };
}

export function PasswordStrengthIndicator({ password }: Readonly<PasswordStrengthIndicatorProps>) {
  if (!password) return null;

  const strength = calculatePasswordStrength(password);
  const widthPercentage = (strength.score / 4) * 100;

  return (
    <div className="space-y-2 mt-2">
      {/* Progress bar */}
      <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${widthPercentage}%` }}
          transition={{ duration: 0.3 }}
          className={cn('h-full transition-colors duration-300', strength.color)}
        />
      </div>

      {/* Label */}
      <p className={cn('text-xs font-medium capitalize', strength.textColor)}>
        Password strength: {strength.label}
      </p>
    </div>
  );
}
