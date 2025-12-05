import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, Heart, Users, Globe, Sparkles } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Info className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">Sobre o BíbliaFS</h1>
          <p className="text-muted-foreground text-lg">
            Transformando o estudo bíblico com tecnologia e amor
          </p>
        </div>

        <Card data-testid="card-mission">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-pink-600" />
              Nossa Missão
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-muted-foreground">
              O BíbliaFS nasceu com o propósito de tornar o estudo da Palavra de Deus mais acessível, 
              personalizado e envolvente para pessoas ao redor do mundo.
            </p>
            <p className="text-muted-foreground">
              Acreditamos que a tecnologia pode ser uma ferramenta poderosa para aproximar as pessoas 
              das Escrituras Sagradas, oferecendo recursos modernos sem perder a essência e reverência 
              que a Palavra merece.
            </p>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-4">
          <Card data-testid="card-features">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-600" />
                Recursos Principais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Leitura offline para estudar em qualquer lugar</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Planos de leitura personalizados</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Destaques e anotações coloridas</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Diário de orações com gravação de áudio</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Gamificação e conquistas</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Comunidade para compartilhar insights</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card data-testid="card-languages">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-600" />
                Multilíngue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Disponível em múltiplos idiomas:
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="text-primary">•</span>
                  <span>🇧🇷 Português</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">•</span>
                  <span>🇺🇸 English</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">•</span>
                  <span>🇳🇱 Nederlands</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">•</span>
                  <span>🇪🇸 Español</span>
                </li>
              </ul>
              <p className="text-sm text-muted-foreground mt-4">
                E mais idiomas em desenvolvimento!
              </p>
            </CardContent>
          </Card>
        </div>

        <Card data-testid="card-team">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              100% Gratuito
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-muted-foreground">
              O BíbliaFS é mantido por doações de usuários como você. Nosso compromisso é manter 
              o aplicativo 100% gratuito e acessível para todos que desejam se aproximar da Palavra de Deus.
            </p>
            <p className="text-muted-foreground">
              Desenvolvido com dedicação por uma equipe apaixonada por tecnologia e pela Palavra, 
              trabalhamos continuamente para melhorar sua experiência e adicionar novos recursos.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
