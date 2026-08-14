"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { NODE_PASSWORD, type NodeCredentials } from "@/lib/node-session";

export function NodeLogin({
  nodes,
  activeUsername,
}: {
  nodes: NodeCredentials[];
  activeUsername?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState(activeUsername ?? nodes[0]?.username ?? "");
  const [password, setPassword] = useState(NODE_PASSWORD);
  const [error, setError] = useState<string | null>(null);

  const activeNode = useMemo(
    () => nodes.find((node) => node.username === activeUsername),
    [activeUsername, nodes],
  );

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password !== NODE_PASSWORD || !nodes.some((node) => node.username === username)) {
      setError("Credenciales invalidas para el prototipo.");
      return;
    }

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("node", username);
    router.push(`/?${nextParams.toString()}`);
  }

  return (
    <section className="rounded-3xl border border-cyan-100 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-cyan-700">Ingreso por nodo</p>
          <h3 className="mt-1 text-xl font-semibold text-slate-950">
            {activeNode
              ? `Sesion simulada: ${activeNode.healthCenterName}`
              : "Selecciona el centro de salud"}
          </h3>
          <p className="mt-2 text-sm text-slate-600">
            Todos los usuarios usan la contrasena <span className="font-mono">password</span>.
          </p>
        </div>

        <form onSubmit={submit} className="grid gap-3 sm:grid-cols-[minmax(0,260px)_160px_auto]">
          <select
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
          >
            {nodes.map((node) => (
              <option key={node.username} value={node.username}>
                {node.username}
              </option>
            ))}
          </select>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
            placeholder="password"
          />
          <button
            type="submit"
            className="rounded-xl bg-cyan-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-800"
          >
            Entrar
          </button>
        </form>
      </div>

      {error ? <p className="mt-4 text-sm font-medium text-rose-700">{error}</p> : null}
    </section>
  );
}

