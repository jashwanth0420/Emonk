export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-[1520px] mx-auto w-full">
      {children}
    </div>
  )
}
