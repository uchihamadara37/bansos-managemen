import { Eye, HeartHandshake, ShieldCheck, Users } from "lucide-react";

const POINTS = [
  { icon: Eye, text: "Laporan keuangan terbuka untuk semua" },
  { icon: ShieldCheck, text: "Setiap perubahan tercatat di log aktivitas" },
  { icon: Users, text: "Dikelola bersama, untuk kebaikan bersama" },
];

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-bg grid lg:grid-cols-2">
      {/* HERO */}
      <section className="flex flex-col justify-center px-6 pt-12 text-center lg:px-16 lg:py-12 lg:text-left">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-linear-to-br from-blue-600 to-sky-500 text-white shadow-lg shadow-blue-500/30 lg:mx-0">
          <HeartHandshake className="h-7 w-7" />
        </span>
        <p className="mt-6 text-sm font-semibold uppercase tracking-widest text-blue-600">Dana Sosial SOT B</p>
        <h1 className="mt-3 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl lg:text-5xl">
          Dari kita untuk kita,
          <span className="block bg-linear-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent">
            memberi tanpa mengharap kembali.
          </span>
        </h1>
        <ul className="mt-8 hidden space-y-3 lg:block">
          {POINTS.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3 text-slate-600">
              <span className="glass grid h-9 w-9 place-items-center rounded-xl text-blue-600">
                <Icon className="h-4 w-4" />
              </span>
              {text}
            </li>
          ))}
        </ul>
      </section>

      {/* FORM */}
      <section className="flex items-center justify-center px-4 py-10 lg:px-12">
        <div className="glass w-full max-w-md rounded-3xl p-8">{children}</div>
      </section>
    </div>
  );
}