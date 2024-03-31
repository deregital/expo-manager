import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getTextColorByBg(bg: string) {
  const color = bg.charAt(0) === '#' ? bg.substring(1, 7) : bg;
  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);
  const uicolors = [r / 255, g / 255, b / 255];
  const c = uicolors.map((col) => {
    if (col <= 0.03928) {
      return col / 12.92;
    }
    return Math.pow((col + 0.055) / 1.055, 2.4);
  });
  const L = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  return L > 0.179 ? 'black' : 'white';
}

export function randomColor(): string {
  const hue = Math.floor(Math.random() * 360);
  const saturation = Math.floor(Math.random() * 30) + 40; // Entre 40% y 70%
  const lightness = Math.floor(Math.random() * 20) + 40; // Entre 40% y 60%
  const [r, g, b] = hslToRgb(hue / 360, saturation / 100, lightness / 100);
  const color = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;

  return color;
}

export function normalize(str: string) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function hslToRgb(h: number, s: number, l: number) {
  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hueToRgb(p, q, h + 1 / 3);
    g = hueToRgb(p, q, h);
    b = hueToRgb(p, q, h - 1 / 3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function hueToRgb(p: number, q: number, t: number) {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
}

export function searchNormalize(str: string, search: string) {
  return (
    normalize(str).toLowerCase().includes(search.toLowerCase()) ||
    str.toLowerCase().includes(search.toLowerCase())
  );
}

export function dateFormatYYYYMMDD(date: Date) {
  return `${date.getFullYear()}-${date.getMonth() + 1 > 10 ? date.getMonth() + 1 : `0${date.getMonth() + 1}`}-${date.getDate()}`;
}

export function addDays(date: string, days: number) {
  const daysInMs = days * 24 * 60 * 60 * 1000;
  return new Date(new Date(date).getTime() + daysInMs - 1);
}
