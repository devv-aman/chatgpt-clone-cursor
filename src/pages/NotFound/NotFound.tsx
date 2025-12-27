import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { NOT_FOUND_STRINGS } from './constants';

export function NotFound() {
  const errorCode = NOT_FOUND_STRINGS.ERROR_CODE;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      {/* Animated 404 */}
      <div className="relative mb-8">
        <h1 className="text-[10rem] font-black leading-none tracking-tighter text-foreground/5 sm:text-[14rem]">
          {errorCode}
        </h1>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex gap-2 sm:gap-4">
            {errorCode.split('').map((char, index) => (
              <span
                key={index}
                className="animate-bounce-letter text-6xl font-black text-foreground sm:text-8xl"
                style={{
                  animationDelay: `${index * 0.15}s`,
                }}
              >
                {char}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Title with wave animation */}
      <h2 className="mb-4 text-center">
        <span className="inline-flex flex-wrap justify-center gap-1">
          {NOT_FOUND_STRINGS.TITLE.split('').map((char, index) => (
            <span
              key={index}
              className={`animate-wave text-2xl font-semibold text-foreground sm:text-3xl ${
                char === ' ' ? 'w-2' : ''
              }`}
              style={{
                animationDelay: `${index * 0.05}s`,
              }}
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </span>
      </h2>

      {/* Description with fade-in */}
      <p className="mb-8 max-w-md animate-fade-in-up text-center text-muted-foreground animation-delay-500">
        {NOT_FOUND_STRINGS.DESCRIPTION}
      </p>

      {/* Animated button */}
      <Button
        asChild
        size="lg"
        className="animate-fade-in-up animation-delay-700"
      >
        <Link to={ROUTES.HOME}>{NOT_FOUND_STRINGS.GO_HOME}</Link>
      </Button>

      {/* Floating particles background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="animate-float absolute rounded-full bg-primary/5"
            style={{
              width: `${Math.random() * 100 + 50}px`,
              height: `${Math.random() * 100 + 50}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${Math.random() * 10 + 10}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

