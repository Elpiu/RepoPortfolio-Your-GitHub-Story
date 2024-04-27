export default function Footer() {

  const date = new Date()

  return (
    <footer className="pb-20 px-4 text-center text-gray-500">
      <small className="mb-2 block text-xs">
        &copy; {date.getFullYear()}. All rights reserved.
      </small>
      <p className="text-xs">
        <span className="font-semibold">About this website:</span> built with
        React & Next.js, TypeScript, Tailwind CSS,
        Framer Motion, React Email & Resend, GitHubPages hosting.
      </p>
    </footer>
  );
}
