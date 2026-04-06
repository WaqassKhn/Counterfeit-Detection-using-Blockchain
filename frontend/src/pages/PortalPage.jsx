import { useEffect, useMemo, useState } from "react";
import {
  addLogisticsStop,
  closeLogisticsCycle,
  fetchActors,
  fetchNfcTags,
  fetchProduct,
  readNfcTag,
  recordRetail,
  registerProduct
} from "../api";
import SectionTitle from "../components/SectionTitle";

const defaultManufacturerForm = {
  serialId: "",
  batchNumber: "",
  manufactureDate: ""
};

const defaultLogisticsForm = {
  serialId: "",
  origin: "",
  destination: "",
  notes: ""
};

const defaultDistributorForm = {
  serialId: "",
  customerName: "",
  dateOfRetail: ""
};

export default function PortalPage({ session }) {
  const { actor, token } = session;
  const [actors, setActors] = useState([]);
  const [tags, setTags] = useState([]);
  const [manufacturerForm, setManufacturerForm] = useState(defaultManufacturerForm);
  const [logisticsForm, setLogisticsForm] = useState(defaultLogisticsForm);
  const [distributorForm, setDistributorForm] = useState(defaultDistributorForm);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [productSnapshot, setProductSnapshot] = useState(null);
  const [selectedTagId, setSelectedTagId] = useState("NFC-AX1001");

  useEffect(() => {
    fetchActors().then((data) => setActors(data.distributors)).catch(() => setActors([]));
    fetchNfcTags().then((data) => setTags(data.tags)).catch(() => setTags([]));
  }, []);

  const distributorOptions = useMemo(() => actors, [actors]);
  const logisticsEvents = productSnapshot?.events?.filter((event) => event.department === "Logistics") || [];
  const canUseFirstHopShortcut = actor.role === "Logistics" && productSnapshot && logisticsEvents.length === 0;
  const sharedSerialId = manufacturerForm.serialId || logisticsForm.serialId || distributorForm.serialId;

  async function readDummyNfc() {
    setError("");
    try {
      const data = await readNfcTag(selectedTagId);
      setManufacturerForm({
        serialId: data.tag.serialId,
        batchNumber: data.tag.batchNumber,
        manufactureDate: data.tag.manufactureDate
      });
      setLogisticsForm((current) => ({ ...current, serialId: data.tag.serialId }));
      setDistributorForm((current) => ({ ...current, serialId: data.tag.serialId }));
      setStatus(`Loaded dummy NFC payload ${data.tag.tagId}`);
    } catch (err) {
      setError(err.message);
    }
  }

  async function loadProduct(serialId) {
    if (!serialId) {
      return;
    }

    try {
      const result = await fetchProduct(serialId);
      setProductSnapshot(result);
      setManufacturerForm((current) => ({
        ...current,
        serialId,
        batchNumber: result.batchNumber || current.batchNumber,
        manufactureDate: result.manufactureDate || current.manufactureDate
      }));
      setLogisticsForm((current) => ({
        ...current,
        serialId,
        origin: result.events[result.events.length - 1]?.location || result.manufacturerName
      }));
      setDistributorForm((current) => ({
        ...current,
        serialId
      }));
      setStatus(`Loaded product ${serialId}`);
    } catch (err) {
      setProductSnapshot(null);
      setError(err.message);
    }
  }

  async function handleManufacturerSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      const response = await registerProduct(manufacturerForm, token);
      setStatus(`Registered ${response.serialId}`);
      setManufacturerForm(defaultManufacturerForm);
      setProductSnapshot(response.snapshot);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleLogisticsSubmit(event, mode) {
    event.preventDefault();
    setError("");

    try {
      const response = mode === "complete"
        ? await closeLogisticsCycle(logisticsForm, token)
        : await addLogisticsStop(logisticsForm, token);
      setStatus(response.message);
      setProductSnapshot(response.snapshot);
      setLogisticsForm((current) => ({
        ...defaultLogisticsForm,
        serialId: current.serialId,
        origin: response.snapshot.events[response.snapshot.events.length - 1]?.location || ""
      }));
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDistributorSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      const response = await recordRetail(distributorForm, token);
      setStatus(response.message);
      setProductSnapshot(response.snapshot);
      setDistributorForm(defaultDistributorForm);
    } catch (err) {
      setError(err.message);
    }
  }

  function applyFirstHop(distributor) {
    if (!productSnapshot) {
      return;
    }

    setLogisticsForm((current) => ({
      ...current,
      origin: productSnapshot.manufacturerName,
      destination: distributor.location,
      notes: `Shortcut path to ${distributor.displayName}`
    }));
  }

  function handleSharedSerialChange(value) {
    setManufacturerForm((current) => ({ ...current, serialId: value }));
    setLogisticsForm((current) => ({ ...current, serialId: value }));
    setDistributorForm((current) => ({ ...current, serialId: value }));
  }

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow={`${actor.role} Portal`}
        title={`Operations for ${actor.displayName}`}
        body="Each operational screen is role-specific and backed by token-based access checks in the backend."
      />

      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <section className="rounded-[30px] bg-white/80 p-6 shadow-lg">
          <SectionTitle
            eyebrow="Dummy NFC"
            title="Simulated NFC extraction"
            body="This reads mock product metadata now, but the API contract is structured so a real NFC reader can replace it later."
          />
          <div className="space-y-4">
            <select
              className="w-full rounded-2xl border border-slate-200 px-4 py-3"
              value={selectedTagId}
              onChange={(event) => setSelectedTagId(event.target.value)}
            >
              {tags.map((tag) => (
                <option key={tag.tagId} value={tag.tagId}>{tag.tagId}</option>
              ))}
            </select>
            <button className="rounded-full bg-atlas-ocean px-5 py-3 text-white" onClick={readDummyNfc} type="button">
              Read Dummy NFC Signal
            </button>
          </div>

          <div className="mt-6 rounded-3xl bg-slate-950 p-5 text-white">
            <p className="text-xs uppercase tracking-[0.25em] text-sky-200">Product Lookup</p>
            <div className="mt-4 flex gap-3">
              <input
                className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3"
                placeholder="Serial ID"
                value={sharedSerialId}
                onChange={(event) => handleSharedSerialChange(event.target.value)}
              />
              <button
                className="rounded-full border border-white/20 px-5 py-3 text-sm"
                onClick={() => loadProduct(sharedSerialId)}
                type="button"
              >
                Load
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-[30px] bg-white/80 p-6 shadow-lg">
          {actor.role === "Manufacturer" ? (
            <form className="space-y-4" onSubmit={handleManufacturerSubmit}>
              <SectionTitle eyebrow="Manufacturer" title="Register a new production unit" body="Manufacturer data includes serial number, batch number, and date of manufacture." />
              <input className="w-full rounded-2xl border border-slate-200 px-4 py-3" placeholder="Serial number" value={manufacturerForm.serialId} onChange={(event) => setManufacturerForm({ ...manufacturerForm, serialId: event.target.value })} />
              <input className="w-full rounded-2xl border border-slate-200 px-4 py-3" placeholder="Batch number" value={manufacturerForm.batchNumber} onChange={(event) => setManufacturerForm({ ...manufacturerForm, batchNumber: event.target.value })} />
              <input className="w-full rounded-2xl border border-slate-200 px-4 py-3" placeholder="Date of manufacture" type="date" value={manufacturerForm.manufactureDate} onChange={(event) => setManufacturerForm({ ...manufacturerForm, manufactureDate: event.target.value })} />
              <button className="rounded-full bg-atlas-ink px-5 py-3 text-white" type="submit">Register Product</button>
            </form>
          ) : null}

          {actor.role === "Logistics" ? (
            <div className="space-y-5">
              <SectionTitle eyebrow="Logistics" title="Record multi-stop logistics flow" body="Logistics can add multiple transit stops before handing the product to an authorized distributor." />
              {canUseFirstHopShortcut ? (
                <div className="rounded-3xl border border-orange-200 bg-orange-50 p-4">
                  <p className="text-sm font-semibold text-atlas-ink">First-hop shortcut</p>
                  <p className="mt-1 text-sm text-atlas-steel">For the first logistics hop only, you can start from the manufacturer and prefill a distributor destination.</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {distributorOptions.map((distributor) => (
                      <button className="rounded-full border border-orange-300 px-4 py-2 text-sm" key={distributor.id} onClick={() => applyFirstHop(distributor)} type="button">
                        {distributor.displayName}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              <form className="space-y-4">
                <input className="w-full rounded-2xl border border-slate-200 px-4 py-3" placeholder="Serial number" value={logisticsForm.serialId} onChange={(event) => setLogisticsForm({ ...logisticsForm, serialId: event.target.value })} />
                <input className="w-full rounded-2xl border border-slate-200 px-4 py-3" placeholder="Origin" value={logisticsForm.origin} onChange={(event) => setLogisticsForm({ ...logisticsForm, origin: event.target.value })} />
                <input className="w-full rounded-2xl border border-slate-200 px-4 py-3" placeholder="Destination" value={logisticsForm.destination} onChange={(event) => setLogisticsForm({ ...logisticsForm, destination: event.target.value })} />
                <textarea className="min-h-24 w-full rounded-2xl border border-slate-200 px-4 py-3" placeholder="Stop notes" value={logisticsForm.notes} onChange={(event) => setLogisticsForm({ ...logisticsForm, notes: event.target.value })} />
                <div className="flex flex-wrap gap-3">
                  <button className="rounded-full bg-atlas-ocean px-5 py-3 text-white" onClick={(event) => handleLogisticsSubmit(event, "stop")} type="button">Add Transit Stop</button>
                  <button className="rounded-full bg-atlas-mint px-5 py-3 text-white" onClick={(event) => handleLogisticsSubmit(event, "complete")} type="button">Close at Distributor</button>
                </div>
              </form>
            </div>
          ) : null}

          {actor.role === "Distributor" ? (
            <form className="space-y-4" onSubmit={handleDistributorSubmit}>
              <SectionTitle eyebrow="Distributor" title="Record retail completion" body={`The distributor location is fixed to ${actor.location}.`} />
              <input className="w-full rounded-2xl border border-slate-200 px-4 py-3" placeholder="Customer name" value={distributorForm.customerName} onChange={(event) => setDistributorForm({ ...distributorForm, customerName: event.target.value })} />
              <input className="w-full rounded-2xl border border-slate-200 px-4 py-3" placeholder="Serial number" value={distributorForm.serialId} onChange={(event) => setDistributorForm({ ...distributorForm, serialId: event.target.value })} />
              <input className="w-full rounded-2xl border border-slate-200 px-4 py-3" placeholder="Date of retail" type="date" value={distributorForm.dateOfRetail} onChange={(event) => setDistributorForm({ ...distributorForm, dateOfRetail: event.target.value })} />
              <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-atlas-steel">Distributor location: {actor.location}</div>
              <button className="rounded-full bg-atlas-ink px-5 py-3 text-white" type="submit">Record Retail Delivery</button>
            </form>
          ) : null}

          {(status || error) ? (
            <div className="mt-6 rounded-3xl bg-slate-950 p-5 text-white">
              {status ? <p className="text-sm text-emerald-300">{status}</p> : null}
              {error ? <p className="text-sm text-red-300">{error}</p> : null}
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
