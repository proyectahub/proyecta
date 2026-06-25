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
            <span><strong>Tu dinero está en blockchain</strong> — Monero públicamente verificable en cualquier momento</span>
          </li>
          <li className="flex gap-3 items-start">
            <span className="text-lg">✅</span>
            <span><strong>PROYECTA no toca los fondos</strong> — Solo registra transacciones en IPFS para transparencia</span>
          </li>
          <li className="flex gap-3 items-start">
            <span className="text-lg">✅</span>
            <span><strong>Los investigadores controlan todo</strong> — Dirección multisig con supervisores comunitarios</span>
          </li>
          <li className="flex gap-3 items-start">
            <span className="text-lg">✅</span>
            <span><strong>Auditoría en tiempo real</strong> — Cualquiera puede verificar transacciones en el explorador Monero</span>
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
            <li>✓ Generada por minería comunitaria real</li>
            <li>✓ Resiste análisis de quién envía qué</li>
          </ul>
        </div>

        {/* Gobernanza */}
        <div className="nova-card p-6 border-l-4 border-purple-500">
          <h4 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
            <span>🤝</span> Gobernanza Descentralizada
          </h4>
          <ul className="space-y-2 text-sm text-slate-700">
            <li>✓ Multisig: múltiples firmas necesarias</li>
            <li>✓ Supervisores comunitarios verifican gastos</li>
            <li>✓ Hitos votados por la comunidad</li>
            <li>✓ Fondos bloqueados hasta completar objetivos</li>
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
            <span>🔍</span> Verificación Pública
          </h4>
          <ul className="space-y-2 text-sm text-slate-700">
            <li>✓ Explorador Monero (xmrchain.net)</li>
            <li>✓ Verifica donaciones en tiempo real</li>
            <li>✓ Historial completo de transacciones</li>
            <li>✓ Sin intermediarios financieros</li>
          </ul>
        </div>
      </div>

      {/* CTA */}
      <div className="nova-card p-6 bg-blue-50 border-2 border-blue-200 text-center space-y-3">
        <p className="font-bold text-blue-900">¿Tienes dudas sobre Monero, seguridad o el mecanismo de fondos?</p>
        <p className="text-sm text-blue-700 space-y-2">
          <div>
            Lee la <a href="/sobre-monero" className="underline font-bold hover:text-blue-900">guía completa sobre Monero XMR</a>
            {' '}(qué es, por qué lo usamos, cómo convertirlo a dinero real)
          </div>
          <div>O contacta a la comunidad en <a href="https://github.com/proyectahub/proyecta/discussions" target="_blank" rel="noopener noreferrer" className="underline font-bold hover:text-blue-900">GitHub Discussions</a></div>
        </p>
      </div>
    </div>
  )
}
