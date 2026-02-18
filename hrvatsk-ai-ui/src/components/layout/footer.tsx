export function Footer() {
  return (
    <footer className="border-t py-8">
      <div className="container mx-auto max-w-5xl px-4 text-center text-sm text-muted-foreground">
        <p>
          © {new Date().getFullYear()} Hrvatsk-AI. Learn Croatian,
          conversationally.
        </p>
      </div>
    </footer>
  );
}
