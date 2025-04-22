import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { type SelectSingleEventHandler } from 'react-day-picker';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  type: Exclude<React.InputHTMLAttributes<HTMLInputElement>['type'], 'date'>;
}

type FormDateInputProps = {
  label: string;
  name: string;
  className?: string;
  onChange: SelectSingleEventHandler;
  value?: Date;
  min?: Date;
};

const FormInputWrapper = ({
  label,
  name,
  children,
}: {
  label: string;
  name: string;
  children: React.ReactNode;
}) => (
  <div className='flex flex-col gap-y-1'>
    <Label className='slate-900 text-sm font-medium' htmlFor={name}>
      {label}
    </Label>
    {children}
  </div>
);

export const FormTextInput = ({
  label,
  name,
  className,
  ...props
}: FormInputProps) => (
  <FormInputWrapper label={label} name={name}>
    <Input
      id={name}
      className={cn('w-full disabled:opacity-50', className)}
      {...props}
    />
  </FormInputWrapper>
);

export const FormDateInput = ({
  label,
  name,
  value,
  onChange,
  className,
  ...props
}: FormDateInputProps) => (
  <FormInputWrapper label={label} name={name}>
    <DatePicker value={value} onChange={onChange} {...props} />
  </FormInputWrapper>
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
