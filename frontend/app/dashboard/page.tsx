import DashboardTabs from "@/app/components/DashboardTabs";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <main className="p-4 max-w-6xl mx-auto">
      <div className="flex gap-4 mb-4">
        <Link href={"/"}>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition">
            ← Back to Home
          </button>
        </Link>
        <Link href={"/addItem"}>
          <button className="px-4 py-2 bg-green-600 text-white rounded-xl shadow hover:bg-green-700 transition">
            + Add Item
          </button>
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">My Dashboard</h1>
      <DashboardTabs />
    </main>
  );
}
