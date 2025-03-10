import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const FormTextInput = ({
  label,
  name,
  className,
  ...props
}: FormInputProps) => (
  <div className='flex flex-col gap-y-1'>
    <Label className='slate-900 text-sm font-medium' htmlFor={name}>
      {label}
    </Label>
    <Input id={name} className={cn('w-full', className)} {...props} />
  </div>
);

export const FieldRow = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={cn('flex items-end gap-3 md:gap-7 [&>*]:flex-1', className)}>
    {children}
  </div>
);
