import { HOME_STRINGS } from './constants';

export function Home() {
  return (
    <div className="flex h-full flex-1 flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-foreground">
        {HOME_STRINGS.TITLE}
      </h1>
      <p className="mt-4 text-muted-foreground">{HOME_STRINGS.DESCRIPTION}</p>
    </div>
  );
}

