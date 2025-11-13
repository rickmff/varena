"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  // Log para debug
  useEffect(() => {
    console.log("Auth error page - error param:", error);
    console.log("All search params:", Object.fromEntries(searchParams.entries()));
  }, [error, searchParams]);

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case "Configuration":
        return "Há um problema com a configuração do servidor. Verifique as variáveis de ambiente.";
      case "AccessDenied":
        return "Você não tem permissão para fazer login.";
      case "Verification":
        return "O link de verificação expirou ou já foi usado.";
      case "OAuthAccountNotLinked":
        return "Esta conta já está vinculada a outro método de login.";
      case "OAuthSignin":
        return "Erro ao iniciar autenticação OAuth.";
      case "OAuthCallback":
        return "Erro no callback OAuth.";
      case "OAuthCreateAccount":
        return "Não foi possível criar a conta OAuth.";
      case "EmailCreateAccount":
        return "Não foi possível criar a conta.";
      case "Callback":
        return "Erro no callback de autenticação.";
      case "OAuthAccountNotLinked":
        return "Esta conta já está vinculada a outro método de login.";
      default:
        return error
          ? `Erro: ${error}. Tente novamente.`
          : "Ocorreu um erro ao fazer login. Tente novamente.";
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-destructive">
            Erro de Autenticação
          </CardTitle>
          <CardDescription>
            {getErrorMessage(error)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button asChild className="flex-1">
              <Link href="/auth/signin">Tentar Novamente</Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href="/">Voltar ao Início</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-destructive">
              Erro de Autenticação
            </CardTitle>
            <CardDescription>
              Carregando...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  );
}

