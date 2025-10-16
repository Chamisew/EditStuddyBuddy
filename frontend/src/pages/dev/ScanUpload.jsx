import { useState } from "react";
import QrScanner from "qr-scanner";
import api from "../../helpers/apiHelper";

export default function ScanUpload() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleFile(e) {
    const f = e.target.files[0];
    setFile(f);
    setResult(null);
    if (!f) return;
    setLoading(true);
    try {
      const blob = await f.arrayBuffer();
      const raw = new Uint8ClampedArray(blob);
      const res = await QrScanner.scanImage(f, {
        returnDetailedScanResult: true,
      });
      setResult(res?.data ?? JSON.stringify(res));
    } catch (err) {
      setResult("Decoding failed: " + (err?.message || err));
    } finally {
      setLoading(false);
    }
  }

  async function postScan() {
    if (!result) return;
    // expect result to contain a URL like /api/garbage/:id?token=...
    // or a JSON with {garbageId, token}
    let garbageId = null;
    let token = null;

    try {
      // Try parsing as JSON
      const parsed = JSON.parse(result);
      garbageId = parsed.garbageId || parsed.id || parsed._id;
      token = parsed.token;
    } catch (e) {
      // not JSON, try to extract from URL
      try {
        const url = new URL(result);
        const parts = url.pathname.split("/");
        garbageId =
          parts[parts.length - 2] === "garbage"
            ? parts[parts.length - 1]
            : parts[parts.length - 1];
        token = url.searchParams.get("token");
      } catch (ee) {
        // fallback: nothing
      }
    }

    if (!garbageId) {
      alert("Could not extract garbageId from QR result: " + result);
      return;
    }

    try {
      const body = { token };
      const res = await api.post(`/garbage/${garbageId}/scan/noauth`, body);
      alert("Scan posted, server response: " + JSON.stringify(res.data));
    } catch (err) {
      alert(
        "Post failed: " + (err?.response?.data?.message || err?.message || err),
      );
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">
        Dev: Upload QR image and decode
      </h2>
      <input type="file" accept="image/*" onChange={handleFile} />
      <div className="mt-4">
        {loading ? <div>Decoding...</div> : <div>Result: {result}</div>}
      </div>
      <div className="mt-4">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={postScan}
          disabled={!result}
        >
          Post to /scan/noauth
        </button>
      </div>
    </div>
  );
}
