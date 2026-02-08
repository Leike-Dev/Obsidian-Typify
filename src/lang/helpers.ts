import { en } from './en';
import { ptBR } from './pt-BR';

const localeMap: { [key: string]: Partial<typeof en> } = {
    'en': en,
    'pt': ptBR,
    'pt-br': ptBR,
};

const locale = window.localStorage.getItem('language') || 'en';

export function t(key: keyof typeof en): string {
    const lang = localeMap[locale.toLowerCase()] || en;
    return (lang as any)[key] || (en as any)[key] || key;
}
