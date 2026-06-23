"use client";

import { AccountSidebar } from "@/components/AccountSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useT } from "@/hooks/useT";

export default function ProfilePage() {
  const t = useT();

  return (
    <div className="bg-[#F5F5F5] min-h-[calc(100vh-200px)] py-8">
      <div className="yody-container max-w-6xl">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full md:w-1/4 flex-shrink-0">
            <AccountSidebar />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
              <h1 className="text-xl font-bold text-[#1A1A1A] mb-6">
                {t.account.profile}
              </h1>

              <form className="max-w-2xl space-y-6" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#1A1A1A]">{t.account.fullName}</label>
                    <Input type="text" placeholder={t.account.fullName} className="h-11" defaultValue="Khách hàng" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#1A1A1A]">{t.account.phone}</label>
                    <Input type="tel" placeholder={t.account.phone} className="h-11" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#1A1A1A]">{t.account.email}</label>
                    <Input type="email" placeholder={t.account.email} className="h-11" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#1A1A1A]">{t.account.birthDate}</label>
                    <Input type="date" className="h-11" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#1A1A1A] block">{t.account.gender}</label>
                  <div className="flex gap-6 mt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="gender" value="male" className="w-4 h-4 text-[#FCCE00] focus:ring-[#FCCE00]" />
                      <span className="text-sm text-[#1A1A1A]">{t.account.genderMale}</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="gender" value="female" className="w-4 h-4 text-[#FCCE00] focus:ring-[#FCCE00]" />
                      <span className="text-sm text-[#1A1A1A]">{t.account.genderFemale}</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="gender" value="other" className="w-4 h-4 text-[#FCCE00] focus:ring-[#FCCE00]" />
                      <span className="text-sm text-[#1A1A1A]">{t.account.genderOther}</span>
                    </label>
                  </div>
                </div>

                <div className="pt-4">
                  <Button type="submit" className="w-full md:w-auto px-8 h-12 bg-[#FCCE00] hover:bg-[#E5B800] text-[#1A1A1A] font-bold text-base rounded-full transition-colors">
                    {t.account.saveChanges}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
