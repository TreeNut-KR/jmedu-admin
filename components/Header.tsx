import Profile from "@/components/Profile";

export default function Header() {
  return (
    <header className="flex justify-between px-8 py-4">
      <div className="flex items-center gap-4"></div>
      <div className="flex items-center gap-4">
        <Profile />
      </div>
    </header>
  );
}
