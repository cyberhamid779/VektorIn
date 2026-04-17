import { Link } from "react-router-dom";
import { Users, MessageCircle, Search, UserPlus, ArrowRight, Newspaper } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-blue-600">InVektor</h1>
        <div className="flex gap-3">
          <Link to="/login" className="px-5 py-2 text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition">
            Daxil ol
          </Link>
          <Link to="/register" className="px-5 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition">
            Qeydiyyat
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <div className="inline-block bg-blue-100 text-blue-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          Milli Aviasiya Akademiyası Professional Şəbəkəsi
        </div>
        <h2 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
          Tələbələri birləşdir,
          <br />
          <span className="text-blue-600">gələcəyi qur.</span>
        </h2>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
          InVektor — Milli Aviasiya Akademiyasının qapalı professional şəbəkəsi.
          Bacarıqlarını paylaş, komanda tap, birlikdə böyü.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            to="/register"
            className="px-8 py-3.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition flex items-center gap-2 shadow-lg shadow-blue-200"
          >
            Başla <ArrowRight size={20} />
          </Link>
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-12 mt-16">
          <div>
            <p className="text-3xl font-bold text-gray-900">3000+</p>
            <p className="text-gray-500 text-sm">Tələbə</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900">1</p>
            <p className="text-gray-500 text-sm">Platforma</p>
          </div>
        </div>
      </section>

      {/* Features — yalnız mövcud funksiyalar */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">Nə edə bilərsən?</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard
            icon={<Newspaper size={28} />}
            title="Post paylaş"
            desc="Düşüncələrini, layihələrini paylaş. Bəyən, şərh yaz."
            color="blue"
          />
          <FeatureCard
            icon={<Search size={28} />}
            title="Tələbə axtar"
            desc="Bacarıq və ixtisas filtri ilə uyğun tələbəni tap."
            color="indigo"
          />
          <FeatureCard
            icon={<UserPlus size={28} />}
            title="Bağlantı qur"
            desc="İstək göndər, qəbul et. Professional şəbəkəni genişləndir."
            color="green"
          />
          <FeatureCard
            icon={<MessageCircle size={28} />}
            title="Mesajlaş"
            desc="Bağlantılarınla birbaşa mesajlaş, əməkdaşlıq qur."
            color="purple"
          />
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-16 text-center">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-12 text-white">
          <h3 className="text-3xl font-bold mb-4">Tələbənin qəhvəsi, karyeranın başlanğıcı.</h3>
          <p className="text-blue-100 mb-8 text-lg">@naa.edu.az emailinlə indi qeydiyyatdan keç.</p>
          <Link
            to="/register"
            className="inline-block px-8 py-3.5 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition"
          >
            Qeydiyyatdan keç
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 text-gray-400 text-sm">
        InVektor — Vektor × MAA × Alfavit Group
      </footer>
    </div>
  );
}

const colorMap = {
  blue: "bg-blue-100 text-blue-600",
  indigo: "bg-indigo-100 text-indigo-600",
  green: "bg-green-100 text-green-600",
  purple: "bg-purple-100 text-purple-600",
};

function FeatureCard({ icon, title, desc, color }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition border border-gray-100">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${colorMap[color]}`}>
        {icon}
      </div>
      <h4 className="text-lg font-semibold text-gray-900 mb-2">{title}</h4>
      <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}
