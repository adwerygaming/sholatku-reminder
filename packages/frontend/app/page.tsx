import Link from "next/link";

export default function Home() {
  return (
    <>
      <div className="p-8">
        <h1 className="text-2xl font-bold">Sholatku Web UI</h1>
        <Link href={"/login"}>
          Click here to login
        </Link>
      </div>
    </>
  );
}
