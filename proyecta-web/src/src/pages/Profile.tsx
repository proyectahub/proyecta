import { useEffect, useState } from "react"

export default function Profile() {
  const [orcid, setOrcid] = useState("")
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const orcidId = params.get("orcid")

    if (orcidId) {
      setOrcid(orcidId)

      fetch(`https://pub.orcid.org/v3.0/${orcidId}`, {
        headers: {
          Accept: "application/json",
        },
      })
        .then(res => res.json())
        .then(res => setData(res))
    }
  }, [])

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-4">Perfil científico</h1>

      {orcid && (
        <p className="mb-4 text-slate-600">
          ORCID: {orcid}
        </p>
      )}

      {data  (
        <pre className="bg-slate-100 p-4 rounded-lg text-sm overflow-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      ) : (
        <p>Cargando perfil...</p>
      )}
    </div>
  )
}