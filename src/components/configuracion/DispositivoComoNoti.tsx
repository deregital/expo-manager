// 'use client';

// import { Button } from '@/components/ui/button';
// import useFcmToken from '@/hooks/firebase/useFcmToken';
// import { trpc } from '@/lib/trpc';
// import React from 'react';

// interface DispositivoComoNotiProps {}

// const DispositivoComoNoti = ({}: DispositivoComoNotiProps) => {
//   const { token } = useFcmToken();

//   const { mutateAsync: addDevice } = trpc.notificacion.addDevice.useMutation();
//   const { mutateAsync: removeDevice } =
//     trpc.notificacion.removeDevice.useMutation();
//   const { data: user } = trpc.cuenta.getMe.useQuery();
//   const utils = trpc.useUtils();

//   if (!user || !user?.esAdmin || !token) {
//     return null;
//   }

//   return (
//     <Button
//       onClick={async () => {
//         if (user.fcmToken.includes(token)) {
//           await removeDevice(token);
//         } else {
//           await addDevice(token);
//         }
//         utils.cuenta.getMe.invalidate();
//       }}
//     >
//       {user.fcmToken.includes(token)
//         ? 'Dejar de recibir notificaciones'
//         : 'Recibir notificaciones en este dispositivo'}
//     </Button>
//   );
// };

// export default DispositivoComoNoti;
