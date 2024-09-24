import { protectedProcedure, router } from '@/server/trpc';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

// tipado de localidades
export type Localidad = {
  id: string;
  nombre: string;
  fuente: string;
  provincia: {
    id: string;
    nombre: string;
  };
  departamento: {
    id: string;
    nombre: string;
  };
  municipio: {
    id: string;
    nombre: string;
  };
  localidad_censal: {
    id: string;
    nombre: string;
  };
  categoria: string;
  centroide: {
    lon: number;
    lat: number;
  };
}[];

export type LocalidadesJson = {
  localidades: Localidad;
};

export const mapaRouter = router({
  getLocations: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.residencia.findMany({
      where: {
        // where it has some perfil associated
        perfiles: {
          some: {
            esPapelera: false,
          },
        },
      },
      select: {
        latitud: true,
        longitud: true,
        localidad: true,
        _count: {
          select: {
            perfiles: true,
          },
        },
      },
    });
  }),
  getLocalidadesByProvincia: protectedProcedure
    .input(z.string())
    .query(async ({ input }) => {
      const localidades: LocalidadesJson = require('../../lib/localidades.json');
      const localidadesByState = localidades.localidades.filter(
        (localidad) => localidad.provincia.nombre === input
      );
      if (localidadesByState.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'No se encontraron localidades',
        });
      }
      return localidadesByState.map((localidad) => {
        return {
          id: localidad.id,
          nombre: localidad.nombre,
          centroide: localidad.centroide,
        };
      });
    }),
});
