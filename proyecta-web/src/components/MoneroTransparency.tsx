import { ExternalLink, TrendingUp, DollarSign, Wallet } from 'lucide-react'

export function MoneroTransparency() {
  return (
    <div className="space-y-8">
      {/* Encabezado: Transparencia total */}
      <div className="space-y-4">
        <h2 className="text-3xl font-bold text-slate-900">🔓 Transparencia total sobre Monero XMR</h2>
        <p className="text-slate-700">
          PROYECTA usa <strong>Monero (XMR)</strong> porque es la única criptomoneda que garantiza
          <strong> privacidad por defecto, descentralización real y resistencia a censura</strong>.
          Aquí explicamos exactamente qué es, por qué la usamos, y cómo convertirla a dinero real.
        </p>
      </div>

      {/* Sección 1: Qué es Monero */}
      <div className="nova-card p-8 bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-300 space-y-4">
        <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Wallet className="h-6 w-6 text-blue-600" />
          ¿Qué es Monero (XMR)?
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Privacidad */}
          <div className="bg-white rounded-lg p-4 border border-blue-200 space-y-3">
            <p className="font-bold text-slate-900">🔐 Privacidad por defecto</p>
            <ul className="text-sm text-slate-700 space-y-1">
              <li>✓ Las transacciones son anónimas por defecto</li>
              <li>✓ El remitente está oculto (Ring Signatures)</li>
              <li>✓ El monto es oculto (Confidential Transactions)</li>
              <li>✓ El receptor es oculto (Stealth Addresses)</li>
            </ul>
          </div>

          {/* Descentralización */}
          <div className="bg-white rounded-lg p-4 border border-blue-200 space-y-3">
            <p className="font-bold text-slate-900">⚡ Minería descentralizada</p>
            <ul className="text-sm text-slate-700 space-y-1">
              <li>✓ Algoritmo RandomX (CPU, no ASIC)</li>
              <li>✓ Cualquiera puede minar con su computadora</li>
              <li>✓ Resistencia a monopolio de minería</li>
              <li>✓ Recompensa cada ~2 minutos</li>
            </ul>
          </div>

          {/* Fungibilidad */}
          <div className="bg-white rounded-lg p-4 border border-blue-200 space-y-3">
            <p className="font-bold text-slate-900">♻️ Fungible 100%</p>
            <ul className="text-sm text-slate-700 space-y-1">
              <li>✓ 1 XMR = 1 XMR (indistinguible)</li>
              <li>✓ Sin historial rastreable</li>
              <li>✓ No se puede censurar transacciones pasadas</li>
              <li>✓ No se puede "marcar" una moneda</li>
            </ul>
          </div>
        </div>

        <div className="bg-blue-100 rounded-lg p-4 border-l-4 border-blue-600 text-sm text-slate-700">
          <strong>Comparación con Bitcoin:</strong> Bitcoin es pseudónimo pero todas las transacciones son públicas.
          Con análisis blockchain se pueden identificar patrones. Monero es anónimo por defecto: incluso
          los investigadores que reciben XMR pueden mantener privacidad financiera.
        </div>
      </div>

      {/* Sección 2: Por qué PROYECTA usa Monero */}
      <div className="nova-card p-8 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300 space-y-4">
        <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-purple-600" />
          ¿Por qué PROYECTA usa Monero?
        </h3>

        <div className="space-y-3">
          <div className="flex gap-4 items-start">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">1</div>
            <div>
              <p className="font-bold text-slate-900">Privacidad para investigadores</p>
              <p className="text-sm text-slate-700 mt-1">Los científicos pueden financiar investigación sensible sin exponer sus actividades o ubicación financiera.</p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">2</div>
            <div>
              <p className="font-bold text-slate-900">Resistencia a censura</p>
              <p className="text-sm text-slate-700 mt-1">Monero no se puede "congelar" en una exchange o bloquear. La minería comunitaria no puede ser detenida por autoridades centrales.</p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">3</div>
            <div>
              <p className="font-bold text-slate-900">Minería CPU accesible</p>
              <p className="text-sm text-slate-700 mt-1">RandomX permite minar con cualquier computadora. No requiere GPUs caras o ASICs especializados.</p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">4</div>
            <div>
              <p className="font-bold text-slate-900">Verdaderamente descentralizado</p>
              <p className="text-sm text-slate-700 mt-1">No requiere custodios centralizados. Los fondos van directo a la billetera del investigador sin intermediarios.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sección 3: Flujo completo - De minería a dinero real */}
      <div className="nova-card p-8 bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-300 space-y-6">
        <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <DollarSign className="h-6 w-6 text-emerald-600" />
          💰 De XMR a dinero real en tu cuenta bancaria (ejemplo México)
        </h3>

        <div className="space-y-4">
          {/* Paso 1 */}
          <div className="border-l-4 border-emerald-600 pl-4 space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-lg">1</div>
              <h4 className="text-lg font-bold text-slate-900">Minar XMR en PROYECTA</h4>
            </div>
            <p className="text-sm text-slate-700 ml-13">
              Inicia minería (navegador o app). Tu CPU genera XMR que se acumula en dirección personal que controlas.
              <strong> Ejemplo: Acumulas 0.5 XMR en 1 mes de minería activa.</strong>
            </p>
          </div>

          {/* Paso 2 */}
          <div className="border-l-4 border-teal-600 pl-4 space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-lg">2</div>
              <h4 className="text-lg font-bold text-slate-900">Transferir a CoinEx (exchange)</h4>
            </div>
            <div className="text-sm text-slate-700 ml-13 space-y-2">
              <p><strong>Crear cuenta en CoinEx.com</strong> (exchange que soporta XMR)</p>
              <p>Copiar dirección de depósito XMR en CoinEx (dirección pública diferente a tu billetera)</p>
              <p>Enviar 0.5 XMR desde tu billetera personal a CoinEx</p>
              <p className="text-xs text-slate-500 italic">Tiempo: ~10 minutos (confirmación blockchain Monero)</p>
              <p><strong>Fee estimado: 0.001 XMR (~$0.16 USD)</strong></p>
            </div>
          </div>

          {/* Paso 3 */}
          <div className="border-l-4 border-cyan-600 pl-4 space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-cyan-600 text-white flex items-center justify-center font-bold text-lg">3</div>
              <h4 className="text-lg font-bold text-slate-900">Convertir XMR a USDT en CoinEx</h4>
            </div>
            <div className="text-sm text-slate-700 ml-13 space-y-2">
              <p><strong>En CoinEx:</strong> Ir a "Trading" → Buscar par XMR/USDT</p>
              <p>Hacer "market order" o "limit order" para vender 0.5 XMR</p>
              <p className="font-bold">Resultado: Recibes ~$158 USDT (precio actual XMR ~$316)</p>
              <p className="text-xs text-slate-500 italic">Fee de trading: ~0.2% (comisión de CoinEx)</p>
            </div>
          </div>

          {/* Paso 4 */}
          <div className="border-l-4 border-blue-600 pl-4 space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">4</div>
              <h4 className="text-lg font-bold text-slate-900">Transferir USDT a Bitso o DolarApp</h4>
            </div>
            <div className="text-sm text-slate-700 ml-13 space-y-2">
              <p><strong>Opción A - DolarApp (más rápido):</strong></p>
              <ul className="list-disc list-inside text-xs space-y-1 ml-4">
                <li>Crear cuenta en DolarApp (app móvil, Mexico)</li>
                <li>Vincular tu billetera DolarApp a CoinEx (USDT Tron/USDC)</li>
                <li>Transferir USDT desde CoinEx a DolarApp</li>
                <li>En DolarApp, convertir USDT a MXN instantáneamente</li>
                <li>Transferir a cuenta bancaria mexicana (~2-5 minutos)</li>
              </ul>

              <p className="mt-2"><strong>Opción B - Bitso (más establecido):</strong></p>
              <ul className="list-disc list-inside text-xs space-y-1 ml-4">
                <li>Crear cuenta en Bitso.com (plataforma mexicana regulada)</li>
                <li>Transferir USDT desde CoinEx a Bitso</li>
                <li>Vender USDT por MXN en Bitso</li>
                <li>Transferir MXN a cualquier banco mexicano (~24 hrs)</li>
              </ul>

              <p className="text-xs text-slate-500 italic mt-2">Fees: DolarApp ~1%, Bitso ~0.5%</p>
            </div>
          </div>

          {/* Paso 5 */}
          <div className="border-l-4 border-green-600 pl-4 space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-lg">5</div>
              <h4 className="text-lg font-bold text-slate-900">✅ Dinero en cuenta bancaria</h4>
            </div>
            <div className="text-sm text-slate-700 ml-13 space-y-2">
              <p><strong>Resultado final:</strong> ~$155-157 MXN en tu cuenta bancaria mexicana</p>
              <p>Desde CoinEx puedes hacer transferencias a cualquier otro banco (BBVA, Santander, Oxxo, etc)</p>
              <p className="font-bold">Tiempo total: 1-2 horas (DolarApp) o 24-48 hrs (Bitso)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de cálculo de ejemplo */}
      <div className="nova-card p-6 border-2 border-slate-300 space-y-4">
        <h4 className="font-bold text-slate-900">📊 Ejemplo de cálculo completo (0.5 XMR)</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-100">
                <th className="text-left p-3 font-bold">Paso</th>
                <th className="text-right p-3 font-bold">Cantidad</th>
                <th className="text-right p-3 font-bold">Fee</th>
                <th className="text-right p-3 font-bold">Saldo</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="p-3">1. XMR minado</td>
                <td className="text-right p-3">0.5 XMR</td>
                <td className="text-right p-3">—</td>
                <td className="text-right p-3 font-bold">0.5 XMR</td>
              </tr>
              <tr className="bg-slate-50 border-t">
                <td className="p-3">2. Envío a CoinEx</td>
                <td className="text-right p-3">0.5 XMR</td>
                <td className="text-right p-3">-0.001 XMR</td>
                <td className="text-right p-3 font-bold">0.499 XMR</td>
              </tr>
              <tr className="border-t">
                <td className="p-3">3. Venta en CoinEx (XMR/USDT)</td>
                <td className="text-right p-3">0.499 XMR @ $316</td>
                <td className="text-right p-3">-0.2%</td>
                <td className="text-right p-3 font-bold">$157.62 USDT</td>
              </tr>
              <tr className="bg-slate-50 border-t">
                <td className="p-3">4. Transferencia a DolarApp</td>
                <td className="text-right p-3">$157.62 USDT</td>
                <td className="text-right p-3">~0%</td>
                <td className="text-right p-3 font-bold">$157.62 USDT</td>
              </tr>
              <tr className="border-t">
                <td className="p-3">5. Conversión a MXN (1 USDT = 20 MXN)</td>
                <td className="text-right p-3">$157.62 USDT</td>
                <td className="text-right p-3">-1%</td>
                <td className="text-right p-3 font-bold">$3,050 MXN</td>
              </tr>
              <tr className="bg-green-50 border-t border-green-600">
                <td className="p-3 font-bold">6. ✅ EN TU BANCO</td>
                <td className="text-right p-3"></td>
                <td className="text-right p-3"></td>
                <td className="text-right p-3 font-bold">$3,050 MXN</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-600 italic">
          * Precios y fees son aproximados y pueden variar. Verificar en CoinEx, DolarApp y Bitso antes de convertir.
        </p>
      </div>

      {/* Links útiles */}
      <div className="nova-card p-6 bg-amber-50 border-2 border-amber-300 space-y-4">
        <h4 className="font-bold text-slate-900">🔗 Enlaces útiles para convertir XMR</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a href="https://www.coinex.com" target="_blank" rel="noopener noreferrer"
             className="p-4 bg-white rounded-lg border border-amber-200 hover:border-amber-400 transition flex items-start gap-3">
            <ExternalLink className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-900 text-sm">CoinEx.com</p>
              <p className="text-xs text-slate-600">Exchange global, soporta XMR directo</p>
            </div>
          </a>

          <a href="https://www.dolarapp.com" target="_blank" rel="noopener noreferrer"
             className="p-4 bg-white rounded-lg border border-amber-200 hover:border-amber-400 transition flex items-start gap-3">
            <ExternalLink className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-900 text-sm">DolarApp</p>
              <p className="text-xs text-slate-600">App México, conversión USDT→MXN rápida</p>
            </div>
          </a>

          <a href="https://www.bitso.com" target="_blank" rel="noopener noreferrer"
             className="p-4 bg-white rounded-lg border border-amber-200 hover:border-amber-400 transition flex items-start gap-3">
            <ExternalLink className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-900 text-sm">Bitso</p>
              <p className="text-xs text-slate-600">Plataforma mexicana regulada, confiable</p>
            </div>
          </a>

          <a href="https://www.monero.how" target="_blank" rel="noopener noreferrer"
             className="p-4 bg-white rounded-lg border border-amber-200 hover:border-amber-400 transition flex items-start gap-3">
            <ExternalLink className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-900 text-sm">Monero.how</p>
              <p className="text-xs text-slate-600">Documentación oficial de Monero</p>
            </div>
          </a>
        </div>
      </div>

      {/* CTA final */}
      <div className="nova-card p-8 bg-gradient-to-r from-slate-900 to-slate-800 text-white space-y-3 rounded-xl">
        <p className="font-bold text-lg">🔐 Transparencia total, sin sorpresas</p>
        <p className="text-sm text-slate-200">
          En PROYECTA usamos Monero porque <strong>es la única forma de garantizar privacidad, descentralización y resistencia a censura</strong>.
          Cada investigador controla su propia billetera, recibe XMR directo, y puede convertirlo a dinero real como explicamos arriba.
          <strong> PROYECTA nunca toca los fondos</strong> — solo registra transacciones públicas en blockchain.
        </p>
      </div>
    </div>
  )
}
