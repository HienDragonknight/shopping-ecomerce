"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";

interface GHNProvince { ProvinceID: number; ProvinceName: string; }
interface GHNDistrict { DistrictID: number; DistrictName: string; }
interface GHNWard { WardCode: string; WardName: string; }

export interface AddressFormData {
  fullName: string;
  phone: string;
  province: string;
  provinceId: number;
  district: string;
  districtId: number;
  ward: string;
  wardCode: string;
  detail: string;
  isDefault: boolean;
}

interface Props {
  onSave: (data: AddressFormData) => Promise<void>;
  onCancel?: () => void;
  initialData?: Partial<AddressFormData>;
  saving?: boolean;
}

const emptyForm: AddressFormData = {
  fullName: "", phone: "", province: "", provinceId: 0,
  district: "", districtId: 0, ward: "", wardCode: "",
  detail: "", isDefault: false,
};

export function GHNAddressForm({ onSave, onCancel, initialData, saving }: Props) {
  const [form, setForm] = useState<AddressFormData>({ ...emptyForm, ...initialData });
  const [provinces, setProvinces] = useState<GHNProvince[]>([]);
  const [districts, setDistricts] = useState<GHNDistrict[]>([]);
  const [wards, setWards] = useState<GHNWard[]>([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);
  const [ghnFailed, setGhnFailed] = useState(false);

  // Load provinces on mount
  useEffect(() => {
    setLoadingProvinces(true);
    api.get("/ghn/provinces")
      .then((r) => {
        const data = r.data.data?.data || r.data.data || [];
        setProvinces(Array.isArray(data) ? data : []);
      })
      .catch(() => setGhnFailed(true))
      .finally(() => setLoadingProvinces(false));
  }, []);

  // Load districts when province changes
  const handleProvinceChange = async (provinceId: number, provinceName: string) => {
    setForm((f) => ({ ...f, provinceId, province: provinceName, districtId: 0, district: "", wardCode: "", ward: "" }));
    setDistricts([]);
    setWards([]);
    if (!provinceId) return;
    setLoadingDistricts(true);
    try {
      const r = await api.post("/ghn/districts", { provinceId });
      const data = r.data.data?.data || r.data.data || [];
      setDistricts(Array.isArray(data) ? data : []);
    } catch { setGhnFailed(true); }
    finally { setLoadingDistricts(false); }
  };

  // Load wards when district changes
  const handleDistrictChange = async (districtId: number, districtName: string) => {
    setForm((f) => ({ ...f, districtId, district: districtName, wardCode: "", ward: "" }));
    setWards([]);
    if (!districtId) return;
    setLoadingWards(true);
    try {
      const r = await api.post("/ghn/wards", { districtId });
      const data = r.data.data?.data || r.data.data || [];
      setWards(Array.isArray(data) ? data : []);
    } catch { setGhnFailed(true); }
    finally { setLoadingWards(false); }
  };

  const handleWardChange = (wardCode: string, wardName: string) => {
    setForm((f) => ({ ...f, wardCode, ward: wardName }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(form);
  };

  const inputCls = "w-full h-11 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FCCE00] focus:border-transparent bg-white transition-all";
  const selectCls = `${inputCls} cursor-pointer disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed`;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {ghnFailed && (
        <div className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
          ⚠️ Không thể kết nối GHN API – vui lòng nhập tỉnh/huyện/xã thủ công
        </div>
      )}

      {/* Họ tên + SĐT */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-1 block">Họ và tên *</label>
          <input
            required
            placeholder="Nguyễn Văn A"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            className={inputCls}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-1 block">Số điện thoại *</label>
          <input
            required
            type="tel"
            placeholder="0912345678"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className={inputCls}
          />
        </div>
      </div>

      {/* Tỉnh / Huyện / Xã */}
      {!ghnFailed ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1 block">
              Tỉnh/Thành phố * {loadingProvinces && <span className="text-slate-400 font-normal">Đang tải...</span>}
            </label>
            <select
              required
              disabled={loadingProvinces}
              value={form.provinceId || ""}
              onChange={(e) => {
                const opt = provinces.find((p) => p.ProvinceID === Number(e.target.value));
                if (opt) handleProvinceChange(opt.ProvinceID, opt.ProvinceName);
              }}
              className={selectCls}
            >
              <option value="">-- Chọn tỉnh --</option>
              {provinces.map((p) => (
                <option key={p.ProvinceID} value={p.ProvinceID}>{p.ProvinceName}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1 block">
              Quận/Huyện * {loadingDistricts && <span className="text-slate-400 font-normal">Đang tải...</span>}
            </label>
            <select
              required
              disabled={!form.provinceId || loadingDistricts}
              value={form.districtId || ""}
              onChange={(e) => {
                const opt = districts.find((d) => d.DistrictID === Number(e.target.value));
                if (opt) handleDistrictChange(opt.DistrictID, opt.DistrictName);
              }}
              className={selectCls}
            >
              <option value="">-- Chọn huyện --</option>
              {districts.map((d) => (
                <option key={d.DistrictID} value={d.DistrictID}>{d.DistrictName}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1 block">
              Phường/Xã * {loadingWards && <span className="text-slate-400 font-normal">Đang tải...</span>}
            </label>
            <select
              required
              disabled={!form.districtId || loadingWards}
              value={form.wardCode || ""}
              onChange={(e) => {
                const opt = wards.find((w) => w.WardCode === e.target.value);
                if (opt) handleWardChange(opt.WardCode, opt.WardName);
              }}
              className={selectCls}
            >
              <option value="">-- Chọn xã --</option>
              {wards.map((w) => (
                <option key={w.WardCode} value={w.WardCode}>{w.WardName}</option>
              ))}
            </select>
          </div>
        </div>
      ) : (
        /* Fallback text inputs if GHN API fails */
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: "Tỉnh/Thành phố *", key: "province", placeholder: "TP. Hồ Chí Minh" },
            { label: "Quận/Huyện *", key: "district", placeholder: "Quận 1" },
            { label: "Phường/Xã *", key: "ward", placeholder: "Phường Bến Nghé" },
          ].map(({ label, key, placeholder }) => (
            <div key={key}>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">{label}</label>
              <input
                required
                placeholder={placeholder}
                value={(form as unknown as Record<string, string>)[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className={inputCls}
              />
            </div>
          ))}
        </div>
      )}

      {/* Địa chỉ cụ thể */}
      <div>
        <label className="text-xs font-semibold text-slate-600 mb-1 block">Địa chỉ cụ thể *</label>
        <input
          required
          placeholder="Số nhà, tên đường, tòa nhà..."
          value={form.detail}
          onChange={(e) => setForm({ ...form, detail: e.target.value })}
          className={inputCls}
        />
      </div>

      {/* Mặc định */}
      <label className="flex items-center gap-2.5 cursor-pointer">
        <input
          type="checkbox"
          checked={form.isDefault}
          onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
          className="w-4 h-4 accent-[#FCCE00] rounded"
        />
        <span className="text-sm text-slate-600">Đặt làm địa chỉ mặc định</span>
      </label>

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 h-11 bg-[#FCCE00] hover:bg-[#E5B800] text-[#1A1A1A] font-bold rounded-full text-sm transition-colors disabled:opacity-60"
        >
          {saving ? "Đang lưu..." : "Lưu địa chỉ"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-5 h-11 border border-slate-200 text-sm font-medium rounded-full hover:bg-slate-50 transition-colors"
          >
            Hủy
          </button>
        )}
      </div>
    </form>
  );
}
