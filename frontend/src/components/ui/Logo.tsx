import Link from 'next/link';

interface LogoProps {
  href?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

const Logo = ({ href = '/dashboard', size = 'md', showText = true }: LogoProps) => {
  const sizes = {
    sm: { icon: 'w-6 h-6', text: 'text-lg' },
    md: { icon: 'w-8 h-8', text: 'text-xl' },
    lg: { icon: 'w-10 h-10', text: 'text-2xl' },
  };

  const logoContent = (
    <div className="flex items-center space-x-2">
      <div className={`${sizes[size].icon} bg-primary-600 rounded-lg flex items-center justify-center`}>
        <span className={`text-white font-bold ${size === 'sm' ? 'text-sm' : 'text-lg'}`}>A</span>
      </div>
      {showText && (
        <span className={`${sizes[size].text} font-bold text-gray-900`}>AutoReach</span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="flex items-center space-x-2">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
};

export default Logo;
