const BASE_STEPS = [
  {
    label: "Run pnpm dev to start the local server",
    link: "https://nextjs.org/docs/app",
    linkLabel: "Next.js App Router docs",
  },
  {
    label: "Edit src/app/page.tsx to match your product",
    link: "https://tailwindcss.com/docs/installation",
    linkLabel: "Tailwind CSS docs",
  },
  {
    label: "Fill in your environment variables (.env.local)",
    link: "https://nextjs.org/docs/app/building-your-application/configuring/environment-variables",
    linkLabel: "Next.js env vars guide",
  },
  {
    label: "Confirm git is initialized and your remote is set",
    link: "https://docs.github.com/get-started/getting-started-with-git/set-up-git",
    linkLabel: "Git setup guide",
  },
  {
    label: "Create a GitHub repo, then add remote origin and push",
    link: "https://docs.github.com/repositories/creating-and-managing-repositories/creating-a-new-repository",
    linkLabel: "Create a GitHub repository",
  },
];

const FEATURE_STEPS = {
  convex: {
    label: "Set up Convex backend",
    link: "https://docs.convex.dev/quickstart/nextjs",
    linkLabel: "Convex quickstart",
  },
  clerk: {
    label: "Configure Clerk authentication",
    link: "https://clerk.com/docs/quickstarts/nextjs",
    linkLabel: "Clerk Next.js quickstart",
  },
  ai: {
    label: "Connect the AI SDK (OpenAI)",
    link: "https://ai-sdk.dev/docs/getting-started/nextjs-app-router",
    linkLabel: "AI SDK Next.js guide",
  },
  sentry: {
    label: "Add Sentry monitoring",
    link: "https://docs.sentry.io/platforms/javascript/guides/nextjs/",
    linkLabel: "Sentry Next.js guide",
  },
  shadcn: {
    label: "Style UI with shadcn components",
    link: "https://ui.shadcn.com/docs/installation/next",
    linkLabel: "shadcn UI installation",
  },
};

function renderStep({ label, link, linkLabel }, index) {
  const stepId = `step-${index}`;
  return `            <li className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3">
              <input
                id="${stepId}"
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-900 text-cyan-400"
              />
              <label htmlFor="${stepId}" className="grid gap-1 text-slate-200">
                <span>${label}</span>
                <a
                  href="${link}"
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-cyan-300 underline-offset-4 hover:underline"
                >
                  ${linkLabel}
                </a>
              </label>
            </li>`;
}

export function getVibStarterPage(features = []) {
  const allSteps = [...BASE_STEPS];

  for (const feature of features) {
    if (FEATURE_STEPS[feature]) {
      allSteps.push(FEATURE_STEPS[feature]);
    }
  }

  const stepsMarkup = allSteps.map(renderStep).join("\n");

  return `export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-6 py-16">
        <header className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
            VIB Starter
          </p>
          <h1 className="text-4xl font-semibold sm:text-5xl">
            Build your next vibe quickly.
          </h1>
          <p className="max-w-2xl text-lg text-slate-300">
            A calm, focused starting point for shipping. Customize this page,
            wire up your stack, and keep the momentum going.
          </p>
        </header>

        <section className="grid gap-6 rounded-2xl border border-slate-800 bg-slate-900/50 p-8">
          <h2 className="text-xl font-semibold">Get moving</h2>
          <ol className="grid gap-3 text-slate-300">
            <li>1. Open <span className="font-mono text-slate-100">src/app/page.tsx</span></li>
            <li>2. Replace this content with your product</li>
            <li>3. Add routes, data, and UI as you go</li>
          </ol>
          <div className="flex flex-wrap gap-3">
            <span className="rounded-full border border-slate-700 px-3 py-1 text-sm text-slate-200">
              Next.js App Router
            </span>
            <span className="rounded-full border border-slate-700 px-3 py-1 text-sm text-slate-200">
              Tailwind CSS
            </span>
            <span className="rounded-full border border-slate-700 px-3 py-1 text-sm text-slate-200">
              VIB Workflow
            </span>
          </div>
        </section>

        <section className="grid gap-4 rounded-2xl border border-slate-800 bg-slate-900/30 p-8">
          <h2 className="text-xl font-semibold">Next steps</h2>
          <p className="text-slate-300">
            Check each step as you finish setup.
          </p>
          <ul className="grid gap-3 text-slate-300">
${stepsMarkup}
          </ul>
        </section>
      </div>
    </main>
  );
}
`;
}
