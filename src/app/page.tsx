import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">orbi</h1>
      <p className="text-muted-foreground">Gestão para empresas de controle de pragas</p>
      <Button disabled>Entrar (em breve)</Button>
    </main>
  );
}
