import { SETTINGS_STRINGS } from './constants';

export function Settings() {
  return (
    <div className="flex h-full flex-1 flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-foreground">
        {SETTINGS_STRINGS.TITLE}
      </h1>
      <p className="mt-4 text-muted-foreground">
        {SETTINGS_STRINGS.DESCRIPTION}
      </p>
    </div>
  );
}

