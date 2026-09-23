import { useEffect, useRef, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { fmt } from "@/lib/market";

const NAMES = [
  "أحمد محمد",
  "محمود سعيد",
  "مصطفى علي",
  "كريم حسن",
  "عبدالرحمن ياسر",
  "إسلام فتحي",
  "سارة إبراهيم",
  "منى عادل",
  "ياسمين طارق",
  "هبة رمضان",
  "محمد جمال",
  "عمرو شعبان",
  "خالد أنور",
  "نورهان سمير",
  "مريم أشرف",
  "حسام الدين",
  "أميرة وليد",
  "طارق زكي",
  "شيماء ماهر",
  "عمر صلاح",
];

const METHODS = ["اتصالات كاش", "أورانج كاش", "وي كاش", "انستا باي"];
const AMOUNTS = [4000, 4500, 5000, 6000, 7500, 8000, 9000, 10000, 12500, 15000, 20000, 25000];

type Item = {
  id: string;
  name: string;
  method: string;
  amount: number;
  phone: string;
  secondsAgo: number;
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function maskPhone() {
  const prefix = pick(["010", "011", "012", "015"]);
  const tail = String(Math.floor(Math.random() * 100)).padStart(2, "0");
  return `${prefix}****${tail}`;
}

function makeItem(secondsAgo: number, excludeNames: string[]): Item {
  const available = NAMES.filter((n) => !excludeNames.includes(n));
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: pick(available.length ? available : NAMES),
    method: pick(METHODS),
    amount: pick(AMOUNTS),
    phone: maskPhone(),
    secondsAgo,
  };
}

function ago(s: number) {
  if (s < 60) return `منذ ${s} ثانية`;
  const m = Math.floor(s / 60);
  if (m < 60) return `منذ ${m} دقيقة`;
  const h = Math.floor(m / 60);
  return `منذ ${h} ساعة`;
}

export function LiveWithdrawals() {
  const [items, setItems] = useState<Item[]>([]);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    let t = 30;
    const seed: Item[] = [];
    for (let i = 0; i < 6; i++) {
      seed.push(makeItem(t, seed.map((s) => s.name)));
      t += 30 + Math.floor(Math.random() * 60);
    }
    setItems(seed);

    const tick = window.setInterval(() => {
      setItems((prev) => prev.map((it) => ({ ...it, secondsAgo: it.secondsAgo + 1 })));
    }, 1000);

    const schedule = () => {
      timer.current = window.setTimeout(
        () => {
          setItems((prev) => [makeItem(1), ...prev].slice(0, 8));
          schedule();
        },
        5000 + Math.random() * 7000,
      );
    };
    schedule();

    return () => {
      window.clearInterval(tick);
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  const total = items.reduce((s, i) => s + i.amount, 0);

  return (
    <section className="mt-5 rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-bold">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
          </span>
          عمليات سحب جارية الآن
        </h2>
        <span className="text-xs text-muted-foreground">
          {fmt(total)} ج.م آخر العمليات
        </span>
      </div>

      <ul className="mt-4 space-y-2">
        {items.map((it, idx) => (
          <li
            key={it.id}
            className={`flex items-center justify-between gap-3 rounded-xl border border-border bg-background/60 px-4 py-3 ${
              idx === 0 ? "animate-in fade-in slide-in-from-top-2 border-primary/50" : ""
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-bold leading-tight">{it.name}</p>
                <p className="text-xs text-muted-foreground">
                  {it.method} • <span dir="ltr">{it.phone}</span> • {ago(it.secondsAgo)}
                </p>
              </div>
            </div>
            <div className="text-left">
              <p className="text-sm font-black text-primary tabular-nums">
                {fmt(it.amount)} ج.م
              </p>
              <p className="text-[11px] text-muted-foreground">تم التنفيذ</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
