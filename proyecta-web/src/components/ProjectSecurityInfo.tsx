export function ProjectSecurityInfo() {
  return (
    <div className="space-y-6">
      {/* Sin custodia = Seguro */}
      <div className="nova-card p-8 bg-gradient-to-br from-emerald-50 to-cyan-50 border-2 border-emerald-300">
        <h3 className="font-bold text-emerald-900 mb-6 text-xl flex items-center gap-2">
          <span>🔒</span> Sin custodia = Seguro
        </h3>

        <ul className="space-y-3 text-emerald-800">
          <li className="flex gap-3 items-start">
            <span className="text-lg">✅</span>
            <span><strong>Fondos sin custodia</strong> — El pool paga directamente a la dirección del investigador.</span>
          </li>
          <li className="flex gap-3 items-start">
            <span className="text-lg">✅</span>
            <span><strong>PROYECTA no toca los fondos</strong> — Solo muestra datos acreditados por el pool y la información publicada por el proyecto.</span>
          </li>
          <li className="flex gap-3 items-start">
            <span className="text-lg">✅</span>
            <span><strong>Los investigadores controlan su wallet</strong> — PROYECTA no recibe seed phrases, claves de gasto ni view keys.</span>
          </li>
          <li className="flex gap-3 items-start">
            <span className="text-lg">✅</span>
            <span><strong>Transparencia responsable</strong> — Los shares y pagos se verifican con el pool; Monero protege la privacidad en cadena.</span>
          </li>
        </ul>
      </div>

      {/* Información técnica de confianza */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Blockchain */}
        <div className="nova-card p-6 border-l-4 border-blue-500">
          <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
            <span>⛓️</span> Blockchain Monero
          </h4>
          <ul className="space-y-2 text-sm text-slate-700">
            <li>✓ Criptomoneda privada por defecto</li>
            <li>✓ Transacciones irreversibles (no se pueden revertir)</li>
            <li>✓ Los pagos del pool se envían a la dirección del investigador</li>
            <li>✓ La privacidad impide inferir saldo o historial desde una dirección pública</li>
          </ul>
        </div>

        {/* Gobernanza */}
        <div className="nova-card p-6 border-l-4 border-purple-500">
          <h4 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
            <span>🤝</span> Gobernanza Descentralizada
          </h4>
          <ul className="space-y-2 text-sm text-slate-700">
            <li>✓ Cada proyecto publica sus metas e hitos</li>
            <li>✓ El investigador conserva el control de su wallet</li>
            <li>✓ La comunidad puede revisar avances publicados</li>
            <li>✓ Las reglas de liberación deben quedar documentadas por proyecto</li>
          </ul>
        </div>

        {/* PROYECTA */}
        <div className="nova-card p-6 border-l-4 border-fuchsia-500">
          <h4 className="font-bold text-fuchsia-900 mb-3 flex items-center gap-2">
            <span>📋</span> Rol de PROYECTA
          </h4>
          <ul className="space-y-2 text-sm text-slate-700">
            <li>✓ Solo registra: no custodia</li>
            <li>✓ Facilita: no controla</li>
            <li>✓ Código abierto en GitHub</li>
            <li>✓ Auditable por cualquiera</li>
          </ul>
        </div>

        {/* Verificación */}
        <div className="nova-card p-6 border-l-4 border-emerald-500">
          <h4 className="font-bold text-emerald-900 mb-3 flex items-center gap-2">
            <span>🔍</span> Verificación del pool
          </h4>
          <ul className="space-y-2 text-sm text-slate-700">
            <li>✓ Shares, hashrate y pagos de SupportXMR</li>
            <li>✓ Fecha y fuente de cada actualización</li>
            <li>✓ Comprobantes voluntarios publicados por el investigador</li>
            <li>✓ Sin custodia de fondos por PROYECTA</li>
          </ul>
        </div>
      </div>

      {/* CTA */}
      <div className="nova-card p-6 bg-blue-50 border-2 border-blue-200 text-center space-y-3">
        <p className="font-bold text-blue-900">¿Tienes dudas sobre Monero, seguridad o el mecanismo de fondos?</p>
        <div className="space-y-2 text-sm text-blue-700">
          <div>
            Lee la <a href="/sobre-monero" className="underline font-bold hover:text-blue-900">guía completa sobre Monero XMR</a>
            {' '}(qué es, por qué lo usamos, cómo convertirlo a dinero real)
          </div>
          <div>O contacta a la comunidad en <a href="https://github.com/proyectahub/proyecta/discussions" target="_blank" rel="noopener noreferrer" className="underline font-bold hover:text-blue-900">GitHub Discussions</a></div>
        </div>
      </div>
    </div>
  )
}
