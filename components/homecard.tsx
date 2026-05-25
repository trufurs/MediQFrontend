import React from "react";

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  button: string;
  onClick?: () => void;
  accentClass?: string;
}

const FeatureCard = ({ icon, title, description, button, onClick, accentClass = "from-blue-500/20 to-indigo-500/20" }: FeatureCardProps) => {
  return (
    <div className="relative group overflow-hidden bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-xl transition-all duration-300 hover:-translate-y-2 hover:border-white/20 hover:shadow-2xl flex flex-col justify-between text-left h-full">
      {/* Accent glow on hover */}
      <div className={`absolute -inset-px bg-gradient-to-r ${accentClass} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10`} />

      <div>
        <div className="text-4xl mb-4 bg-white/5 w-14 h-14 rounded-xl flex items-center justify-center border border-white/10 group-hover:scale-110 transition duration-300">
          {icon}
        </div>
        <h2 className="text-2xl font-bold text-white mb-2 tracking-tight group-hover:text-blue-400 transition">
          {title}
        </h2>
        <p className="text-gray-400 text-sm leading-relaxed mb-6">
          {description}
        </p>
      </div>

      <button
        onClick={onClick}
        className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 group-hover:border-blue-500/30 group-hover:bg-blue-600 group-hover:text-white text-gray-200 rounded-xl text-sm font-bold transition-all duration-300 transform active:scale-95 text-center mt-auto"
      >
        {button}
      </button>
    </div>
  );
};

export default FeatureCard;
