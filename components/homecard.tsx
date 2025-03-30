import Image from 'next/image';



interface FeatureCardProps {
  src: string;
  title: string;
  description: string;
  button: string;
}

const FeatureCard = ({ src, title, description, button }: FeatureCardProps) => {
  return (
    <div className="feature py-8 rounded-xs" style={{ backgroundImage: `url(${src})`, backgroundSize: 'cover' }}>
      <div className="p-6 rounded-lg text-center">
        <h2 className="text-2xl font-semibold">{title}</h2>
        <p className="text-gray-400">{description}</p>
        <button className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white">
          {button}
        </button>
      </div>
    </div>
  );
};

export default FeatureCard;
