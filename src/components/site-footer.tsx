export function SiteFooter() {
  return (
    <footer className='text-muted-foreground mx-auto flex w-full max-w-lg flex-wrap items-center justify-center gap-x-4 gap-y-1 px-6 pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-xs'>
      <small className='text-xs'>© 2026 sui</small>
      <a
        href='https://github.com/Suntory-N-Water/caffeine-at-bedtime'
        target='_blank'
        rel='noreferrer'
        className='hover:text-foreground focus-visible:ring-ring/60 rounded-sm underline-offset-2 outline-none hover:underline focus-visible:ring-3'
      >
        GitHub
      </a>
    </footer>
  );
}
