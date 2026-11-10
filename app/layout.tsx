import type {Metadata} from 'next';
import { Nunito, Quicksand } from 'next/font/google';
import './globals.css';

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
  weight: ['400', '600', '700', '800', '900'],
  display: 'swap',
});

const quicksand = Quicksand({
  subsets: ['latin'],
  variable: '--font-quicksand',
  weight: ['600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Aprendiz Kids - Alfabetização Divertida',
  description: 'Plataforma lúdica e interativa de alfabetização para crianças de 5 a 8 anos com mapa de fases, áudio pt-BR, reforço positivo e perfis infantis.',
  openGraph: {
    title: 'Aprendiz Kids - Alfabetização Divertida',
    description: 'Aprenda vogais, consoantes, sílabas, palavras, frases e números com a corujinha Pipoca!',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aprendiz Kids - Alfabetização Divertida',
    description: 'Aprenda vogais, consoantes, sílabas, palavras, frases e números com a corujinha Pipoca!',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="pt-BR" className={`${nunito.variable} ${quicksand.variable}`}>
      <body className="font-sans bg-[#FAF8FF] text-[#131B2E] min-h-screen antialiased select-none" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
