import { useEventModalData } from '@/components/eventos/modal/eventmodal';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';

import { Label } from '@/components/ui/label';
import { PlusIcon, TrashIcon } from 'lucide-react';
import { useState } from 'react';

const EventProducerLoginForm = () => {
  const modalData = useEventModalData((state) => ({
    eventProducerLogin: state.eventProducerLogin,
    type: state.type,
  }));
  const [isEnabled, setIsEnabled] = useState(
    modalData.type === 'EDIT' && modalData.eventProducerLogin.length > 0
      ? true
      : false
  );

  return (
    <>
      <div className='flex w-fit gap-x-2'>
        <Label htmlFor='event-producer-login'>
          Habilitar login de productor{' '}
          <span className='text-xs text-muted-foreground'>
            (feature exclusiva para el evento del 12/10)
          </span>
        </Label>
        <Checkbox
          checked={isEnabled}
          onCheckedChange={(checked) => {
            setIsEnabled(checked === 'indeterminate' ? false : checked);
            if (checked) {
              useEventModalData.setState({
                eventProducerLogin: [
                  {
                    mail: '',
                    password: '',
                    isActive: true,
                  },
                ],
              });
            } else {
              useEventModalData.setState({
                eventProducerLogin: [],
              });
            }
          }}
          id='event-producer-login'
        />
      </div>
      {isEnabled &&
        modalData.eventProducerLogin.length > 0 &&
        modalData.eventProducerLogin.map((login, idx) => (
          <div className='flex gap-x-2 px-2 pb-2' key={idx}>
            <div className='flex flex-col gap-y-2'>
              <Label htmlFor='event-producer-login-username'>Email</Label>
              <Input
                type='email'
                id='event-producer-login-username'
                value={login.mail}
                onChange={(e) => {
                  useEventModalData.setState({
                    eventProducerLogin: modalData.eventProducerLogin.map(
                      (l, i) => (i === idx ? { ...l, mail: e.target.value } : l)
                    ),
                  });
                }}
              />
            </div>
            <div className='flex flex-col gap-y-2'>
              <Label htmlFor='event-producer-login-password'>Contraseña</Label>
              <Input
                id='event-producer-login-password'
                value={login.password}
                onChange={(e) => {
                  useEventModalData.setState({
                    eventProducerLogin: modalData.eventProducerLogin.map(
                      (l, i) =>
                        i === idx ? { ...l, password: e.target.value } : l
                    ),
                  });
                }}
              />
            </div>
            <div className='flex flex-col justify-between gap-y-2'>
              <Label htmlFor='event-producer-login-is-active'>Activo</Label>
              <Checkbox
                className='size-8 justify-self-end'
                id='event-producer-login-is-active'
                checked={login.isActive}
                onCheckedChange={(checked) => {
                  useEventModalData.setState({
                    eventProducerLogin: modalData.eventProducerLogin.map(
                      (l, i) =>
                        i === idx
                          ? {
                              ...l,
                              isActive:
                                checked === 'indeterminate' ? false : checked,
                            }
                          : l
                    ),
                  });
                }}
              />
            </div>
            <Button
              className='self-end'
              variant='outline'
              size='icon'
              onClick={() => {
                useEventModalData.setState({
                  eventProducerLogin: modalData.eventProducerLogin.filter(
                    (_, i) => i !== idx
                  ),
                });
              }}
            >
              <TrashIcon />
            </Button>
            {idx === modalData.eventProducerLogin.length - 1 && (
              <Button
                className='self-end'
                variant='outline'
                size='icon'
                onClick={() => {
                  useEventModalData.setState({
                    eventProducerLogin: [
                      ...modalData.eventProducerLogin,
                      {
                        mail: '',
                        password: '',
                        isActive: true,
                      },
                    ],
                  });
                }}
              >
                <PlusIcon />
              </Button>
            )}
          </div>
        ))}
    </>
  );
};

export default EventProducerLoginForm;
